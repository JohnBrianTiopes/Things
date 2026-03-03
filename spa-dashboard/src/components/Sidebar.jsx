import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import SettingIcon from '@mui/icons-material/Settings';

const utilityLinks = [
    { label: 'Users', tab: '1', section: 'users' },
    { label: 'Accounts', tab: '1', section: 'accounts' },
    { label: 'Farms', tab: '2', section: 'farms' },
    { label: 'Farmer', tab: '2', section: 'farmer' },
    { label: 'Planting Batch', tab: '2', section: 'planting_batch' },
    { label: 'Production', tab: '2', section: 'production' },
    { label: 'Harvests', tab: '2', section: 'harvests' },
    { label: 'Equipment', tab: '3', section: 'equipment' },
    { label: 'Supplies', tab: '3', section: 'supplies' },
    { label: 'Farm Supplies', tab: '3', section: 'farm_supplies' },
    { label: 'Financial Record', tab: '3', section: 'financial_record' },
    { label: 'Agent Conversation', tab: '4', section: 'agent_conversation' },
    { label: 'Agent Messages', tab: '4', section: 'agent_messages' },
    { label: 'Pest Disease Event', tab: '4', section: 'pest_disease_event' },
    { label: 'Event Log', tab: '4', section: 'event_log' },
    { label: 'Weather Log', tab: '4', section: 'weather_log' },
    { label: 'Sales', tab: '5', section: 'sales' },
    { label: 'Crop Varieties', tab: '5', section: 'crop_varieties' },
]

const Sidebar = () => {
    return (
        <div className="sidem">
            <img src="/Images/RedPulp.png" alt="logo" id="logo" />

            <div className="sidem-inner">
                <div className="side-op">
                    <Link to="/" className="side-item">
                        <HomeIcon />
                        <span>Home</span>
                    </Link>

                    <Link to="/dashboard" className="side-item">
                        <DashboardIcon />
                        <span>Dashboard</span>
                    </Link>

                    <div className="util-menu-wrap">
                        <Link to="/utility" className="side-item">
                            <AddCircleIcon />
                            <span>Utilities</span>
                        </Link>

                        <div className="util-dropdown">
                            {utilityLinks.map((item) => (
                                <Link
                                    key={`${item.tab}-${item.section}`}
                                    to={`/utility?tab=${item.tab}&section=${item.section}`}
                                    className="util-drop-item"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <Link to="/dashboard" className="side-item">
                        <SettingIcon />
                        <span>Settings</span>
                    </Link>
                </div>

                <div className="lo">
                    <Link to="/logout" className="side-item">
                        <LogoutIcon />
                        <span>Logout</span>
                    </Link>
                </div>
            </div>
        </div>
        
    )
}

export default Sidebar