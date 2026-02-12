import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'SuperAdmin', // Default for initial setup
        schoolId: null
    });

    const { register: registerUser, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await registerUser(formData);
        // Redirect logic handled in App.jsx via isAuthenticated check
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at bottom left, #2a2a72, #009ffd 0%, #000 70%)'
        }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '60px', height: '60px',
                        background: 'linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--primary)))',
                        borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '10px', boxShadow: '0 0 20px rgba(var(--secondary), 0.6)'
                    }}>
                        <FaUserPlus size={30} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Join EduSphere</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Create your account to get started</p>
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
                        <label className="input-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FaUser style={{ position: 'absolute', left: '15px', top: '15px', color: 'hsl(var(--text-dim))' }} />
                            <input
                                type="text"
                                name="name"
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaEnvelope style={{ position: 'absolute', left: '15px', top: '15px', color: 'hsl(var(--text-dim))' }} />
                            <input
                                type="email"
                                name="email"
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
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
                                name="password"
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select name="role" className="input-field" value={formData.role} onChange={handleChange}>
                            <option value="SuperAdmin">Super Admin</option>
                            <option value="Admin">Admin (Principal)</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Student">Student</option>
                            <option value="Parent">Parent</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '30px', color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>
                    Already have an account? <a href="/login" style={{ color: 'hsl(var(--secondary))', fontWeight: 'bold' }}>Sign In</a>
                </div>
            </div>
        </div>
    );
};

export default Register;
