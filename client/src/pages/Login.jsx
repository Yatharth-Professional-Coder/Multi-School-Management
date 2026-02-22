import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import '../styles/global.css'; // Ensure global styles are imported somewhere
import { FaSchool, FaEnvelope, FaLock, FaKey } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [infoMessage, setInfoMessage] = useState('');

    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    // Forgot Password Flow State
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        setForgotMessage('');
        setForgotError('');
        setIsLoading(true);
        try {
            const { data } = await api.post('/api/auth/forgot-password', { email });
            setForgotMessage(data.message);
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Error requesting password reset');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setForgotMessage('');
        setForgotError('');
        setIsLoading(true);
        try {
            const { data } = await api.post('/api/auth/reset-password', { email, otp, newPassword });
            setForgotMessage(data.message);
            // After successful password reset, go back to login mode
            setTimeout(() => {
                setForgotPasswordMode(false);
                setForgotStep(1);
                setOtp('');
                setNewPassword('');
                setForgotMessage('');
            }, 3000); // Wait 3 seconds to show success message before switching
        } catch (err) {
            setForgotError(err.response?.data?.message || 'Error resetting password');
        } finally {
            setIsLoading(false);
        }
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
                        <span className="gradient-text">{forgotPasswordMode ? 'Reset Password' : 'Welcome Back'}</span>
                    </h1>
                    <p className="login-subtitle">
                        {forgotPasswordMode ? 'Follow the steps to reset your entry access' : <>Sign in to <span style={{ color: 'hsl(var(--white))' }}>MR. EduEdge</span> Portal</>}
                    </p>
                </div>

                {!forgotPasswordMode && error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                {!forgotPasswordMode && infoMessage && (
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

                {forgotPasswordMode && forgotError && (
                    <div className="alert-error" style={{ marginBottom: '15px' }}>
                        {forgotError}
                    </div>
                )}

                {forgotPasswordMode && forgotMessage && (
                    <div className="alert-success" style={{
                        background: 'rgba(100, 255, 100, 0.1)',
                        border: '1px solid rgba(100, 255, 100, 0.2)',
                        color: '#64ff96',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}>
                        {forgotMessage}
                    </div>
                )}

                {forgotPasswordMode ? (
                    forgotStep === 1 ? (
                        <form onSubmit={handleForgotPasswordRequest}>
                            <div className="input-group">
                                <label className="input-label">Account Email</label>
                                <div style={{ position: 'relative' }}>
                                    <FaEnvelope className="login-input-icon" />
                                    <input
                                        type="email"
                                        className="input-field login-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter the email associated with your account"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading} style={{ marginTop: '20px' }}>
                                {isLoading ? 'Sending OTP...' : 'Send OTP via Email'}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button type="button" onClick={() => { setForgotPasswordMode(false); setForgotError(''); setForgotMessage(''); }} style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', fontWeight: '600', transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordReset}>
                            <div className="input-group">
                                <label className="input-label">OTP Code</label>
                                <div style={{ position: 'relative' }}>
                                    <FaKey className="login-input-icon" />
                                    <input
                                        type="text"
                                        className="input-field login-input"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="input-group" style={{ marginTop: '15px' }}>
                                <label className="input-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <FaLock className="login-input-icon" />
                                    <input
                                        type="password"
                                        className="input-field login-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading} style={{ marginTop: '20px' }}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <button type="button" onClick={() => { setForgotStep(1); setForgotError(''); setForgotMessage(''); }} style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', fontWeight: '600', transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Didn't get an email? Try again
                                </button>
                            </div>
                        </form>
                    )
                ) : (
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
                                    onClick={() => setForgotPasswordMode(true)}
                                    style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', fontWeight: '600', transition: 'opacity 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary login-btn">
                            Sign In to Dashboard
                        </button>
                    </form>
                )}

                {!forgotPasswordMode && (
                    <div className="login-footer">
                        Don't have an account? <a href="/register" style={{
                            color: 'hsl(var(--primary))', fontWeight: '700', textDecoration: 'none',
                            marginLeft: '5px'
                        }}>Register School</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
