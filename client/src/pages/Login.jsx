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
            padding: '20px'
        }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                        borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                    }}>
                        <FaSchool size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>
                        <span className="gradient-text">Welcome Back</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem' }}>Sign in to MR. EduEdge Portal</p>
                </div>

                {error && (
                    <div className="alert-error" style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        color: '#ff4d4d',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Email / Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '52px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '12px' }}>
                        <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '52px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <a href="#" style={{ fontSize: '0.9rem', color: 'hsl(var(--secondary))', textDecoration: 'none' }}>Forgot password?</a>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', marginTop: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        Sign In to Dashboard
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '32px', color: 'hsl(var(--text-dim))', fontSize: '1rem' }}>
                    Don't have an account? <a href="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 'bold', textDecoration: 'none' }}>Register School</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
