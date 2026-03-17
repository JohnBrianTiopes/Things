import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
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

const resolveRowId = (row, idKey) => row[idKey] ?? row.id ?? row.account_id ?? row.user_id;

const valueFallbackMap = {
	account_id: 'id',
	account_name: 'name',
	id: 'account_id',
	name: 'account_name',
};

export const SimpleCrudTable = ({
	title,
	rows = [],
	endpoint,
	columns,
	editableColumns,
	requiredFields,
	idKey = 'id',
	emptyMessage,
	payloadMap,
	refreshFromApi = true,
	enablePagination = true,
}) => {
	const fields = React.useMemo(() => {
		if (Array.isArray(editableColumns) && editableColumns.length > 0) return editableColumns;
		if (Array.isArray(columns) && columns.length > 0) {
			return columns.filter((col) => col !== idKey && col !== 'created_at');
		}
		if (rows.length > 0) {
			return Object.keys(rows[0]).filter((col) => col !== idKey && col !== 'created_at');
		}
		return [];
	}, [editableColumns, columns, rows, idKey]);

	const displayColumns = React.useMemo(() => {
		if (Array.isArray(columns) && columns.length > 0) return columns;
		if (rows.length > 0) return Object.keys(rows[0]);
		return [idKey, ...fields];
	}, [columns, rows, idKey, fields]);
	const [localRows, setLocalRows] = React.useState(Array.isArray(rows) ? rows : []);
	const [openAdd, setOpenAdd] = React.useState(false);
	const [openSearch, setOpenSearch] = React.useState(false);
	const [searchKeyword, setSearchKeyword] = React.useState('');
	const [appliedSearch, setAppliedSearch] = React.useState('');
	const [editingId, setEditingId] = React.useState(null);
	const [error, setError] = React.useState('');
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(5);

	const createEmptyRecord = React.useCallback(
		() => Object.fromEntries(fields.map((field) => [field, ''])),
		[fields]
	);

	const [newRow, setNewRow] = React.useState(createEmptyRecord);
	const [editRow, setEditRow] = React.useState({});
	const effectiveRequiredFields = React.useMemo(() => {
		if (Array.isArray(requiredFields) && requiredFields.length > 0) return requiredFields;
		return fields;
	}, [requiredFields, fields]);

	const isAddDisabled = React.useMemo(
		() => effectiveRequiredFields.some((field) => String(newRow[field] ?? '').trim() === ''),
		[effectiveRequiredFields, newRow]
	);

	const filteredRows = React.useMemo(() => {
		if (!appliedSearch) return localRows;
		const keyword = appliedSearch.toLowerCase();
		return localRows.filter((row) =>
			displayColumns.some((column) =>
				String(pickValue(row, column, { name: 'account_name' }) ?? '')
					.toLowerCase()
					.includes(keyword)
			)
		);
	}, [appliedSearch, localRows, displayColumns]);

	const paginatedRows = React.useMemo(() => {
		if (!enablePagination || rowsPerPage === -1) return filteredRows;
		const start = page * rowsPerPage;
		return filteredRows.slice(start, start + rowsPerPage);
	}, [enablePagination, filteredRows, page, rowsPerPage]);

	React.useEffect(() => {
		setLocalRows(Array.isArray(rows) ? rows : []);
	}, [rows]);

	React.useEffect(() => {
		setNewRow(createEmptyRecord());
	}, [createEmptyRecord]);

	React.useEffect(() => {
		setPage(0);
	}, [appliedSearch, rowsPerPage, localRows.length]);

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
			const missingRequired = effectiveRequiredFields.filter((field) => String(newRow[field] ?? '').trim() === '');
			if (missingRequired.length > 0) {
				setError(`Please fill required field(s): ${missingRequired.map(formatHeader).join(', ')}`);
				return;
			}

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
		const mapped = Object.fromEntries(fields.map((field) => [field, pickValue(row, field, valueFallbackMap)]));
		setEditRow(mapped);
		setEditingId(resolveRowId(row, idKey));
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

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Box sx={{ mt: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '40px', mb: '10px', flexWrap: 'wrap', pt: 1, pb: 0.5 }}>
				<h2>{title}</h2>
				<SearchRoundedIcon
					sx={{
						cursor: openAdd ? 'not-allowed' : 'pointer',
						fontSize: 35,
						opacity: openAdd ? 0.4 : 1,
						pointerEvents: openAdd ? 'none' : 'auto',
						background: '#060745',
						color: '#eee6e3',
						padding: '5px',
						borderRadius: '8px',
						boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
						transition: 'all 0.2s',
					}}
					onClick={() => {
						setOpenSearch((prev) => {
							const next = !prev;
							if (next) {
								setOpenAdd(false);
							} else {
								setSearchKeyword('');
								setAppliedSearch('');
							}
							return next;
						});
					}}
				/>

				{openSearch && (
					<Box sx={{ display: 'flex', alignItems: 'center', minWidth: '300px', maxWidth: '420px' }}>
						<TextField
							fullWidth
							label="Search any keyword..."
							value={searchKeyword}
							onChange={(e) => setSearchKeyword(e.target.value)}
							size="small"
						/>
						<Button sx={{ ml: 1, background: '#060745' }} variant="contained" onClick={() => setAppliedSearch(searchKeyword)}>
							Search
						</Button>
					</Box>
				)}

				<AddCircleRoundedIcon
					sx={{
						cursor: openSearch ? 'not-allowed' : 'pointer',
						fontSize: 30,
						opacity: openSearch ? 0.4 : 1,
						pointerEvents: openSearch ? 'none' : 'auto',
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
						setOpenSearch(false);
					}}
				/>

				{openAdd && (
					<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'nowrap', maxWidth: '100%', overflowX: 'auto', overflowY: 'visible', pt: 1, pb: 0.5 }}>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
							{fields.map((field) => (
								<TextField
									key={field}
									label={formatHeader(field)}
									size="small"
									value={newRow[field] ?? ''}
									onChange={(e) => setNewRow((prev) => ({ ...prev, [field]: e.target.value }))}
									sx={{ width: 170 }}
								/>
							))}
						</Box>
						<Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
							<Button variant="contained" onClick={handleAdd} disabled={isAddDisabled} sx={{ background: '#060745' }}>
								Add
							</Button>
						</Box>
					</Box>
				)}

				{error && <Box sx={{ color: '#dd5752', width: '100%', fontSize: 13, mt: 0.5 }}>{error}</Box>}
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
						{filteredRows.length > 0 ? (
							paginatedRows.map((row, index) => (
								<TableRow key={resolveRowId(row, idKey) || index} sx={{ height: 25 }}>
									{editingId === resolveRowId(row, idKey) ? (
										displayColumns.map((column) => (
											column === idKey || column === 'created_at' ? (
												<TableCell key={column} sx={{ py: 0.55 }}>{pickValue(row, column, valueFallbackMap) || '-'}</TableCell>
											) : fields.includes(column) ? (
												<TableCell key={column} sx={{ py: 0.2 }}>
													<TextField
														size="small"
														value={editRow[column] ?? ''}
														onChange={(e) => setEditRow((prev) => ({ ...prev, [column]: e.target.value }))}
													/>
												</TableCell>
											) : (
												<TableCell key={column} sx={{ py: 0.55 }}>{pickValue(row, column, valueFallbackMap) || '-'}</TableCell>
											)
										))
									) : (
										displayColumns.map((column) => (
											<TableCell key={column} sx={{ py: 0.55 }}>
												{pickValue(row, column, valueFallbackMap) || '-'}
											</TableCell>
										))
									)}

									<TableCell sx={{ py: 0.2 }} align="center">
										{editingId === resolveRowId(row, idKey) ? (
											<>
												<IconButton onClick={saveEdit}><SaveAltIcon /></IconButton>
												<IconButton onClick={cancelEdit}><CancelPresentationIcon /></IconButton>
											</>
										) : (
											<IconButton onClick={() => startEdit(row)}><EditRoundedIcon /></IconButton>
										)}
									</TableCell>
									<TableCell sx={{ py: 0.2 }} align="center">
										<IconButton color="error" onClick={() => handleDelete(resolveRowId(row, idKey))}>
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
					{enablePagination && (
						<TableFooter>
							<TableRow>
								<TablePagination
									rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
									colSpan={displayColumns.length + 2}
									count={filteredRows.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={handleChangePage}
									onRowsPerPageChange={handleChangeRowsPerPage}
									showFirstButton
									showLastButton
								/>
							</TableRow>
						</TableFooter>
					)}
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
