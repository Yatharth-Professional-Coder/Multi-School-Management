import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { FaLock, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const { user } = useContext(AuthContext);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                '/api/auth/change-password',
                { oldPassword, newPassword },
                config
            );

            setMessage({ type: 'success', text: data.message });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div className="glass-panel fade-in" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '30px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }} onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        color: 'hsl(var(--text-dim))',
                        fontSize: '1.2rem',
                        transition: 'color 0.2s'
                    }}
                >
                    <FaTimes />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Change Password</h2>
                    <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>
                        Ensure your account stays secure
                    </p>
                </div>

                {message.text && (
                    <div className={message.type === 'error' ? 'alert-error' : 'alert-info'} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'center',
                        background: message.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 'rgba(54, 162, 235, 0.1)',
                        border: `1px solid ${message.type === 'error' ? 'rgba(255, 77, 77, 0.2)' : 'rgba(54, 162, 235, 0.2)'}`,
                        color: message.type === 'error' ? '#ff4d4d' : 'rgb(54, 162, 235)',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {message.type === 'error' ? <FaExclamationCircle /> : <FaCheckCircle />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                color: 'hsl(var(--primary))', opacity: 0.8
                            }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '48px' }}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                color: 'hsl(var(--secondary))', opacity: 0.8
                            }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '48px' }}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <FaLock style={{
                                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                                color: 'hsl(var(--accent))', opacity: 0.8
                            }} />
                            <input
                                type="password"
                                className="input-field"
                                style={{ paddingLeft: '48px' }}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', height: '50px', marginTop: '10px' }}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
