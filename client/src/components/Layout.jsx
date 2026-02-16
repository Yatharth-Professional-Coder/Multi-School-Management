import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="main-wrapper">
                <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
