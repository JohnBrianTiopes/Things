import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import Sidebar from '../components/Sidebar';

const Home = () => {
    return (
        <div className='main-dash'>
            <Sidebar />
            <div className='dash-cont'>
                <div className='dash-firstr'>
                    <h1 className='dash-title'>
                        <HomeIcon sx={{ fontSize: 45 }} /> Home
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Home;
