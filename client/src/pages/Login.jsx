import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/global.css'; // Ensure global styles are imported somewhere
import { FaSchool, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
        <div className="login-wrapper" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'var(--bg-gradient)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute', width: '40vw', height: '40vw',
                top: '-20vw', right: '-10vw',
                background: 'radial-gradient(circle, hsla(var(--primary), 0.15) 0%, transparent 70%)',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute', width: '50vw', height: '50vw',
                bottom: '-20vw', left: '-10vw',
                background: 'radial-gradient(circle, hsla(var(--accent), 0.1) 0%, transparent 70%)',
                zIndex: 0
            }}></div>

            <div className="glass-panel fade-in" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '48px',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '100px', height: '100px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '10px'
                    }}>
                        <img src="/logo.png" alt="EduEdge" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1.5px' }}>
                        <span className="gradient-text">Welcome Back</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem', fontWeight: '500' }}>
                        Sign in to <span style={{ color: 'hsl(var(--white))' }}>EduEdge</span> Portal
                    </p>
                </div>

                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email / Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                color: 'hsl(var(--primary))', opacity: 0.8, fontSize: '1.1rem'
                            }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '56px' }}
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
                            <FaLock style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                color: 'hsl(var(--primary))', opacity: 0.8, fontSize: '1.1rem'
                            }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '56px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '12px' }}>
                            <a href="#" style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', fontWeight: '600', transition: 'opacity 0.2s' }}>
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{
                        width: '100%', height: '56px', marginTop: '24px',
                        fontSize: '1.2rem', fontWeight: 'bold',
                        borderRadius: 'var(--radius-sm)'
                    }}>
                        Sign In to Dashboard
                    </button>
                </form>

                <div style={{
                    textAlign: 'center', marginTop: '40px',
                    color: 'hsl(var(--text-dim))', fontSize: '1rem',
                    paddingTop: '32px', borderTop: '1px solid var(--glass-border)'
                }}>
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
