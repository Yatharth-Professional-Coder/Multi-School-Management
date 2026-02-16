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
    FaBullhorn
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

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
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-placeholder">M</div>
                <span className="brand-name">MR. EduEdge</span>
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
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
