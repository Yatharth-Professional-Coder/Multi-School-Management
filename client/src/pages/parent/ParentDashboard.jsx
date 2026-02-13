import { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import AuthContext from '../../context/AuthContext';
import { FaUserGraduate, FaClipboardList, FaBullhorn, FaBookOpen, FaChartLine } from 'react-icons/fa';

const ParentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Overview');
    const [child, setChild] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [homework, setHomework] = useState([]);
    const [results, setResults] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const config = {
        headers: { Authorization: `Bearer ${user.token}` },
    };

    useEffect(() => {
        if (!user.childId) return;

        const fetchData = async () => {
            try {
                // Fetch Child Details
                const childRes = await api.get(`/api/users/${user.childId}`, config);
                setChild(childRes.data);

                // Fetch Child Attendance
                // Note: getAttendance in backend checks if caller is Parent and matches childId
                const attRes = await api.get(`/api/attendance/${user.childId}`, config);
                setAttendance(attRes.data);

                // Fetch Homework (School wide or Class specific)
                // Currently fetching all, frontend filtering by class implementation pending phase 3 completion details
                const hwRes = await api.get('/api/homework', config);
                setHomework(hwRes.data);

                // Fetch Results (Backend filters by Parent role -> childId)
                const resRes = await api.get(`/api/results`, config);
                setResults(resRes.data);

                // Fetch Announcements
                const annRes = await api.get('/api/announcements', config);
                setAnnouncements(annRes.data);

            } catch (error) {
                console.error("Error fetching child data", error);
            }
        };

        fetchData();
    }, [user.childId]);

    if (!user.childId) {
        return (
            <div className="container fade-in" style={{ paddingTop: '40px', textAlign: 'center' }}>
                <h1>Parent Portal</h1>
                <div className="glass-panel" style={{ padding: '40px', marginTop: '20px' }}>
                    <h2>No Student Linked</h2>
                    <p>Please contact the school administration to link your account to your child.</p>
                    <button onClick={logout} className="btn btn-primary" style={{ marginTop: '20px' }}>Logout</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container fade-in" style={{ paddingTop: '40px' }}>
            <div className="flex-mobile-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                <div>
                    <h1>Parent Portal</h1>
                    <p style={{ color: 'hsl(var(--text-dim))' }}>Welcome, {user.name}</p>
                    {child && <p style={{ color: 'hsl(var(--accent))', fontSize: '0.9rem' }}>Viewing: {child.name}</p>}
                </div>
                <button onClick={logout} className="btn btn-danger" style={{ alignSelf: 'flex-start' }}>Logout</button>
            </div>

            {/* Stats Overview */}

            <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                {user.schoolSettings?.features?.enableAttendance !== false && (
                    <div onClick={() => setActiveTab('Attendance')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Attendance' ? '1px solid hsl(var(--primary))' : '' }}>
                        <FaClipboardList size={24} style={{ marginBottom: '10px', color: '#32c8ff' }} />
                        <h3>{attendance.length > 0 ? ((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100).toFixed(1) : 0}%</h3>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Attendance</p>
                    </div>
                )}
                {user.schoolSettings?.features?.enableHomework !== false && (
                    <div onClick={() => setActiveTab('Homework')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Homework' ? '1px solid hsl(var(--primary))' : '' }}>
                        <FaBookOpen size={24} style={{ marginBottom: '10px', color: '#ffc832' }} />
                        <h3>{homework.length}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Assignments</p>
                    </div>
                )}
                {user.schoolSettings?.features?.enableResults !== false && (
                    <div onClick={() => setActiveTab('Results')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Results' ? '1px solid hsl(var(--primary))' : '' }}>
                        <FaChartLine size={24} style={{ marginBottom: '10px', color: '#64ff96' }} />
                        <h3>Results</h3>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>Academic Performance</p>
                    </div>
                )}
                {user.schoolSettings?.features?.enableAnnouncements !== false && (
                    <div onClick={() => setActiveTab('Announcements')} className="glass-panel" style={{ padding: '20px', cursor: 'pointer', border: activeTab === 'Announcements' ? '1px solid hsl(var(--primary))' : '' }}>
                        <FaBullhorn size={24} style={{ marginBottom: '10px', color: '#ff6464' }} />
                        <h3>{announcements.length}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>School Updates</p>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ padding: '20px', minHeight: '400px' }}>

                <h2>{activeTab === 'Overview' ? 'Select a tab above' : activeTab}</h2>
                <div style={{ marginTop: '20px' }}>

                    {activeTab === 'Overview' && <p>Click on any card above to view detailed information about your child's progress.</p>}

                    {activeTab === 'Attendance' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map(record => (
                                        <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px' }}>{new Date(record.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px', color: record.status === 'Present' ? '#64ff96' : '#ff6464' }}>{record.status}</td>
                                            <td style={{ padding: '10px' }}>
                                                {record.rectificationRequest?.requested && (
                                                    <span style={{ fontSize: '0.8rem', color: 'orange' }}>Rectification: {record.rectificationRequest.status}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Homework' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                            {homework.map(hw => (
                                <div key={hw._id} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>{hw.subject}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>Due: {new Date(hw.deadline).toLocaleDateString()}</span>
                                    </div>
                                    <h4 style={{ margin: '10px 0' }}>{hw.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-dim))' }}>{hw.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Results' && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Exam</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Subject</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Marks</th>
                                        <th style={{ textAlign: 'left', padding: '10px', borderBottom: '1px solid grey' }}>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map(res => {
                                        const percentage = ((res.marksObtained / res.totalMarks) * 100).toFixed(1);
                                        const gpa = ((res.marksObtained / res.totalMarks) * 4).toFixed(1);
                                        const isGPA = user.schoolSettings?.gradingSystem === 'GPA';

                                        return (
                                            <tr key={res._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '10px' }}>{res.examName}</td>
                                                <td style={{ padding: '10px' }}>{res.subject}</td>
                                                <td style={{ padding: '10px' }}>
                                                    {isGPA ? `${gpa} / 4.0` : `${percentage}%`}
                                                    <span style={{ fontSize: '0.7rem', opacity: 0.5, display: 'block' }}>({res.marksObtained}/{res.totalMarks})</span>
                                                </td>
                                                <td style={{ padding: '10px' }}>{res.grade}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'Announcements' && (
                        <div>
                            {announcements.map(ann => (
                                <div key={ann._id} style={{ borderLeft: '3px solid hsl(var(--accent))', paddingLeft: '15px', marginBottom: '20px' }}>
                                    <h4>{ann.title}</h4>
                                    <p style={{ marginBottom: '5px' }}>{ann.content}</p>
                                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-dim))' }}>
                                        Posted by {ann.postedBy?.name || 'Admin'} on {new Date(ann.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );

};

export default ParentDashboard;
