import React from 'react';

const VideoPlayer = ({ translatedVideo }) => (
  <div className="translation">
    <h2>Перевод:</h2>
    <video controls className='video_translated'>
      <source src={translatedVideo} type="video/mp4" />
      Ваш браузер не поддерживает видео.
    </video>
    <a href={translatedVideo} className='button' download>
      Скачать видео
    </a>
  </div>
);

export default VideoPlayer;
