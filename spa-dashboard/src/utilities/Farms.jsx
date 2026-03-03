import React from 'react'
import { SimpleCrudTable } from './Accounts'

const Farms = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Farms"
		rows={rows}
		endpoint="http://localhost:3001/api/farms/"
		editableColumns={['name', 'location']}
		emptyMessage="No farms found."
	/>
)

export default Farms