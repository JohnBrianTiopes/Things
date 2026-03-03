import React from 'react'
import { SimpleCrudTable } from './Accounts'

const CropVarieties = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Crop Varieties"
		rows={rows}
		endpoint="http://localhost:3001/api/crop_varieties/"
		editableColumns={['name', 'description', 'ideal_climate', 'average_yield_kg_per_hectare']}
		emptyMessage="No crop varieties found."
	/>
)

export default CropVarieties