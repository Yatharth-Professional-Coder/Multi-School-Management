import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaPlus, FaSchool, FaEdit, FaKey, FaArrowLeft, FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [schools, setSchools] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Detailed View State
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolUsers, setSchoolUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Edit Plan State
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [newPlan, setNewPlan] = useState('');

    // Reset Password State
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

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

    const fetchSchoolUsers = async (schoolId) => {
        setLoadingUsers(true);
        try {
            const { data } = await api.get(`/api/users?schoolId=${schoolId}`, config);
            setSchoolUsers(data);
        } catch (error) {
            console.error(error);
            alert('Error fetching school users');
        } finally {
            setLoadingUsers(false);
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
            setFormData({
                name: '', address: '', contact: '', subscriptionPlan: 'Basic',
                adminName: '', adminEmail: '', adminPassword: ''
            });
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error creating school');
        }
    };

    const handleSchoolClick = (school) => {
        setSelectedSchool(school);
        setNewPlan(school.subscriptionPlan);
        fetchSchoolUsers(school._id);
    };

    const handleUpdatePlan = async () => {
        try {
            const { data } = await api.put(`/api/schools/${selectedSchool._id}`, { subscriptionPlan: newPlan }, config);
            setSelectedSchool({ ...selectedSchool, subscriptionPlan: data.subscriptionPlan });
            setIsEditingPlan(false);
            fetchSchools(); // Refresh main list
            alert('Plan updated successfully');
        } catch (error) {
            console.error(error);
            alert('Error updating plan');
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword) return alert('Please enter a new password');
        try {
            await api.put(`/api/users/${selectedSchool.adminId._id}`, { password: newPassword }, config);
            setIsResettingPassword(false);
            setNewPassword('');
            alert('Principal password reset successfully');
        } catch (error) {
            console.error(error);
            alert('Error resetting password');
        }
    };

    // Filtered users
    const teachers = schoolUsers.filter(u => u.role === 'Teacher');
    const students = schoolUsers.filter(u => u.role === 'Student');

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1>Super Admin Dashboard</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Manage All Schools</p>
                </div>
                {!selectedSchool && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <FaPlus style={{ marginRight: '8px' }} /> Add School
                    </button>
                )}
                {selectedSchool && (
                    <button className="btn btn-secondary" onClick={() => setSelectedSchool(null)}>
                        <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Schools
                    </button>
                )}
            </div>

            {/* School Registration Form (Only visible when no school selected) */}
            {!selectedSchool && showForm && (
                <div className="glass-panel fade-in" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Register New School</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div><label className="input-label">School Name</label><input name="name" className="input-field" onChange={handleChange} required value={formData.name} /></div>
                        <div><label className="input-label">Address</label><input name="address" className="input-field" onChange={handleChange} required value={formData.address} /></div>
                        <div><label className="input-label">Contact</label><input name="contact" className="input-field" onChange={handleChange} required value={formData.contact} /></div>
                        <div>
                            <label className="input-label">Plan</label>
                            <select name="subscriptionPlan" className="input-field" onChange={handleChange} value={formData.subscriptionPlan}>
                                <option value="Basic">Basic</option>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'hsl(var(--secondary))' }}>Principal Details</h3>
                        </div>
                        <div><label className="input-label">Principal Name</label><input name="adminName" className="input-field" onChange={handleChange} required value={formData.adminName} /></div>
                        <div><label className="input-label">Principal Email</label><input name="adminEmail" type="email" className="input-field" onChange={handleChange} required value={formData.adminEmail} /></div>
                        <div><label className="input-label">Password</label><input name="adminPassword" type="password" className="input-field" onChange={handleChange} required value={formData.adminPassword} /></div>
                        <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                            <button type="submit" className="btn btn-primary">Create School</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Main School List */}
            {!selectedSchool && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {schools.map(school => (
                        <div key={school._id} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => handleSchoolClick(school)}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
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
            )}

            {/* Detailed School View */}
            {selectedSchool && (
                <div className="fade-in">
                    {/* School Info Header */}
                    <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ marginBottom: '10px' }}>{selectedSchool.name}</h1>
                                <p style={{ color: 'hsl(var(--text-dim))', marginBottom: '20px' }}>
                                    <FaSchool style={{ marginRight: '8px' }} /> {selectedSchool.address}
                                </p>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ opacity: 0.7 }}>Plan:</span>
                                        {isEditingPlan ? (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <select className="input-field" value={newPlan} onChange={(e) => setNewPlan(e.target.value)} style={{ padding: '5px' }}>
                                                    <option value="Basic">Basic</option>
                                                    <option value="Standard">Standard</option>
                                                    <option value="Premium">Premium</option>
                                                </select>
                                                <button className="btn btn-primary" style={{ padding: '5px 10px' }} onClick={handleUpdatePlan}>Save</button>
                                                <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => setIsEditingPlan(false)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <span style={{ fontWeight: 'bold', color: 'hsl(var(--primary))' }}>
                                                {selectedSchool.subscriptionPlan}
                                                <FaEdit style={{ marginLeft: '10px', cursor: 'pointer', opacity: 0.7 }} onClick={() => setIsEditingPlan(true)} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }}>
                                <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                    <FaUserTie /> Principal
                                </h3>
                                <p><strong>{selectedSchool.adminId?.name}</strong></p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '10px' }}>{selectedSchool.adminId?.email}</p>

                                {isResettingPassword ? (
                                    <div style={{ marginTop: '10px' }}>
                                        <input
                                            type="password"
                                            className="input-field"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ marginBottom: '5px', width: '100%' }}
                                        />
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                                            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={handleResetPassword}>Save</button>
                                            <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => setIsResettingPassword(false)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => setIsResettingPassword(true)}>
                                        <FaKey style={{ marginRight: '5px' }} /> Reset Password
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <FaChalkboardTeacher size={30} color="hsl(var(--secondary))" style={{ marginBottom: '10px' }} />
                            <h3>{teachers.length}</h3>
                            <p style={{ opacity: 0.7 }}>Teachers</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <FaUserGraduate size={30} color="hsl(var(--accent))" style={{ marginBottom: '10px' }} />
                            <h3>{students.length}</h3>
                            <p style={{ opacity: 0.7 }}>Students</p>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="glass-panel" style={{ padding: '30px' }}>
                        <h2>School Users</h2>
                        {loadingUsers ? <p>Loading users...</p> : (
                            <table className="data-table" style={{ width: '100%', marginTop: '20px' }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schoolUsers.length > 0 ? schoolUsers.map(u => (
                                        <tr key={u._id}>
                                            <td>{u.name}</td>
                                            <td>
                                                <span className={`status-badge status-${u.role === 'Teacher' ? 'present' : 'pending'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td>{u.email}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <button onClick={logout} style={{ marginTop: '40px', color: 'hsl(var(--text-dim))', textDecoration: 'underline' }}>
                Logout
            </button>
        </div>
    );
};

export default SuperAdminDashboard;
