import React from 'react';
import { SimpleCrudTable } from './Accounts';

const Farmer = ({ rows = [] }) => (
  <SimpleCrudTable
    title="Farmer"
    rows={rows}
    endpoint="http://localhost:3001/api/farmer/"
    editableColumns={['name', 'farm_id', 'role', 'salary', 'contact_info']}
    requiredFields={['name']}
    payloadMap={(record) => {
      const farmIdRaw = String(record.farm_id ?? '').trim();
      const salaryRaw = String(record.salary ?? '').trim();
      const parsedFarmId = Number.parseInt(farmIdRaw, 10);
      const parsedSalary = Number.parseFloat(salaryRaw);

      return {
        name: String(record.name ?? '').trim(),
        farm_id: farmIdRaw === '' || Number.isNaN(parsedFarmId) ? null : parsedFarmId,
        role: String(record.role ?? '').trim() || null,
        salary: salaryRaw === '' || Number.isNaN(parsedSalary) ? null : parsedSalary,
        contact_info: String(record.contact_info ?? '').trim() || null,
      };
    }}
    emptyMessage="No farmer found."
  />
);

export default Farmer;