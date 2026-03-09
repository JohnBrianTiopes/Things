import React from 'react'
import Sidebar from  '../components/Sidebar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import { useSearchParams } from 'react-router-dom'

// Import your custom table components
import Users from '../utilities/Users'
import Accounts from '../utilities/Accounts'
import Farms from '../utilities/Farms'
import Farmer from '../utilities/Farmer'
import PlantingBatch from '../utilities/Planting_batch'
import Production from '../utilities/Production'
import Harvests from '../utilities/Harvests'
import Equipment from '../utilities/Equipment'
import Supplies from '../utilities/Supplies'
import FarmSupplies from '../utilities/Farm_supplies'
import FinancialRecord from '../utilities/Financial_record'
import PestDiseaseEvent from '../utilities/Pest_disease_event'
import EventLog from '../utilities/Event_log'
import WeatherLog from '../utilities/Weather_log'
import Sales from '../utilities/Sales'
import CropVarieties from '../utilities/Crop_varieties'

const tabsConfig = [
    {
        value: '1',
        label: 'Accounts & User',
        endpoint: 'http://localhost:3001/api/accounts-users',
        components: {
            users: Users,
            accounts: Accounts
        }
    },
    {
        value: '2',
        label: 'Farms Data',
        endpoint: 'http://localhost:3001/api/farms-data',
        components: {
            farms: Farms,
            farmer: Farmer
        }
    },
    {
        value: '3',
        label: 'Resource & Finance',
        endpoint: 'http://localhost:3001/api/resource-finance',
        components: {
            equipment: Equipment,
            supplies: Supplies,
            farm_supplies: FarmSupplies,
            financial_record: FinancialRecord
        }
    },
    {
        value: '4',
        label: 'Monitoring & Logs',
        endpoint: 'http://localhost:3001/api/logs-monitoring',
        components: {
            pest_disease_event: PestDiseaseEvent,
            event_log: EventLog,
            weather_log: WeatherLog
        }
    },
    {
        value: '5',
        label: 'Sales & Crops',
        endpoint: 'http://localhost:3001/api/sales-crops',
        components: {
            planting_batch: PlantingBatch,
            production: Production,
            harvests: Harvests,
            sales: Sales,
            crop_varieties: CropVarieties
        }
    }
]

const TabPanel = ({ value, index, children }) => {
    return value === index && <Box sx={{ p: 2 }}>{children}</Box>
}

const Utility = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const requestedTab = searchParams.get('tab')
    const [value, setValue] = React.useState(
        tabsConfig.some((tab) => tab.value === requestedTab) ? requestedTab : '1'
    )
    const [rows, setRows] = React.useState([])

    const handleChange = (event, newValue) => {
        setValue(newValue)
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('tab', newValue)
        setSearchParams(nextParams)
    }

    React.useEffect(() => {
        if (requestedTab && tabsConfig.some((tab) => tab.value === requestedTab) && requestedTab !== value) {
            setValue(requestedTab)
        }
    }, [requestedTab, value])

    React.useEffect(() => {
        const fetchData = async () => {
            const currentTab = tabsConfig.find(tab => tab.value === value)
            if (!currentTab || !currentTab.endpoint) return

            try {
                const res = await fetch(currentTab.endpoint)
                const data = await res.json()
                setRows(data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchData()
    }, [value])

    return (
        <div className="main-util">
            <Sidebar />
            <div className="util-cont">
                <h1>Utilities</h1>

                <Box sx={{ width: '100%', maxWidth: '1350px', pr: 1 }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        textColor="secondary"
                        indicatorColor="secondary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTabs-flexContainer': { flexWrap: 'wrap', gap: 1 },
                            '& .MuiTab-root': { minWidth: 'auto', textTransform: 'none' }
                        }}
                    >
                        {tabsConfig.map(tab => (
                            <Tab key={tab.value} label={tab.label} value={tab.value} />
                        ))}
                    </Tabs>
                </Box>

                {/* Tab Panels */}
                {tabsConfig.map((tab) => (
                    <TabPanel key={tab.value} value={value} index={tab.value}>
                        {tab.components
                            ? Object.entries(tab.components).map(([key, Comp]) => (
                                <Box key={key}>
                                    <Comp rows={rows[key]} />
                                </Box>
                            ))
                            : <pre>{JSON.stringify(rows, null, 2)}</pre>}
                    </TabPanel>
                ))}
            </div>
        </div>
    )
}

export default Utility