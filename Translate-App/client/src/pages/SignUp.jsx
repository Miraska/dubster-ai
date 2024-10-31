import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { registrationUser } from '../services/api';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const usernameRegex = /^[a-zA-Zа-яА-Я0-9]+$/;

        if (!usernameRegex.test(username)) {
            setError('Имя пользователя может содержать только буквы и цифры.');
            return;
        }

        if (password.length < 4) {
            setError('Пароль должен содержать минимум 4 символа.');
            return;
        }

        // логика регистрации
        console.log('Username:', username);
        console.log('Password:', password);

        try {
            await registrationUser(username, password);
            login();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError('Это имя уже используется.')
                console.error("Bad request:", error.response.data);
            } else {
                console.error("Error during registration:", error);
            }
        }
    };

    return (
        <div className="main_block">
            <div className="container">
                <h2>Регистрация</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="form-label">Имя пользователя:</label>
                        <input
                            type="text"
                            name="username"
                            required
                            className="input"
                            placeholder="Введите ваше имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Пароль:</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="input"
                            placeholder="Введите ваш пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="button">Зарегистрироваться</button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
