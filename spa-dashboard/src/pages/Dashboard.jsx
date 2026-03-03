import React from "react";
import Sidebar from  '../components/Sidebar';
import '../App.css';
import QuantFigures from '../components/QuantFigures';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Dashboard = () => {
    return (
        <div>
            <div className='main-dash'>
                <Sidebar/>
                <div className='dash-cont'>
                    <div className='dash-firstr'>
                        <div className='dash-header'>
                            <h1 className='dash-title'><DashboardIcon sx={{ fontSize: 45 }} /> Dashboard</h1>
                            <div className='dash-figs'>
                                <QuantFigures/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard