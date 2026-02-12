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
        <div className="login-container" style={{
            background: 'radial-gradient(circle at bottom left, #2a2a72, #009ffd 0%, #000 70%)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff'
        }}>
            <div className="glass-panel fade-in" style={{
                padding: '3rem',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <FaSchool size={50} color="#00d4ff" />
                    <h2 style={{ marginTop: '1rem', fontSize: '2rem', fontWeight: 'bold' }}>Register School</h2>
                    <p style={{ color: '#ccc' }}>Create a new school and admin account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(255, 77, 77, 0.2)',
                        color: '#ff4d4d',
                        padding: '10px',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 77, 77, 0.3)'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* School Name */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaSchool style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="text"
                            name="name"
                            placeholder="School Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Address */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaMapMarkerAlt style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="text"
                            name="address"
                            placeholder="School Address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Contact */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaPhone style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="text"
                            name="contact"
                            placeholder="Contact Number"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Subscription Plan */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaLayerGroup style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <select
                            name="subscriptionPlan"
                            value={formData.subscriptionPlan}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                appearance: 'none' // Removes default arrow
                            }}
                        >
                            <option value="Basic" style={{ color: '#000' }}>Basic Plan</option>
                            <option value="Standard" style={{ color: '#000' }}>Standard Plan</option>
                            <option value="Premium" style={{ color: '#000' }}>Premium Plan</option>
                        </select>
                        <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#00d4ff', fontStyle: 'italic' }}>
                            For pricing and details, contact: +91 8571099660
                        </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '20px 0', paddingTop: '20px' }}>
                        <p style={{ marginBottom: '15px', color: '#aaa', fontSize: '0.9rem' }}>Principal / Admin Details</p>
                    </div>

                    {/* Admin Name */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaUserTie style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="text"
                            name="adminName"
                            placeholder="Principal Name"
                            value={formData.adminName}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Admin Email */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaEnvelope style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="email"
                            name="adminEmail"
                            placeholder="Principal Email"
                            value={formData.adminEmail}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Admin Password */}
                    <div className="input-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#00d4ff' }} />
                        <input
                            type="password"
                            name="adminPassword"
                            placeholder="Password"
                            value={formData.adminPassword}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 114, 255, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Register School
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: '#ccc' }}>
                    Already have an account? <Link to="/login" style={{ color: '#00d4ff', textDecoration: 'none', fontWeight: 'bold' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
