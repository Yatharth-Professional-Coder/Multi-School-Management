import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { FaSchool, FaMapMarkerAlt, FaPhone, FaUserTie, FaEnvelope, FaLock, FaLayerGroup } from 'react-icons/fa';
import '../styles/global.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        subscriptionPlan: 'Basic',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/schools/register', formData);
            alert('School registered successfully! You can now login with the Principal credentials.');
            navigate('/login');
        } catch (err) {
            setError(err.response && err.response.data.message ? err.response.data.message : 'Error registering school');
        }
    };

    return (
        <div className="register-wrapper" style={{
            background: 'var(--bg-gradient)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px'
        }}>
            <div className="glass-panel fade-in" style={{
                padding: '40px',
                width: '100%',
                maxWidth: '600px'
            }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
                        borderRadius: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                    }}>
                        <FaSchool size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>
                        <span className="gradient-text">Register Your School</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.1rem' }}>Join the MR. EduEdge ecosystem today</p>
                </div>

                {error && (
                    <div className="alert-error" style={{
                        background: 'rgba(255, 77, 77, 0.1)',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        color: '#ff4d4d',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '30px',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>School Name</label>
                            <div style={{ position: 'relative' }}>
                                <FaSchool style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Bright Future School"
                                    className="input-field"
                                    style={{ paddingLeft: '48px' }}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Contact Number</label>
                            <div style={{ position: 'relative' }}>
                                <FaPhone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                                <input
                                    type="text"
                                    name="contact"
                                    placeholder="+91 XXXXX XXXXX"
                                    className="input-field"
                                    style={{ paddingLeft: '48px' }}
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>School Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaMapMarkerAlt style={{ position: 'absolute', left: '16px', top: '15px', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                            <textarea
                                name="address"
                                placeholder="Enter complete school address"
                                className="input-field"
                                style={{ paddingLeft: '48px', minHeight: '80px', paddingTop: '12px' }}
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Choose Subscription Plan</label>
                        <div style={{ position: 'relative' }}>
                            <FaLayerGroup style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                            <select
                                name="subscriptionPlan"
                                className="input-field"
                                style={{ paddingLeft: '48px', appearance: 'auto' }}
                                value={formData.subscriptionPlan}
                                onChange={handleChange}
                                required
                            >
                                <option value="Basic">Basic Plan (Up to 500 Students)</option>
                                <option value="Standard">Standard Plan (Up to 2000 Students)</option>
                                <option value="Premium">Premium Plan (Unlimited)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <p style={{ marginBottom: '16px', color: 'hsl(var(--secondary))', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Principal Credentials</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FaUserTie style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                                    <input
                                        type="text"
                                        name="adminName"
                                        placeholder="Admin Name"
                                        className="input-field"
                                        style={{ paddingLeft: '48px' }}
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FaEnvelope style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        placeholder="admin@school.com"
                                        className="input-field"
                                        style={{ paddingLeft: '48px' }}
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.6 }} />
                                <input
                                    type="password"
                                    name="adminPassword"
                                    placeholder="••••••••"
                                    className="input-field"
                                    style={{ paddingLeft: '48px' }}
                                    value={formData.adminPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            height: '52px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            marginTop: '10px'
                        }}
                    >
                        Complete Registration
                    </button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', color: 'hsl(var(--text-dim))', fontSize: '1rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
