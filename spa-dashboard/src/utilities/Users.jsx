import * as React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import SaveAltIcon from '@mui/icons-material/SaveAlt';


function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton 
                onClick={(e) => onPageChange(e, page + 1)}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                >
                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
            onClick={(e) =>
                onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
                }
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

const User = () => {
    const emptyNewUser = {
        name: '',
        email: '',
        password: '',
        account_id: '',
        role: '',
    };

    const [users, setUsers] = React.useState([]);
    const [editingId, setEditingId] = React.useState(null);
    const [editUser, setEditUser] = React.useState({});
    const [searchKeyword, setSearchKeyword] = React.useState('');
    const [appliedSearch, setAppliedSearch] = React.useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [openSearch, setOpenSearch] = React.useState(false);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [addError, setAddError] = React.useState('');

    const [newUser, setNewUser] = React.useState(emptyNewUser);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/user/');
            const data = await res.json();
            const normalizedUsers = Array.isArray(data)
                ? data.map((row) => ({
                    ...row,
                    user_id: row.user_id ?? row.id,
                    account_id: row.account_id ?? row.account?.account_id ?? row.account?.id ?? '',
                }))
                : [];
            setUsers(normalizedUsers);
        } catch (err) {
            console.error(err);
            setUsers([]);
        }
    };

    React.useEffect(() => {
        fetchUsers();
        const usersInterval = setInterval(fetchUsers, 5000);
        return () => clearInterval(usersInterval);
    }, []);


    const toggleSearch = () => {
        setOpenSearch((prev) => {
            const next = !prev;
            if (next) {
                setOpenAdd(false);
            } else {
                setSearchKeyword('');
                setAppliedSearch('');
                setPage(0);
            }
            return next;
        });
    };

    const toggleAdd = () => {
        setOpenAdd((prev) => {
            const next = !prev;
            if (next) {
                setOpenSearch(false);
                setAddError('');
            }
            return next;
        });
    };

    const filteredRows = appliedSearch
        ? users.filter((rows) =>
            Object.values(rows).some((val) => 
                val?.toString().toLowerCase().includes(appliedSearch.toLowerCase())
            )
        )
        : users;

    const emptyRows =
        page > 0 
            ? Math.max(3, (1 + page) * rowsPerPage - filteredRows.length)
            : 0;

    const handleChangePage = (_, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleSearchSubmit = () => {
        setAppliedSearch(searchKeyword);
        setPage(0);
    };

    const handleAddUser = async () => {
        try {
            setAddError('');
            const res = await fetch('http://localhost:3001/api/user/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setAddError(data.error || 'Failed to create user.');
                return;
            }

            if (data.success) {
                setNewUser(emptyNewUser);
                setOpenAdd(false);
                fetchUsers();
            }
        } catch (err) {
            console.error(err);
            setAddError('Network error while creating user.');
        }
    };

    const handleClearNewUser = () => {
        setNewUser(emptyNewUser);
    };

    const startEdit = (row) => {
        setEditingId(row.user_id);
        setEditUser(row);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditUser({});
    };

    const saveEdit = async () => {
        try {
            await fetch(`http://localhost:3001/api/user/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editUser.name,
                    email: editUser.email,
                    role: editUser.role,
                    account_id: editUser.account_id,
                }),
            });
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await fetch(`http://localhost:3001/api/user/${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }  
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: '60px', mb: '10px', flexWrap: 'wrap', overflowX: 'hidden' }}>
                <h2>Users</h2>

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
                    onClick={toggleSearch}
                />

                {openSearch && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: '300px',
                            maxWidth: '420px',
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Search any keyword..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            size="small"
                        />
                        <Button sx={{ ml: 1, background: '#060745' }} variant="contained" onClick={handleSearchSubmit}>
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
                    onClick={toggleAdd}
                />

                {openAdd && (
                    <Box
                        sx={{
                            width: '100%',
                            flexBasis: '100%',
                            display: 'flex',
                            gap: 1,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <TextField required label="Name" size="small"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <TextField required label="Email" size="small"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <TextField required label="Password" type="password" size="small" 
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <TextField required label="Account ID" size="small"
                            value={newUser.account_id}
                            onChange={(e) => setNewUser({ ...newUser, account_id: e.target.value })}
                        />
                        <TextField required label="Role" size="small"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        />
                        <Button
                            variant="contained"
                            disabled={Object.values(newUser).some(v => !v)}
                            onClick={handleAddUser}
                            sx={{ background: '#060745', flexShrink: 0 }}
                        >
                            Add
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleClearNewUser}
                            disabled={Object.values(newUser).every(v => !v)}
                            sx={{ borderColor: '#060745', color: '#060745', flexShrink: 0 }}
                        >
                            Clear
                        </Button>
                        {addError && (
                            <Box sx={{ color: '#dd5752', width: '100%', fontSize: 13 }}>
                                {addError}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', padding: '10px', marginTop: '8px' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow sx={{ height: 25}}>
                            <TableCell sx={{ fontWeight: 600, py: 0.55 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.55 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.55 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.55 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.55 }}>Account ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.75 }} align="center" >Edit</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 0.75 }} align="center" >Delete</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {(rowsPerPage > 0
                            ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : filteredRows
                        ).map((row) => (    
                            <TableRow key={row.user_id} sx={{ height: 25 }}>
                                <TableCell sx={{ py: 0.55 }}>{row.user_id}</TableCell>

                                {editingId === row.user_id ? (
                                    <>
                                        <TableCell sx={{ py: 0 }}>
                                            <TextField size="small" value={editUser.name}
                                                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0 }}>
                                            <TextField size="small" value={editUser.email}
                                                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0 }}>
                                            <TextField size="small" value={editUser.role}
                                                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0 }}>
                                            <TextField size="small" value={editUser.account_id}
                                                onChange={(e) => setEditUser({ ...editUser, account_id: e.target.value })}
                                            />
                                        </TableCell>
                                        <TableCell colSpan={2}>
                                            <Button size="small" onClick={saveEdit}><SaveAltIcon/></Button>
                                            <Button size="small" onClick={cancelEdit}><CancelPresentationIcon/></Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ py: 0 }}>{row.name}</TableCell>
                                        <TableCell sx={{ py: 0 }}>{row.email}</TableCell>
                                        <TableCell sx={{ py: 0 }}>{row.role}</TableCell>
                                        <TableCell sx={{ py: 0 }}>{row.account_id || '-'}</TableCell>
                                        <TableCell sx={{ py: 0 }} align="center">
                                            <IconButton onClick={() => startEdit(row)}>
                                                <EditRoundedIcon />
                                            </IconButton>
                                        </TableCell>
                                        <TableCell sx={{ py: 0 }} align="center">
                                            <IconButton color="error" onClick={() => handleDelete(row.user_id)}>
                                                <DeleteRoundedIcon />
                                            </IconButton>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 27 * emptyRows }}>
                                <TableCell colSpan={7} />
                            </TableRow>
                        )}
                    </TableBody>

                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[3, 5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={7}
                                count={filteredRows.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                                sx={{
                                    py: 0.75,
                                    '& .MuiTablePagination-toolbar': {
                                        minHeight: 52,
                                        px: 1.5,
                                    },
                                }}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default User;