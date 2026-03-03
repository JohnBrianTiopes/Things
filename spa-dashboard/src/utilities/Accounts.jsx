import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';

const formatHeader = (value) =>
	value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const pickValue = (row, key, fallbackMap = {}) => {
	if (row[key] !== undefined) return row[key];
	const fallback = fallbackMap[key];
	if (!fallback) return '';
	return row[fallback] ?? '';
};

export const SimpleCrudTable = ({
	title,
	rows = [],
	endpoint,
	columns,
	editableColumns,
	idKey = 'id',
	emptyMessage,
	payloadMap,
	refreshFromApi = true,
}) => {
	const displayColumns = React.useMemo(() => {
		if (Array.isArray(columns) && columns.length > 0) return columns;
		return rows.length > 0 ? Object.keys(rows[0]) : [];
	}, [columns, rows]);

	const fields = editableColumns || displayColumns.filter((col) => col !== idKey && col !== 'created_at');
	const [localRows, setLocalRows] = React.useState(Array.isArray(rows) ? rows : []);
	const [openAdd, setOpenAdd] = React.useState(false);
	const [editingId, setEditingId] = React.useState(null);
	const [error, setError] = React.useState('');

	const createEmptyRecord = React.useCallback(
		() => Object.fromEntries(fields.map((field) => [field, ''])),
		[fields]
	);

	const [newRow, setNewRow] = React.useState(createEmptyRecord);
	const [editRow, setEditRow] = React.useState({});

	React.useEffect(() => {
		setLocalRows(Array.isArray(rows) ? rows : []);
	}, [rows]);

	React.useEffect(() => {
		setNewRow(createEmptyRecord());
	}, [createEmptyRecord]);

	const normalizePayload = (record) => {
		if (!payloadMap) return record;
		return payloadMap(record);
	};

	const fetchLatest = async () => {
		if (!refreshFromApi) return;
		try {
			const res = await fetch(endpoint);
			const data = await res.json();
			setLocalRows(Array.isArray(data) ? data : []);
		} catch (err) {
			console.error(err);
		}
	};

	const handleAdd = async () => {
		try {
			setError('');
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizePayload(newRow)),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				setError(data.error || `Failed to create ${title.toLowerCase()}`);
				return;
			}

			setOpenAdd(false);
			setNewRow(createEmptyRecord());
			await fetchLatest();
		} catch (err) {
			console.error(err);
			setError('Network error while creating record.');
		}
	};

	const startEdit = (row) => {
		const mapped = Object.fromEntries(fields.map((field) => [field, pickValue(row, field, { name: 'account_name' })]));
		setEditRow(mapped);
		setEditingId(row[idKey]);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditRow({});
	};

	const saveEdit = async () => {
		if (!editingId) return;
		try {
			setError('');
			const res = await fetch(`${endpoint}${editingId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizePayload(editRow)),
			});
			const data = await res.json();
			if (!res.ok || !data.success) {
				setError(data.error || `Failed to update ${title.toLowerCase()}`);
				return;
			}

			cancelEdit();
			await fetchLatest();
		} catch (err) {
			console.error(err);
			setError('Network error while updating record.');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this record?')) return;
		try {
			setError('');
			const res = await fetch(`${endpoint}${id}`, { method: 'DELETE' });
			const data = await res.json();
			if (!res.ok || !data.success) {
				setError(data.error || `Failed to delete ${title.toLowerCase()}`);
				return;
			}
			await fetchLatest();
		} catch (err) {
			console.error(err);
			setError('Network error while deleting record.');
		}
	};

	return (
		<Box sx={{ mt: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px', mb: '10px', flexWrap: 'wrap' }}>
				<h2>{title}</h2>
				<AddCircleRoundedIcon
					sx={{
						cursor: 'pointer',
						fontSize: 30,
						background: '#060745',
						color: '#eee6e3',
						padding: '9px',
						borderRadius: '8px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
						transition: 'all 0.2s',
					}}
					onClick={() => {
						setError('');
						setOpenAdd((prev) => !prev);
					}}
				/>

				{openAdd && (
					<Box sx={{ width: '100%', flexBasis: '100%', display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
						{fields.map((field) => (
							<TextField
								key={field}
								label={formatHeader(field)}
								size="small"
								value={newRow[field] ?? ''}
								onChange={(e) => setNewRow((prev) => ({ ...prev, [field]: e.target.value }))}
							/>
						))}
						<Button variant="contained" onClick={handleAdd} sx={{ background: '#060745', flexShrink: 0 }}>
							Add
						</Button>
						<Button
							variant="outlined"
							onClick={() => setNewRow(createEmptyRecord())}
							sx={{ borderColor: '#060745', color: '#060745', flexShrink: 0 }}
						>
							Clear
						</Button>
					</Box>
				)}

				{error && <Box sx={{ color: '#dd5752', width: '100%', fontSize: 13 }}>{error}</Box>}
			</Box>

			<TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', padding: '10px' }}>
				<Table stickyHeader>
					<TableHead>
						<TableRow sx={{ height: 25 }}>
							{displayColumns.map((column) => (
								<TableCell key={column} sx={{ fontWeight: 600, py: 0.55 }}>{formatHeader(column)}</TableCell>
							))}
							<TableCell sx={{ fontWeight: 600, py: 0.75 }} align="center">Edit</TableCell>
							<TableCell sx={{ fontWeight: 600, py: 0.75 }} align="center">Delete</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{localRows.length > 0 ? (
							localRows.map((row, index) => (
								<TableRow key={row[idKey] || row.account_id || index} sx={{ height: 25 }}>
									{editingId === row[idKey] ? (
										displayColumns.map((column) => (
											column === idKey || column === 'created_at' ? (
												<TableCell key={column} sx={{ py: 0.55 }}>{pickValue(row, column, { name: 'account_name' }) || '-'}</TableCell>
											) : fields.includes(column) ? (
												<TableCell key={column} sx={{ py: 0.2 }}>
													<TextField
														size="small"
														value={editRow[column] ?? ''}
														onChange={(e) => setEditRow((prev) => ({ ...prev, [column]: e.target.value }))}
													/>
												</TableCell>
											) : (
												<TableCell key={column} sx={{ py: 0.55 }}>{pickValue(row, column, { name: 'account_name' }) || '-'}</TableCell>
											)
										))
									) : (
										displayColumns.map((column) => (
											<TableCell key={column} sx={{ py: 0.55 }}>
												{pickValue(row, column, { name: 'account_name' }) || '-'}
											</TableCell>
										))
									)}

									<TableCell sx={{ py: 0.2 }} align="center">
										{editingId === row[idKey] ? (
											<>
												<IconButton onClick={saveEdit}><SaveAltIcon /></IconButton>
												<IconButton onClick={cancelEdit}><CancelPresentationIcon /></IconButton>
											</>
										) : (
											<IconButton onClick={() => startEdit(row)}><EditRoundedIcon /></IconButton>
										)}
									</TableCell>
									<TableCell sx={{ py: 0.2 }} align="center">
										<IconButton color="error" onClick={() => handleDelete(row[idKey])}>
											<DeleteRoundedIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={displayColumns.length + 2} sx={{ py: 1.5, textAlign: 'center' }}>
									{emptyMessage || `No ${title.toLowerCase()} found.`}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		</Box>
	);
};

const Accounts = ({ rows = [] }) => (
	<SimpleCrudTable
		title="Accounts"
		rows={rows}
		endpoint="http://localhost:3001/api/account/"
		idKey="account_id"
		columns={['account_id', 'account_name', 'description', 'location', 'created_at']}
		editableColumns={['account_name', 'description', 'location']}
		payloadMap={(record) => ({
			name: record.account_name,
			description: record.description,
			location: record.location,
		})}
		emptyMessage="No accounts found."
		refreshFromApi
	/>
);

export default Accounts;
