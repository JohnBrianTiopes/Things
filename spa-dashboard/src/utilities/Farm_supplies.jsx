import React from 'react'
import { SimpleCrudTable } from './Accounts'

const FarmSupplies = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Farm Supplies"
		rows={rows}
		endpoint="http://localhost:3001/api/farm_supplies/"
		editableColumns={['farm_id', 'supply_id', 'quantity_used', 'date_used']}
		emptyMessage="No farm supplies found."
	/>
)

export default FarmSupplies