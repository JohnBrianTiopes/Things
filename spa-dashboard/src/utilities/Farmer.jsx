import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Farmer = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Farmer"
		rows={rows}
		endpoint="http://localhost:3001/api/farmer/"
		editableColumns={['name', 'farm_id', 'role', 'salary', 'contact_info']}
		emptyMessage="No farmer found."
	/>
)

export default Farmer