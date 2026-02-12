import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';

import StudentDashboard from './student/StudentDashboard';

import ParentDashboard from './parent/ParentDashboard';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    if (user?.role === 'SuperAdmin') {
        return <SuperAdminDashboard />;
    }

    if (user?.role === 'Admin') {
        return <AdminDashboard />;
    }

    if (user?.role === 'Teacher') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'Student') {
        return <StudentDashboard />;
    }

    if (user?.role === 'Parent') {
        return <ParentDashboard />;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name}!</p>
            <p>Role: <span style={{ color: 'hsl(var(--primary))' }}>{user?.role}</span></p>

            <div className="glass-panel" style={{ padding: '20px', marginTop: '20px' }}>
                <h2>Overview</h2>
                <p>Welcome to your dashboard. Your role-specific features are coming soon.</p>
                <p>Currently configured for: <strong>{user?.role}</strong></p>
            </div>

            <button onClick={logout} className="btn btn-primary" style={{ marginTop: '20px', background: 'hsl(0, 70%, 50%)' }}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
