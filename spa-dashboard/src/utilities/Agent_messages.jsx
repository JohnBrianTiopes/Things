import React from 'react'
import { SimpleCrudTable } from './Accounts'

const AgentMessages = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Agent Messages"
		rows={rows}
		endpoint="http://localhost:3001/api/agent_messages/"
		editableColumns={['conversation_id', 'role', 'content']}
		emptyMessage="No agent messages found."
	/>
)

export default AgentMessages