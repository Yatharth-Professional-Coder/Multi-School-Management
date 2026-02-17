import React from 'react';
import './LoadingPage.css';

const LoadingPage = () => {
    return (
        <div className="loading-page-container">
            <div className="spinner"></div>
            <div className="loading-text">Loading...</div>
        </div>
    );
};

export default LoadingPage;
