import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Header.css';

const HeaderItem = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="header_block">
            <header className="header">
                <div className="logo">
                    <h1>DUBSTER.AI</h1>
                </div>
                <nav className="nav">
                    <ul>
                        {!isAuthenticated ? (
                            <>
                                <li>
                                    <NavLink to="/">Главная</NavLink>
                                </li>

                                <li>
                                    <NavLink to="/sign-in">Вход</NavLink>
                                </li>

                                <li>
                                    <NavLink to="/sign-up">Регистрация</NavLink>
                                </li>
                            </>
                        ) : (
                            <li>
                                <button onClick={logout} className="logout-button">
                                    Выйти
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </header>
        </div>
    );
};

export default HeaderItem;
