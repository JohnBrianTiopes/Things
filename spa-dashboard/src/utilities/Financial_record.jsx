import React from 'react'
import { SimpleCrudTable } from './Accounts'

const FinancialRecord = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Financial Record"
		rows={rows}
		endpoint="http://localhost:3001/api/financial_record/"
		editableColumns={['farm_id', 'record_date', 'income', 'expenses', 'net_profit_loss']}
		emptyMessage="No financial record found."
	/>
)

export default FinancialRecord