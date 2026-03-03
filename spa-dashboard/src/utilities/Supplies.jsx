import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Supplies = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Supplies"
		rows={rows}
		endpoint="http://localhost:3001/api/supplies/"
		editableColumns={['name', 'description', 'unit_cost', 'quantity_on_hand']}
		emptyMessage="No supplies found."
	/>
)

export default Supplies