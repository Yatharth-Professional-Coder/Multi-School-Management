import { FaSearch, FaBell, FaCalendarAlt } from 'react-icons/fa';

const TopNav = () => {
    return (
        <header className="topnav">
            <div className="topnav-search">
                <FaSearch className="search-icon" />
                <input type="text" placeholder="Search for anything..." />
            </div>

            <div className="topnav-actions">
                <div className="action-item">
                    <FaCalendarAlt />
                    <span className="hidden-mobile">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="action-item notification">
                    <FaBell />
                    <span className="notification-dot"></span>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
