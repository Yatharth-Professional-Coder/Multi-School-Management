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
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, #2a2a72, #009ffd 0%, #000 70%)'
        }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                        borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '10px', boxShadow: '0 0 20px rgba(var(--primary), 0.6)'
                    }}>
                        <FaSchool size={30} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Sign in to access your dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 50, 50, 0.1)',
                        border: '1px solid rgba(255, 50, 50, 0.3)',
                        color: '#ff6b6b',
                        padding: '12px',
                        borderRadius: 'var(--radius)',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email / Username</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '15px', top: '15px', color: 'hsl(var(--text-dim))' }} />
                            <input
                                type="text"
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email or Username"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{ position: 'absolute', left: '15px', top: '15px', color: 'hsl(var(--text-dim))' }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                            <a href="#" style={{ fontSize: '0.9rem', color: 'hsl(var(--accent))' }}>Forgot password?</a>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Sign In
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '30px', color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>
                    Don't have an account? <a href="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>Register School</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
