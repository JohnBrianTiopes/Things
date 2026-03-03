import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Harvests = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Harvests"
		rows={rows}
		endpoint="http://localhost:3001/api/harvests/"
		editableColumns={['farm_id', 'harvest_date', 'quantity_kg', 'quality', 'notes']}
		emptyMessage="No harvests found."
	/>
)

export default Harvests