import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaPlus, FaSchool, FaEdit, FaKey, FaArrowLeft, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaTrash } from 'react-icons/fa';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [schools, setSchools] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Detailed View State
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolUsers, setSchoolUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Edit Plan State
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [newPlan, setNewPlan] = useState('');

    // Reset Password State (Deprecated in favor of editingUser)
    // const [isResettingPassword, setIsResettingPassword] = useState(false);
    // const [newPassword, setNewPassword] = useState('');

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

    const handleDeleteSchool = async () => {
        if (window.confirm('Are you sure you want to delete this school? This will delete ALL associated users (teachers, students, etc.) permanently!')) {
            try {
                await api.delete(`/api/schools/${selectedSchool._id}`, config);
                alert('School deleted successfully');
                setSelectedSchool(null);
                fetchSchools();
            } catch (error) {
                console.error(error);
                alert(error.response?.data?.message || 'Error deleting school');
            }
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

    const handleApproveSchool = async (id) => {
        try {
            await api.put(`/api/schools/${id}/approve`, {}, config);
            alert('School approved successfully');
            fetchSchools();
        } catch (error) {
            console.error(error);
            alert('Error approving school');
        }
    };

    const handleRejectSchool = async (id) => {
        if (window.confirm('Are you sure you want to REJECT this school registration? This will permanently delete the school and its admin account.')) {
            try {
                await api.delete(`/api/schools/${id}/reject`, config);
                alert('School rejected and removed');
                fetchSchools();
            } catch (error) {
                console.error(error);
                alert('Error rejecting school');
            }
        }
    };



    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatePayload = {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role
            };
            if (editingUser.password) {
                updatePayload.password = editingUser.password;
            }
            await api.put(`/api/users/${editingUser._id}`, updatePayload, config);

            // If the updated user is the current school's principal, update local selectedSchool state
            if (editingUser._id === selectedSchool.adminId?._id) {
                setSelectedSchool({
                    ...selectedSchool,
                    adminId: { ...selectedSchool.adminId, name: updatePayload.name, email: updatePayload.email }
                });
            }

            setEditingUser(null);
            fetchSchoolUsers(selectedSchool._id);
            fetchSchools(); // Refresh main list to show updated principal name
            alert('User updated successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating user');
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-danger" onClick={handleDeleteSchool} style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
                            <FaTrash style={{ marginRight: '8px' }} /> Delete School
                        </button>
                        <button className="btn btn-secondary" onClick={() => setSelectedSchool(null)}>
                            <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Schools
                        </button>
                    </div>
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

            {/* Pending Approvals */}
            {!selectedSchool && schools.some(s => !s.isApproved) && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff9800' }}></span>
                        Pending Approvals
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {schools.filter(s => !s.isApproved).map(school => (
                            <div key={school._id} className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                                <div style={{ marginBottom: '15px' }}>
                                    <h3 style={{ marginBottom: '5px' }}>{school.name}</h3>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{school.address}</p>
                                </div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
                                    <p><strong>Principal:</strong> {school.adminId?.name || 'N/A'}</p>
                                    <p><strong>Email:</strong> {school.adminId?.email || 'N/A'}</p>
                                    <p><strong>Plan:</strong> {school.subscriptionPlan}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={() => handleApproveSchool(school._id)}>Approve</button>
                                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', color: '#ff6b6b' }} onClick={() => handleRejectSchool(school._id)}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main School List */}
            {!selectedSchool && (
                <div>
                    <h2 style={{ marginBottom: '20px' }}>Approved Schools</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {schools.filter(s => s.isApproved).map(school => (
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

                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => setEditingUser(selectedSchool.adminId)}>
                                    <FaEdit style={{ marginRight: '5px' }} /> Edit Credentials
                                </button>
                            </div>
                        </div>
                    </div>


                    {editingUser && (
                        <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Edit {editingUser.role}: {editingUser.name}</h3>
                            <form onSubmit={handleUserUpdate}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label className="input-label">Full Name</label>
                                        <input
                                            className="input-field"
                                            value={editingUser.name}
                                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="input-label">Email / Username</label>
                                        <input
                                            className="input-field"
                                            value={editingUser.email}
                                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className="input-label">New Password (Leave blank to keep current)</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={editingUser.password || ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary">Update Credentials</button>
                                    <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ color: '#ff6b6b' }}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    )
                    }

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
                            <table className="data-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Name</th>
                                        <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Role</th>
                                        <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Email</th>
                                        <th style={{ textAlign: 'left', padding: '15px', color: 'hsl(var(--secondary))' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schoolUsers.length > 0 ? schoolUsers.map(u => (
                                        <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '15px' }}>{u.name}</td>
                                            <td style={{ padding: '15px' }}>
                                                <span className={`status-badge status-${u.role === 'Teacher' ? 'present' : 'pending'}`}
                                                    style={{
                                                        padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem',
                                                        background: u.role === 'Teacher' ? 'rgba(50, 200, 255, 0.2)' : 'rgba(100, 255, 150, 0.2)',
                                                        color: u.role === 'Teacher' ? '#32c8ff' : '#64ff96'
                                                    }}
                                                >
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '15px' }}>{u.email}</td>
                                            <td style={{ padding: '15px' }}>
                                                <button
                                                    onClick={() => setEditingUser(u)}
                                                    style={{ color: 'hsl(var(--accent))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--text-dim))' }}>No users found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <button onClick={logout} style={{ marginTop: '40px', color: 'hsl(var(--accent))', textDecoration: 'underline' }}>
                Logout
            </button>
        </div>
    );
};

export default SuperAdminDashboard;
