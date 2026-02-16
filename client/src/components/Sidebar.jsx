import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import {
    FaThLarge,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaUserFriends,
    FaUsersCog,
    FaSignOutAlt,
    FaChartBar,
    FaClipboardList,
    FaBullhorn,
    FaTimes,
    FaKey
} from 'react-icons/fa';
import ChangePasswordModal from './ChangePasswordModal';
import { useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useContext(AuthContext);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const menuItems = {
        SuperAdmin: [
            { path: '/dashboard', icon: <FaThLarge />, label: 'Overview' },
            { path: '/schools', icon: <FaUsersCog />, label: 'Manage Schools' },
        ],
        Admin: [
            { path: '/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
            { path: '/teachers', icon: <FaChalkboardTeacher />, label: 'Teachers' },
            { path: '/students', icon: <FaUserGraduate />, label: 'Students' },
        ],
        Teacher: [
            { path: '/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
            { path: '/my-students', icon: <FaUserFriends />, label: 'My Students' },
            { path: '/attendance', icon: <FaClipboardList />, label: 'Attendance' },
        ],
        Student: [
            { path: '/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
            { path: '/my-results', icon: <FaChartBar />, label: 'Results' },
        ],
        Parent: [
            { path: '/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
            { path: '/child-progress', icon: <FaChartBar />, label: 'Child Progress' },
        ]
    };

    const roleMenuItems = menuItems[user?.role] || [];

    return (
        <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <img src="/logo.png" alt="MR. EduEdge" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span className="brand-name">MR. EduEdge</span>
                </div>
                <div className="menu-toggle" onClick={() => setIsOpen(false)} style={{ margin: 0 }}>
                    <FaTimes />
                </div>
            </div>

            <div className="sidebar-profile">
                <div className="profile-avatar">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="profile-info">
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-username">@{user?.email?.split('@')[0]}</p>
                    <span className="role-badge">{user?.role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <p className="nav-label">Main Menu</p>
                {roleMenuItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={() => setIsChangePasswordOpen(true)}
                    className="nav-item"
                    style={{ width: '100%', border: 'none', background: 'none', marginBottom: '10px' }}
                >
                    <span className="nav-icon"><FaKey /></span>
                    <span className="nav-text">Change Password</span>
                </button>
                <button onClick={logout} className="logout-btn">
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </aside>
    );
};

export default Sidebar;
