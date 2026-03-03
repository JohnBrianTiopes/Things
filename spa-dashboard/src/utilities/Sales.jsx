import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Sales = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Sales"
		rows={rows}
		endpoint="http://localhost:3001/api/sales/"
		editableColumns={['farm_id', 'harvest_id', 'sales_date', 'customer_name', 'quantity_kg', 'revenue']}
		emptyMessage="No sales found."
	/>
)

export default Sales