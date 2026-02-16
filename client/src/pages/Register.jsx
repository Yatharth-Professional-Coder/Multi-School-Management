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
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient Background Glows */}
            <div style={{
                position: 'absolute', width: '50vw', height: '50vw',
                top: '-10vw', left: '-10vw',
                background: 'radial-gradient(circle, hsla(var(--primary), 0.12) 0%, transparent 70%)',
                zIndex: 0
            }}></div>

            <div className="glass-panel fade-in" style={{
                padding: '48px',
                width: '100%',
                maxWidth: '750px',
                zIndex: 1,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>

                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px', border: '1px solid var(--glass-border)'
                    }}>
                        <img src="/logo.png" alt="EduEdge" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1.5px' }}>
                        <span className="gradient-text">Register Your School</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '1.2rem', fontWeight: '500' }}>
                        Join the <span style={{ color: 'hsl(var(--white))' }}>EduEdge</span> ecosystem today
                    </p>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        <div className="input-group" style={{ marginBottom: '0' }}>
                            <label className="input-label">School Name</label>
                            <div style={{ position: 'relative' }}>
                                <FaSchool style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Bright Future School"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '56px' }}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '0' }}>
                            <label className="input-label">Contact Number</label>
                            <div style={{ position: 'relative' }}>
                                <FaPhone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                                <input
                                    type="text"
                                    name="contact"
                                    placeholder="+91 XXXXX XXXXX"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '56px' }}
                                    value={formData.contact}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '24px' }}>
                        <label className="input-label">School Address</label>
                        <div style={{ position: 'relative' }}>
                            <FaMapMarkerAlt style={{ position: 'absolute', left: '16px', top: '16px', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                            <textarea
                                name="address"
                                placeholder="Enter complete school address"
                                className="input-field"
                                style={{ paddingLeft: '48px', minHeight: '100px', paddingTop: '14px' }}
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: '32px' }}>
                        <label className="input-label">Choose Subscription Plan</label>
                        <div style={{ position: 'relative' }}>
                            <FaLayerGroup style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                            <select
                                name="subscriptionPlan"
                                className="input-field"
                                style={{ paddingLeft: '48px', height: '56px', appearance: 'auto' }}
                                value={formData.subscriptionPlan}
                                onChange={handleChange}
                                required
                            >
                                <option value="Basic">Basic Plan (Up to 500 Students)</option>
                                <option value="Standard">Standard Plan (Up to 2000 Students)</option>
                                <option value="Premium">Premium Plan (Unlimited Access)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{
                        marginBottom: '32px', padding: '32px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <p style={{
                            marginBottom: '24px', color: 'hsl(var(--secondary))',
                            fontWeight: '800', fontSize: '0.85rem',
                            textTransform: 'uppercase', letterSpacing: '1.5px'
                        }}>Principal Credentials</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="input-group" style={{ marginBottom: '0' }}>
                                <label className="input-label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <FaUserTie style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                                    <input
                                        type="text"
                                        name="adminName"
                                        placeholder="Admin Name"
                                        className="input-field"
                                        style={{ paddingLeft: '48px', height: '52px' }}
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '0' }}>
                                <label className="input-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FaEnvelope style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        placeholder="admin@school.com"
                                        className="input-field"
                                        style={{ paddingLeft: '48px', height: '52px' }}
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '24px', marginBottom: '0' }}>
                            <label className="input-label">Create Secure Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))', opacity: 0.8 }} />
                                <input
                                    type="password"
                                    name="adminPassword"
                                    placeholder="••••••••"
                                    className="input-field"
                                    style={{ paddingLeft: '48px', height: '52px' }}
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
                            height: '56px',
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            marginTop: '8px',
                            borderRadius: 'var(--radius-sm)'
                        }}
                    >
                        Complete School Registration
                    </button>
                </form>

                <p style={{
                    marginTop: '40px', textAlign: 'center',
                    color: 'hsl(var(--text-dim))', fontSize: '1.1rem',
                    paddingTop: '32px', borderTop: '1px solid var(--glass-border)'
                }}>
                    Already have an account? <Link to="/login" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: '800', marginLeft: '5px' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
