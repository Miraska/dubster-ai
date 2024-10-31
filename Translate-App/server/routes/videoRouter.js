const express = require('express');
const { exec } = require('child_process');
const authMiddleware = require('../middlewares/authMiddleware.js');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { PassThrough } = require('stream');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Настройка клиента S3
const s3Client = new S3Client({
  region: 'ru-central1',
  endpoint: 'https://storage.yandexcloud.net',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
});

// Функция для загрузки потока данных в Yandex Cloud
async function uploadStreamToYandexCloud(bucketName, key, stream) {
  const pass = new PassThrough();
  stream.pipe(pass);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: pass,
    ACL: 'public-read',
  });

  try {
    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error('Ошибка при загрузке:', error);
    throw error;
  }
}

// Проверка существования файла
async function checkIfVideoExists(bucketName, key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      console.log(`Файл не найден: ${key}`);
      return false;
    }
    console.error('Ошибка при проверке файла в облаке:', error);
    throw error;
  }
}

router.post('/process-link', authMiddleware, async (req, res) => {
  try {
    console.log("Начало обработки видео!");
    const youtubeLink = req.body.videoUrl;

    if (!youtubeLink) {
      return res.status(400).send('Ссылка на видео не указана.');
    }

    const userId = req.user.id;
    const userVideosDir = path.join('../', 'videos', userId);
    await fs.mkdir(userVideosDir, { recursive: true });

    // Пути к файлам
    const videoOutput = path.join(userVideosDir, 'video.mp4');
    const audioOutput = path.join(userVideosDir, 'translated_audio.mp3');
    const finalOutput = path.join(userVideosDir, 'output_video.mp4');

    // Скачивание видео с помощью ytdlp
    const downloadCommand = `yt-dlp -f mp4 -o "${videoOutput}" "${youtubeLink}"`;
    exec(downloadCommand, (downloadError, stdout, stderr) => {
      if (downloadError) {
        return res.status(500).send('Ошибка при скачивании видео');
      }

      // Перевод видео с помощью vot-cli
      const votCommand = `vot-cli "${youtubeLink}"`;
      exec(votCommand, (votError, votStdout, votStderr) => {
        if (votError) {
          console.error('Ошибка при обработке аудио:', votStderr || votError.message);
          return res.status(500).send('Ошибка обработки аудио');
        }


        const match = votStdout.match(/"(https:\/\/vtrans\S+\.mp3\?[^"]+)"/);
        if (!match || !match[1]) {
          console.error('Ошибка при извлечении ссылки на аудио');
          return res.status(500).send('Ошибка при обработке аудио');
        }

        const audioUrl = match[1];

        // Скачивание нового аудио
        const curlCommand = `curl -o "${audioOutput}" "${audioUrl}"`;
        exec(curlCommand, (audioDownloadError, audioStdout, audioStderr) => {
          if (audioDownloadError) {
            console.error('Ошибка при скачивании аудио:', audioStderr || audioDownloadError.message);
            return res.status(500).send('Ошибка при скачивании аудио');
          }


          // Объединение видео и аудио с помощью ffmpeg
          const ffmpegCommand = `ffmpeg -i "${videoOutput}" -i "${audioOutput}" -map 0:v -map 1:a -b:v 2M -b:a 192k -c:v libx264 -c:a aac -movflags +faststart "${finalOutput}"`;
          exec(ffmpegCommand, async (ffmpegError, ffmpegStdout, ffmpegStderr) => {
            if (ffmpegError) {
              console.error('Ошибка при обработке видео:', ffmpegStderr || ffmpegError.message);
              return res.status(500).send('Ошибка при обработке видео');
            }


            // Загрузка итогового видео в Yandex Object Storage
            try {
              const fileStream = await fs.open(finalOutput, 'r').then(file => file.createReadStream());
              await uploadStreamToYandexCloud('dubster', `${userId}/output_video.mp4`, fileStream);
            } catch (uploadError) {
              console.error('Ошибка при загрузке видео в Yandex Cloud:', uploadError);
              return res.status(500).send('Ошибка при загрузке видео в облако');
            }

            // Удаление временных файлов
            try {
              deleteFilesInDirectory(userVideosDir);
            } catch (deleteError) {
              console.error('Ошибка при удалении временных файлов:', deleteError);
            }

            // Отправка ссылки на загруженное видео
            const videoUrl = `https://storage.yandexcloud.net/dubster/${userId}/output_video.mp4`;
            res.json({ videoUrl });
            console.log("Видео загружено!");
          });
        });
      });
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});



router.get('/check-video-exists', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const videoKey = `${userId}/output_video.mp4`;

    const exists = await checkIfVideoExists('dubster', videoKey);
    if (exists) {
      res.status(200).json({ exists: true, videoUrl: `https://storage.yandexcloud.net/dubster/${videoKey}` });
    } else {
      res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Ошибка при проверке наличия видео:', error.message);
    res.status(500).json({ error: 'Не удалось проверить наличие видео. Пожалуйста, повторите попытку позже.' });
  }
});

router.get('/fetch', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const videoPath = `https://storage.yandexcloud.net/dubster/${userId}/output_video.mp4`;
  res.send(videoPath);
});

// Удаление временных файлов
async function deleteFilesInDirectory(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stat = await fs.lstat(filePath);

      if (stat.isFile()) {
        await fs.unlink(filePath);
        console.log(`Файл ${file} успешно удален.`);
      }
    }

    console.log('Все файлы в директории успешно удалены.');
  } catch (error) {
    console.error('Ошибка при удалении файлов:', error);
  }
}


module.exports = router;
