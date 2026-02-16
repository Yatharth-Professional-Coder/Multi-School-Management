import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaPlus, FaSchool, FaEdit, FaKey, FaArrowLeft, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaTrash } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SuperAdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [schools, setSchools] = useState([]);
    const [showForm, setShowForm] = useState(false);

    // Detailed View State
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [schoolUsers, setSchoolUsers] = useState([]);
    const [aggregatedData, setAggregatedData] = useState({ teachers: [], students: [] });
    const [editingUser, setEditingUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [activeDetailedTab, setActiveDetailedTab] = useState('Overview');

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

    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [settingsData, setSettingsData] = useState({
        themeColor: '#32c8ff',
        gradingSystem: 'Percentage',
        features: {
            enableTimetable: true,
            enableAttendance: true,
            enableHomework: true,
            enableResults: true,
            enableAnnouncements: true,
            enableHalfDay: false,
        }
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

    const fetchAggregatedData = async (schoolId) => {
        setLoadingUsers(true);
        try {
            const { data: users } = await api.get(`/api/users?schoolId=${schoolId}`, config);
            setSchoolUsers(users);

            const { data: aggregated } = await api.get(`/api/schools/${schoolId}/aggregated-data`, config);
            setAggregatedData(aggregated);
        } catch (error) {
            console.error(error);
            alert('Error fetching aggregated school data');
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

        const defaultSettings = {
            themeColor: '#32c8ff',
            logoUrl: '',
            gradingSystem: 'Percentage',
            features: {
                enableTimetable: true,
                enableAttendance: true,
                enableHomework: true,
                enableResults: true,
                enableAnnouncements: true,
                enableHalfDay: false,
            }
        };

        const schoolSettings = school.settings || {};
        const mergedSettings = {
            ...defaultSettings,
            ...schoolSettings,
            features: {
                ...defaultSettings.features,
                ...(schoolSettings.features || {})
            }
        };

        setSettingsData(mergedSettings);
        fetchAggregatedData(school._id);
        setActiveDetailedTab('Overview');
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

    const handleSettingsUpdate = async () => {
        try {
            const { data } = await api.put(`/api/schools/${selectedSchool._id}/settings`, settingsData, config);
            setSelectedSchool({ ...selectedSchool, settings: data.settings });
            setIsEditingSettings(false);
            alert('School settings updated successfully');
        } catch (error) {
            console.error(error);
            alert('Error updating settings');
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
        <div className="container fade-in" style={{ paddingTop: '20px' }}>

            {/* Dashboard Controls */}
            <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px', gap: '15px' }}>
                {!selectedSchool && (
                    <button className="btn btn-primary w-full-mobile" onClick={() => setShowForm(!showForm)}>
                        <FaPlus style={{ marginRight: '8px' }} /> Add School
                    </button>
                )}
                {selectedSchool && (
                    <div className="flex-mobile-col w-full-mobile" style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-danger w-full-mobile" onClick={handleDeleteSchool} style={{ background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)' }}>
                            <FaTrash style={{ marginRight: '8px' }} /> Delete School
                        </button>
                        <button className="btn btn-secondary w-full-mobile" onClick={() => setSelectedSchool(null)}>
                            <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Schools
                        </button>
                    </div>
                )}
            </div>


            {/* School Registration Form (Only visible when no school selected) */}
            {!selectedSchool && showForm && (
                <div className="glass-panel fade-in" style={{ padding: '30px', marginBottom: '30px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Register New School</h2>
                    <form onSubmit={handleSubmit} className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

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
                            <button type="submit" className="btn btn-primary w-full-mobile">Create School</button>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '30px' }} className="flex-mobile-col">
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
                                    <button
                                        className="btn btn-secondary"
                                        style={{ background: 'rgba(50, 200, 255, 0.1)', color: '#32c8ff', border: '1px solid rgba(50, 200, 255, 0.2)' }}
                                        onClick={() => setIsEditingSettings(!isEditingSettings)}
                                    >
                                        <FaEdit style={{ marginRight: '8px' }} /> Customize Branding & Features
                                    </button>
                                </div>
                            </div>

                            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }} className="w-full-mobile">
                                <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaUserTie /> Principal
                                </h3>
                                <p><strong>{selectedSchool.adminId?.name}</strong></p>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '10px' }}>{selectedSchool.adminId?.email}</p>

                                <button className="btn btn-secondary w-full-mobile" style={{ fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => setEditingUser(selectedSchool.adminId)}>
                                    <FaEdit style={{ marginRight: '5px' }} /> Edit Credentials
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* School Settings Form */}
                    {isEditingSettings && (
                        <div className="glass-panel fade-in" style={{ padding: '30px', marginBottom: '30px', border: '1px solid rgba(50, 200, 255, 0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>School Personalization</h2>
                                <button className="btn btn-secondary" onClick={() => setIsEditingSettings(false)}>Close</button>
                            </div>

                            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'hsl(var(--secondary))' }}>Branding</h3>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label className="input-label">Primary Theme Color</label>
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={settingsData.themeColor}
                                                onChange={(e) => setSettingsData({ ...settingsData, themeColor: e.target.value })}
                                                style={{ width: '50px', height: '40px', border: 'none', borderRadius: '5px', cursor: 'pointer', background: 'none' }}
                                            />
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={settingsData.themeColor}
                                                onChange={(e) => setSettingsData({ ...settingsData, themeColor: e.target.value })}
                                                style={{ width: '120px' }}
                                            />
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: settingsData.themeColor, border: '1px solid rgba(255,255,255,0.2)' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Grading System</label>
                                        <select
                                            className="input-field"
                                            value={settingsData.gradingSystem}
                                            onChange={(e) => setSettingsData({ ...settingsData, gradingSystem: e.target.value })}
                                            disabled={selectedSchool.subscriptionPlan !== 'Premium'}
                                            style={{
                                                cursor: selectedSchool.subscriptionPlan !== 'Premium' ? 'not-allowed' : 'pointer',
                                                opacity: selectedSchool.subscriptionPlan !== 'Premium' ? 0.6 : 1
                                            }}
                                        >
                                            <option value="Percentage">Percentage (0-100%)</option>
                                            <option value="GPA">GPA (4.0 Scale)</option>
                                        </select>
                                        {selectedSchool.subscriptionPlan !== 'Premium' && (
                                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--accent))', marginTop: '5px' }}>
                                                ✨ GPA Grading requires **Premium Plan**
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'hsl(var(--secondary))' }}>Feature Toggles</h3>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        {Object.entries(settingsData.features).map(([key, value]) => {
                                            const label = key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim();
                                            const plan = selectedSchool.subscriptionPlan;
                                            let isAllowed = true;
                                            let upgradeTo = '';

                                            if (key === 'enableTimetable' || key === 'enableHomework') {
                                                if (plan === 'Basic') {
                                                    isAllowed = false;
                                                    upgradeTo = 'Standard';
                                                }
                                            } else if (key === 'enableResults') {
                                                if (plan === 'Basic' || plan === 'Standard') {
                                                    isAllowed = false;
                                                    upgradeTo = 'Premium';
                                                }
                                            } else if (key === 'enableHalfDay') {
                                                isAllowed = true; // Always allow for now once it's in the system
                                            }

                                            return (
                                                <div key={key} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '5px',
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '8px',
                                                    opacity: isAllowed ? 1 : 0.6
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <input
                                                            type="checkbox"
                                                            id={key}
                                                            checked={isAllowed ? value : false}
                                                            disabled={!isAllowed}
                                                            onChange={(e) => setSettingsData({
                                                                ...settingsData,
                                                                features: { ...settingsData.features, [key]: e.target.checked }
                                                            })}
                                                            style={{ cursor: isAllowed ? 'pointer' : 'not-allowed' }}
                                                        />
                                                        <label htmlFor={key} style={{ cursor: isAllowed ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }}>
                                                            {label}
                                                        </label>
                                                    </div>
                                                    {!isAllowed && (
                                                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent))', marginLeft: '25px' }}>
                                                            Upgrade to **{upgradeTo}** to unlock
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" onClick={handleSettingsUpdate}>Save Customizations</button>
                            </div>
                        </div>
                    )}


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

                    {/* Stats & Users Section */}
                    {/* (Moving this section into tabs for a cleaner look as requested) */}
                    {/* But for now, keeping it below if needed, or just let the tabs handle it */}

                    {/* Detailed Content Tabs */}
                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                            {['Overview', 'Teachers', 'Students'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveDetailedTab(tab)}
                                    style={{
                                        padding: '15px 30px',
                                        background: 'none',
                                        border: 'none',
                                        color: activeDetailedTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--text-dim))',
                                        borderBottom: activeDetailedTab === tab ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                                        cursor: 'pointer',
                                        fontWeight: activeDetailedTab === tab ? 'bold' : 'normal',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '30px' }}>
                            {activeDetailedTab === 'Overview' && (
                                <div className="fade-in">
                                    <h2 style={{ marginBottom: '20px' }}>School Overview</h2>
                                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                            <h3 style={{ marginBottom: '15px', color: 'hsl(var(--secondary))' }}>Quick Stats</h3>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                <li style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Total Teachers:</span> <strong>{aggregatedData.teachers.length}</strong>
                                                </li>
                                                <li style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Total Students:</span> <strong>{aggregatedData.students.length}</strong>
                                                </li>
                                                <li style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>School ID:</span> <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{selectedSchool._id}</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px' }}>
                                            <h3 style={{ marginBottom: '15px', color: 'hsl(var(--secondary))' }}>Active Features</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {Object.entries(selectedSchool.settings?.features || {}).map(([key, value]) => value && (
                                                    <span key={key} style={{ background: 'rgba(50, 200, 255, 0.1)', color: '#32c8ff', padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem' }}>
                                                        {key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '30px' }}>
                                        <h3>Recent Activity</h3>
                                        <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Detailed activity logs coming soon...</p>
                                    </div>
                                </div>
                            )}

                            {activeDetailedTab === 'Teachers' && (
                                <div className="fade-in">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2>Teacher Directory</h2>
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total: {aggregatedData.teachers.length}</span>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Name</th>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Email</th>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Classes</th>
                                                    <th style={{ textAlign: 'center', padding: '15px' }}>Homework</th>
                                                    <th style={{ textAlign: 'center', padding: '15px' }}>Att. Marked</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {aggregatedData.teachers.map(teacher => (
                                                    <tr key={teacher._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '15px' }}>{teacher.name}</td>
                                                        <td style={{ padding: '15px', fontSize: '0.9rem', opacity: 0.8 }}>{teacher.email}</td>
                                                        <td style={{ padding: '15px' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                                {teacher.classes.length > 0 ? teacher.classes.map(c => (
                                                                    <span key={c} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{c}</span>
                                                                )) : <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>None</span>}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                                            <span style={{ color: teacher.homeworkCount > 0 ? 'hsl(var(--secondary))' : '' }}>{teacher.homeworkCount}</span>
                                                        </td>
                                                        <td style={{ padding: '15px', textAlign: 'center' }}>{teacher.attendanceMarkedCount}</td>
                                                    </tr>
                                                ))}
                                                {aggregatedData.teachers.length === 0 && (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>No teachers found for this school</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeDetailedTab === 'Students' && (
                                <div className="fade-in">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h2>Student Directory</h2>
                                        <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total: {aggregatedData.students.length}</span>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Name</th>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Username (Email)</th>
                                                    <th style={{ textAlign: 'center', padding: '15px' }}>Attendance</th>
                                                    <th style={{ textAlign: 'left', padding: '15px' }}>Recent Results</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {aggregatedData.students.map(student => (
                                                    <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '15px' }}>{student.name}</td>
                                                        <td style={{ padding: '15px', fontSize: '0.9rem', opacity: 0.8 }}>{student.email}</td>
                                                        <td style={{ padding: '15px', textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                <span style={{
                                                                    fontWeight: 'bold',
                                                                    color: parseFloat(student.attendancePercentage) < 75 ? '#ff4d4d' : '#64ff96'
                                                                }}>
                                                                    {student.attendancePercentage}%
                                                                </span>
                                                                <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>({student.presentCount}/{student.totalAttendance})</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px' }}>
                                                            {student.results.length > 0 ? (
                                                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
                                                                    {student.results.slice(0, 3).map((res, i) => (
                                                                        <div key={i} style={{
                                                                            background: 'rgba(255,255,255,0.05)',
                                                                            padding: '5px 10px',
                                                                            borderRadius: '6px',
                                                                            fontSize: '0.75rem',
                                                                            minWidth: '80px',
                                                                            border: '1px solid rgba(255,255,255,0.1)'
                                                                        }}>
                                                                            <div style={{ fontWeight: 'bold' }}>{res.subject}</div>
                                                                            <div style={{ color: 'hsl(var(--primary))' }}>{res.grade || `${((res.marksObtained / res.totalMarks) * 100).toFixed(0)}%`}</div>
                                                                        </div>
                                                                    ))}
                                                                    {student.results.length > 3 && (
                                                                        <span style={{ opacity: 0.5, fontSize: '0.8rem', alignSelf: 'center' }}>+{student.results.length - 3} more</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>No records</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {aggregatedData.students.length === 0 && (
                                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>No students found for this school</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        {/* Stats Column */}
                        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

                        {/* Users List Column */}
                        <div className="glass-panel" style={{ padding: '30px' }}>
                            <h2>School Users</h2>
                            {loadingUsers ? <LoadingSpinner /> : (
                                <div style={{ overflowX: 'auto' }}>
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
