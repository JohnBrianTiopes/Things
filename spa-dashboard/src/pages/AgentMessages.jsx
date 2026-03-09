import React from 'react'
import Sidebar from '../components/Sidebar'
import '../App.css'
import ChatIcon from '@mui/icons-material/Chat'
import AgentConversation from '../utilities/Agent_conversation'
import AgentMessages from '../utilities/Agent_messages'

const AgentMessagesPage = () => {
    const [rows, setRows] = React.useState({})

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/logs-monitoring')
                const data = await res.json()
                setRows(data || {})
            } catch (err) {
                console.error(err)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="main-util">
            <Sidebar />
            <div className="util-cont">
                <h1 className='dash-title'><ChatIcon sx={{ fontSize: 45 }} /> Agent Messages</h1>
                <AgentConversation rows={rows.agent_conversation} />
                <AgentMessages rows={rows.agent_messages} />
            </div>
        </div>
    )
}

export default AgentMessagesPage
