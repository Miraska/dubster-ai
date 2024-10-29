import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import authMiddleware from '../middlewares/authMiddleware.js';
import { checkVideoExists, deleteFiles } from '../services/videoService.js';

const router = express.Router();
const videosDir = path.resolve('videos');

router.use('/videos', express.static(videosDir));

router.post('/process-link', authMiddleware, async (req, res) => {
  try {
    console.log("Начало обработки видео!");
    const youtubeLink = req.body.videoUrl;

    if (!youtubeLink) {
      return res.status(400).send('Ссылка на видео не указана.');
    }

    const userId = req.user.id;
    const userVideosDir = path.join(videosDir, userId);
    await fs.mkdir(userVideosDir, { recursive: true });

    await deleteFiles(userVideosDir);

    const videoOutput = path.join(userVideosDir, 'video.mp4');
    const downloadCommand = `yt-dlp -f mp4 -o "${videoOutput}" "${youtubeLink}"`;

    exec(downloadCommand, (downloadError) => {
      if (downloadError) {
        return res.status(500).send('Ошибка при скачивании видео');
      }

      exec(`vot-cli "${youtubeLink}"`, (votError, stdout) => {
        if (votError) {
          return res.status(500).send('Ошибка обработки аудио');
        }

        const match = stdout.match(/"(https:\/\/vtrans\S+\.mp3\?[^"]+)"/);
        if (!match || !match[1]) {
          return res.status(500).send('Ошибка при обработке аудио');
        }

        const audioUrl = match[1];
        const audioOutput = path.join(userVideosDir, 'new_audio.mp3');

        exec(`curl -o "${audioOutput}" "${audioUrl}"`, (audioDownloadError) => {
          if (audioDownloadError) {
            return res.status(500).send('Ошибка при скачивании аудио');
          }

          const finalOutput = path.join(userVideosDir, 'output_video.mp4');
          const ffmpegCommand = `ffmpeg -i "${videoOutput}" -i "${audioOutput}" -filter_complex "[0:a]volume=0.5[a0];[1:a][a0]amix=inputs=2:duration=first:dropout_transition=3" -map 0:v -map "[1:a]" -b:v 2M -b:a 192k -c:v libx264 -c:a aac -movflags +faststart "${finalOutput}"`;

          exec(ffmpegCommand, (ffmpegError) => {
            if (ffmpegError) {
              return res.status(500).send('Ошибка при обработке видео');
            }

            res.json({ videoUrl: `http://localhost:3001/videos/${userId}/output_video.mp4` });
            console.log("Обработка видео завершена!");
          });
        });
      });
    });
  } catch (error) {
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

router.get('/check-video-exists', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userVideosDir = path.join(videosDir, userId);
    const exists = await checkVideoExists(userVideosDir);
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ error: 'Не удалось проверить наличие видео' });
  }
});

router.get('/fetch', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const videoPath = `http://localhost:3001/videos/${userId}/output_video.mp4`;
  res.send(videoPath);
});

export default router;
