import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <TopNav />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
