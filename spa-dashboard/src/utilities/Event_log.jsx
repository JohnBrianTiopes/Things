import React from 'react'
import { SimpleCrudTable } from './Accounts'

const EventLog = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Event Log"
		rows={rows}
		endpoint="http://localhost:3001/api/event_log/"
		editableColumns={['user_id', 'account_id', 'action', 'metadata']}
		emptyMessage="No event log found."
	/>
)

export default EventLog