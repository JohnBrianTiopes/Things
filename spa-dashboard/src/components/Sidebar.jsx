import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';
import SettingIcon from '@mui/icons-material/Settings';

const utilityGroups = [
    {
        label: 'Accounts & User',
        tab: '1',
        links: [
            { label: 'Users', section: 'users' },
            { label: 'Accounts', section: 'accounts' }
        ]
    },
    {
        label: 'Farms Data',
        tab: '2',
        links: [
            { label: 'Farms', section: 'farms' },
            { label: 'Farmer', section: 'farmer' }
        ]
    },
    {
        label: 'Resource & Finance',
        tab: '3',
        links: [
            { label: 'Equipment', section: 'equipment' },
            { label: 'Supplies', section: 'supplies' },
            { label: 'Farm Supplies', section: 'farm_supplies' },
            { label: 'Financial Record', section: 'financial_record' }
        ]
    },
    {
        label: 'Monitoring & Logs',
        tab: '4',
        links: [
            { label: 'Pest Disease Event', section: 'pest_disease_event' },
            { label: 'Event Log', section: 'event_log' },
            { label: 'Weather Log', section: 'weather_log' }
        ]
    },
    {
        label: 'Sales & Crops',
        tab: '5',
        links: [
            { label: 'Planting Batch', section: 'planting_batch' },
            { label: 'Production', section: 'production' },
            { label: 'Harvests', section: 'harvests' },
            { label: 'Sales', section: 'sales' },
            { label: 'Crop Varieties', section: 'crop_varieties' }
        ]
    }
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
                            {utilityGroups.map((group) => (
                                <div key={group.tab} className="util-group">
                                    <Link
                                        to={`/utility?tab=${group.tab}`}
                                        className="util-drop-item util-group-item"
                                    >
                                        <span>{group.label}</span>
                                        <span>›</span>
                                    </Link>

                                    <div className="util-sub-dropdown">
                                        {group.links.map((item) => (
                                            <Link
                                                key={`${group.tab}-${item.section}`}
                                                to={`/utility?tab=${group.tab}&section=${item.section}`}
                                                className="util-drop-item"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
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