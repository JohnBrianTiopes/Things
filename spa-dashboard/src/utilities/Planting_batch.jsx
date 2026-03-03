import React from 'react'
import { SimpleCrudTable } from './Accounts'

const PlantingBatch = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Planting Batch"
		rows={rows}
		endpoint="http://localhost:3001/api/planting_batch/"
		editableColumns={['farm_id', 'crop_variety_id', 'tomato_type', 'planting_date', 'expected_harvest_date']}
		emptyMessage="No planting batch found."
	/>
)

export default PlantingBatch