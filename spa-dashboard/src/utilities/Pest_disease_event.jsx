import React from 'react'
import { SimpleCrudTable } from './Accounts'

const PestDiseaseEvent = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Pest Disease Event"
		rows={rows}
		endpoint="http://localhost:3001/api/pest_disease_event/"
		editableColumns={['farm_id', 'planting_batch_id', 'event_date', 'issue_type', 'treatment_applied']}
		emptyMessage="No pest disease event found."
	/>
)

export default PestDiseaseEvent