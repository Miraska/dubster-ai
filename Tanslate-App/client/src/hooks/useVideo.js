import { useState } from 'react';
import { fetchData } from '../services/api';

import axios from 'axios';

const useVideo = (videoUrl) => {
  const [translatedVideo, setTranslatedVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getVideo = async () => {
    setTranslatedVideo(await fetchData());
  }

  const handleTranslate = async () => {
    setError('');
    if (!videoUrl) {
      setError('Пожалуйста, введите URL видео с YouTube.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/videos/process-link', { videoUrl });
      setTranslatedVideo(response.data.videoUrl);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Произошла ошибка.');
    } finally {
      setLoading(false);
    }
  };

  return { translatedVideo, setTranslatedVideo, loading, error, handleTranslate, getVideo };
};

export default useVideo;
