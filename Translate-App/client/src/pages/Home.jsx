import React, { useState, useEffect } from 'react';
import { checkVideoExists } from '../services/api';
import { checkAuth } from '../services/api';
import { isValidYoutubeUrl } from '../utils/validations';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

import VideoInput from '../components/VideoInput';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useVideo from '../hooks/useVideo';

import '../styles/App.css';

const Home = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { translatedVideo, setTranslatedVideo, loading, handleTranslate, getVideo } = useVideo(videoUrl);
    const { login } = useAuth();

    useEffect(() => {
        const checkUserAuth = async () => {
            const isUserAuthenticated = await checkAuth();
            if (isUserAuthenticated) {
                setIsAuthenticated(true);
                login();
            }
        };

        checkUserAuth();
    }, [login]);

    useEffect(() => {
        if (isAuthenticated) {
            const validateVideoExists = async () => {
                try {
                    const exists = await checkVideoExists();
                    if (exists) {
                        getVideo();
                    }
                } catch {
                    setTranslatedVideo('');
                    setIsAuthenticated(false);
                }
            };

            validateVideoExists();
        }
    }, [isAuthenticated, getVideo, setTranslatedVideo]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!loading) return;
            const message = 'Вы уверены, что хотите покинуть страницу? Все несохраненные данные будут потеряны.';
            event.returnValue = message;
            return message;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [loading]);

    const handleTranslateClick = () => {
        if (!isValidYoutubeUrl(videoUrl)) {
            alert('Введите корректный URL видео с YouTube.');
            setError('Введите корректный URL видео с YouTube.');
            return;
        }
        setError('');
        handleTranslate();
    };

    const text = "Пожалуйста, авторизуйтесь для доступа к переводу видео".split(" ");

    if (!isAuthenticated) {
        return (
            <div className="main_block">
                <div className="container">
                    <div className="home__text">
                        {text.map((el, i) => (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                
                                transition={{
                                    duration: 0.5,
                                    delay: i / 10,
                                }}
                                key={i}
                            >
                                {el}{" "}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
    );
};

export default Home;