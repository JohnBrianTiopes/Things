import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Equipment = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Equipment"
		rows={rows}
		endpoint="http://localhost:3001/api/equipment/"
		editableColumns={['name', 'farm_id', 'purchase_date', 'last_maintenance_date', 'next_maintenance_date', 'status']}
		emptyMessage="No equipment found."
	/>
)

export default Equipment