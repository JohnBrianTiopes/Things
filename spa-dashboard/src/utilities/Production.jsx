import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Production = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Production"
		rows={rows}
		endpoint="http://localhost:3001/api/production/"
		editableColumns={['farm_id', 'planting_batch_id', 'production_date', 'yield_quantity_kg', 'notes']}
		emptyMessage="No production found."
	/>
)

export default Production