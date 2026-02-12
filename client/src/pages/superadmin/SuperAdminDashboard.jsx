import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaPlus, FaSchool } from 'react-icons/fa';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [schools, setSchools] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', address: '', contact: '', subscriptionPlan: 'Basic',
        adminName: '', adminEmail: '', adminPassword: ''
    });

    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };

    const fetchSchools = async () => {
        try {
            const { data } = await api.get('/api/schools', config);
            setSchools(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/schools', formData, config);
            setShowForm(false);
            fetchSchools();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error creating school');
        }
    };

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Super Admin Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Manage All Schools</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    <FaPlus style={{ marginRight: '8px' }} /> Add School
                </button>
            </div>

            {showForm && (
                <div className="glass-panel fade-in" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Register New School</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label className="input-label">School Name</label>
                            <input name="name" className="input-field" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Address</label>
                            <input name="address" className="input-field" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Contact</label>
                            <input name="contact" className="input-field" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Plan</label>
                            <select name="subscriptionPlan" className="input-field" onChange={handleChange}>
                                <option value="Basic">Basic</option>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'hsl(var(--secondary))' }}>Principal Details</h3>
                        </div>
                        <div>
                            <label className="input-label">Principal Name</label>
                            <input name="adminName" className="input-field" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Principal Email</label>
                            <input name="adminEmail" type="email" className="input-field" onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="input-label">Password</label>
                            <input name="adminPassword" type="password" className="input-field" onChange={handleChange} required />
                        </div>
                        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                            <button type="submit" className="btn btn-primary">Create School</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {schools.map(school => (
                    <div key={school._id} className="glass-panel" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginRight: '15px'
                            }}>
                                <FaSchool size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.2rem' }}>{school.name}</h3>
                                <span style={{
                                    fontSize: '0.8rem', padding: '4px 8px', borderRadius: '20px',
                                    background: school.subscriptionPlan === 'Premium' ? 'gold' : 'rgba(255,255,255,0.1)',
                                    color: school.subscriptionPlan === 'Premium' ? '#000' : 'inherit'
                                }}>
                                    {school.subscriptionPlan} Plan
                                </span>
                            </div>
                        </div>
                        <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem', marginBottom: '8px' }}>
                            <strong>Principal:</strong> {school.adminId?.name || 'N/A'}
                        </p>
                        <p style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>
                            <strong>Contact:</strong> {school.contact}
                        </p>
                    </div>
                ))}
            </div>

            <button onClick={logout} style={{ marginTop: '40px', color: 'hsl(var(--text-dim))', textDecoration: 'underline' }}>
                Logout
            </button>
        </div>
    );
};

export default SuperAdminDashboard;
