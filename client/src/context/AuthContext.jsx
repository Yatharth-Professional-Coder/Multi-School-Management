import { createContext, useReducer, useEffect } from 'react';
import api from '../utils/api';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
};

const AuthContext = createContext();

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case 'LOGIN_FAIL':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: true,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user from local storage on mount (if implementing persistence)
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
            dispatch({ type: 'LOGOUT' }); // Stop loading
        }
    }, []);

    // Inject School Theme Color
    useEffect(() => {
        if (state.user?.schoolSettings?.themeColor) {
            document.documentElement.style.setProperty('--primary-hex', state.user.schoolSettings.themeColor);
            // Also override the --primary HSL variable for components using it
            // Note: This is an approximation. Ideally we'd convert hex to HSL, 
            // but for now, we'll use the hex directly for custom components.
        } else {
            document.documentElement.style.removeProperty('--primary-hex');
        }
    }, [state.user]);

    const login = async (email, password) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const { data } = await api.post('/api/auth/login', { email, password });

            localStorage.setItem('user', JSON.stringify(data));
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response && err.response.data.message ? err.response.data.message : err.message,
            });
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'SET_LOADING' });
        try {
            const { data } = await api.post('/api/auth/register', userData);
            localStorage.setItem('user', JSON.stringify(data));
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        } catch (err) {
            dispatch({
                type: 'LOGIN_FAIL',
                payload: err.response && err.response.data.message ? err.response.data.message : err.message,
            });
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
