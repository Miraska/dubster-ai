import { useContext } from 'react';
import { AuthContext } from '../AuthContext.js';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
};
