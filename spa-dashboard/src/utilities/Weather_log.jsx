import React from 'react'
import { SimpleCrudTable } from './Accounts'

const WeatherLog = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Weather Log"
		rows={rows}
		endpoint="http://localhost:3001/api/weather_log/"
		editableColumns={['farm_id', 'log_date', 'temperature_celsius', 'humidity_percentage', 'precipitation_mm', 'wind_speed_kmh']}
		emptyMessage="No weather log found."
	/>
)

export default WeatherLog