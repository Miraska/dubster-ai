import React from 'react';

import VideoInput from '../components/VideoInput';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MainBlock = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState('');
    const { translatedVideo, setTranslatedVideo, loading, handleTranslate, getVideo } = useVideo(videoUrl);
    const { login } = useAuth();
    
    return (
        <div className="main_block">
            <div className="container">
                <h2>Перевод видео с YouTube</h2>
                <VideoInput videoUrl={videoUrl} setVideoUrl={setVideoUrl} />
                <ErrorMessage message={error} />
                <button onClick={handleTranslateClick} className="button" disabled={loading}>
                    {loading ? <LoadingSpinner /> : 'Перевести видео'}
                </button>
                {translatedVideo && !loading && <VideoPlayer translatedVideo={translatedVideo} />}
            </div>
        </div>
    )
}

export default MainBlock;
// пока не используется