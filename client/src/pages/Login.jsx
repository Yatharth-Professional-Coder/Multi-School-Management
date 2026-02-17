import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/global.css'; // Ensure global styles are imported somewhere
import { FaSchool, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
        // Navigation should ideally happen in useEffect dependent on user state, 
        // but for simplicity we rely on AuthContext updating state and App.jsx redirecting
        // or manual redirect here if successful (requires promise from login).
        // Let's implement redirect in App.jsx or here after check.
    };

    return (
        <div className="login-wrapper">
            {/* Ambient Background Glows */}
            <div className="login-blob-1"></div>
            <div className="login-blob-2"></div>

            <div className="glass-panel fade-in login-card-container">
                <div className="login-header">
                    <div className="login-logo-wrapper">
                        <img src="/logo.png" alt="MR. EduEdge" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 className="login-title">
                        <span className="gradient-text">Welcome Back</span>
                    </h1>
                    <p className="login-subtitle">
                        Sign in to <span style={{ color: 'hsl(var(--white))' }}>MR. EduEdge</span> Portal
                    </p>
                </div>

                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                {infoMessage && (
                    <div className="alert-info" style={{
                        background: 'rgba(54, 162, 235, 0.1)',
                        border: '1px solid rgba(54, 162, 235, 0.2)',
                        color: 'rgb(54, 162, 235)',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        {infoMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email / Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope className="login-input-icon" />
                            <input
                                type="text"
                                className="input-field login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock className="login-input-icon" />
                            <input
                                type="password"
                                className="input-field login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '12px' }}>
                            <button
                                type="button"
                                onClick={() => setInfoMessage('Ask your teacher or administrative staff to reset it for you')}
                                style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', fontWeight: '600', transition: 'opacity 0.2s' }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn">
                        Sign In to Dashboard
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account? <a href="/register" style={{
                        color: 'hsl(var(--primary))', fontWeight: '700', textDecoration: 'none',
                        marginLeft: '5px'
                    }}>Register School</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
