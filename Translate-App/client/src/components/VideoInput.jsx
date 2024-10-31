import React from 'react';

const VideoInput = ({ videoUrl, setVideoUrl }) => (
  <input
    type="text"
    placeholder="Введите URL видео с YouTube"
    value={videoUrl || ''}
    onChange={(e) => setVideoUrl(e.target.value)}
    className="input"
  />
);

export default VideoInput;
