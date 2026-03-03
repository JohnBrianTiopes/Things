import React from 'react'
import { SimpleCrudTable } from './Accounts'

const AgentConversation = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Agent Conversation"
		rows={rows}
		endpoint="http://localhost:3001/api/agent_conversation/"
		editableColumns={['owner_user_id', 'title', 'last_message_at']}
		emptyMessage="No agent conversation found."
	/>
)

export default AgentConversation