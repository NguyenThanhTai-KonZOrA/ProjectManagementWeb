import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
    CircularProgress,
    Chip,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Tooltip,
    IconButton
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
    Clear as IconReset,
    Download as DownloadIcon,
    FilterList as FilterListIcon,
    AccessTime as AccessTimeIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { useSetPageTitle } from '../hooks/useSetPageTitle';
import { PAGE_TITLES } from '../constants/pageTitles';
import { taskHistoryReportService, projectManagementService, projectMemberService } from '../services/projectManagementService';
import type { TaskReportFilterRequest, TaskReportFilterResponse, periodTypeOptions } from '../projectManagementTypes/taskHistoryReport';
import type { ProjectSummaryResponse } from '../projectManagementTypes/projectType';
import type { MemberByEmployeeResponse } from '../projectManagementTypes/projectMember';
import { FormatUtcTime } from '../utils/formatUtcTime';

// Period Types
const PERIOD_TYPES = [
    { value: 0, label: 'All' },
    { value: 1, label: 'Daily' },
    { value: 2, label: 'Weekly' },
    { value: 3, label: 'Monthly' },
    { value: 4, label: 'Quarterly' }
];

const AdminTaskHistoryReportPage: React.FC = () => {
    useSetPageTitle(PAGE_TITLES.ADMIN_TASK_HISTORY_REPORT || 'Task History Report');

    // States
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [reports, setReports] = useState<TaskReportFilterResponse[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter states
    const [fromDate, setFromDate] = useState<string>(() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [toDate, setToDate] = useState<string>(() => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [selectedProject, setSelectedProject] = useState<ProjectSummaryResponse | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<MemberByEmployeeResponse | null>(null);
    const [periodType, setPeriodType] = useState<number>(0);

    // Dropdown data
    const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
    const [employees, setEmployees] = useState<MemberByEmployeeResponse[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Load projects
    const loadProjects = async () => {
        try {
            setLoadingProjects(true);
            const data = await projectManagementService.getProjectsSummary();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Load employees
    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);
            const data = await projectMemberService.getAllMembers();
            setEmployees(data);
        } catch (error) {
            console.error('Error loading employees:', error);
        } finally {
            setLoadingEmployees(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadProjects();
        loadEmployees();
        loadReports();
    }, []);

    // Load reports
    const loadReports = async () => {
        try {
            setLoading(true);

            const request: TaskReportFilterRequest = {
                projectId: selectedProject?.id ? Number(selectedProject.id) : undefined,
                employeeId: selectedEmployee?.id,
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined,
                periodType: periodType === 0 ? undefined : periodType
            };

            const data = await taskHistoryReportService.getTaskHistoryReport(request);
            setReports(data);
            setPage(0); // Reset to first page
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle search button click
    const handleSearch = () => {
        loadReports();
    };

    // Handle export
    const handleExport = async () => {
        try {
            setExporting(true);

            const request: TaskReportFilterRequest = {
                projectId: selectedProject?.id ? Number(selectedProject.id) : undefined,
                employeeId: selectedEmployee?.id,
                fromDate: fromDate ? new Date(fromDate) : undefined,
                toDate: toDate ? new Date(toDate) : undefined,
                periodType: periodType === 0 ? undefined : periodType
            };

            const blob = await taskHistoryReportService.exportTaskHistoryReport(request);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TaskHistoryReport_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        } finally {
            setExporting(false);
        }
    };

    // Handle page change
    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Reset filters
    const handleResetFilters = () => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setFromDate(`${year}-${month}-${day}`);
        
        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
        const todayDay = String(today.getDate()).padStart(2, '0');
        setToDate(`${todayYear}-${todayMonth}-${todayDay}`);
        
        setSelectedProject(null);
        setSelectedEmployee(null);
        setPeriodType(0);
        setPage(0);
    };

    // Get status chip
    const getStatusChip = (fromStatus: string, toStatus: string) => {
        const isCompleted = toStatus?.toLowerCase().includes('completed') || toStatus?.toLowerCase().includes('done');
        const isInProgress = toStatus?.toLowerCase().includes('progress');
        
        return (
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Chip
                    label={fromStatus || '-'}
                    size="small"
                    variant="outlined"
                    color="default"
                />
                <Typography variant="caption" color="text.secondary">→</Typography>
                <Chip
                    label={toStatus || '-'}
                    size="small"
                    color={isCompleted ? 'success' : isInProgress ? 'info' : 'default'}
                />
            </Stack>
        );
    };

    // Get overdue chip
    const getOverdueChip = (isOverdue: boolean | undefined) => {
        if (isOverdue === undefined || isOverdue === null) return null;
        
        return isOverdue ? (
            <Chip
                icon={<WarningIcon />}
                label="Overdue"
                color="error"
                size="small"
            />
        ) : (
            <Chip
                icon={<CheckCircleIcon />}
                label="On Time"
                color="success"
                size="small"
            />
        );
    };

    // Paginated data
    const paginatedReports = reports.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <AdminLayout>
            <Box sx={{ p: 2 }}>
                <Card>
                    <CardContent>
                        {/* Filters Section */}
                        <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.default' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                                    <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6">Filters</Typography>
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    {/* From Date */}
                                    <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                                        <TextField
                                            label="From Date"
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{
                                                max: FormatUtcTime.getTodayString(),
                                            }}
                                        />
                                    </Box>

                                    {/* To Date */}
                                    <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                                        <TextField
                                            label="To Date"
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{
                                                max: FormatUtcTime.getTodayString(),
                                                min: fromDate
                                            }}
                                        />
                                    </Box>

                                    {/* Project */}
                                    <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
                                        <Autocomplete
                                            options={projects}
                                            getOptionLabel={(option) => `${option.projectCode} - ${option.projectName}`}
                                            value={selectedProject}
                                            onChange={(_event, newValue) => setSelectedProject(newValue)}
                                            loading={loadingProjects}
                                            size="small"
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Project"
                                                    placeholder="Select project..."
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingProjects ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    {/* Employee */}
                                    <Box sx={{ minWidth: 250, flex: '1 1 250px' }}>
                                        <Autocomplete
                                            options={employees}
                                            getOptionLabel={(option) => `${option.employeeName} (${option.employeeCode})`}
                                            value={selectedEmployee}
                                            onChange={(_event, newValue) => setSelectedEmployee(newValue)}
                                            loading={loadingEmployees}
                                            size="small"
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Employee"
                                                    placeholder="Select employee..."
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loadingEmployees ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Box>

                                    {/* Period Type */}
                                    <Box sx={{ minWidth: 200, flex: '1 1 200px' }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Period Type</InputLabel>
                                            <Select
                                                value={periodType}
                                                onChange={(e) => setPeriodType(Number(e.target.value))}
                                                label="Period Type"
                                            >
                                                {PERIOD_TYPES.map((type) => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    {/* Action Buttons */}
                                    <Box sx={{ minWidth: 200, flex: '1 1 200px', display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSearch}
                                            disabled={loading}
                                            size="medium"
                                            startIcon={<SearchIcon />}
                                        >
                                            Search
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            onClick={loadReports}
                                            size="medium"
                                            startIcon={<RefreshIcon />}
                                            disabled={loading}
                                        >
                                            Refresh
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            onClick={handleResetFilters}
                                            size="medium"
                                            startIcon={<IconReset />}
                                        >
                                            Clear
                                        </Button>

                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleExport}
                                            disabled={exporting || reports.length === 0}
                                            size="medium"
                                            startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                                        >
                                            Export
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Table Section */}
                        <Box position="relative">
                            {/* Loading overlay */}
                            {loading && (
                                <Box
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bgcolor="rgba(255, 255, 255, 0.7)"
                                    zIndex={10}
                                    sx={{ backdropFilter: 'blur(2px)' }}
                                >
                                    <CircularProgress size={40} />
                                </Box>
                            )}

                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                Total Records: {reports.length}
                            </Typography>

                            {/* Table */}
                            <TableContainer component={Paper} sx={{ maxHeight: 600, opacity: loading ? 0.5 : 1, p: 1 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Task Code</TableCell>
                                            <TableCell>Task Title</TableCell>
                                            <TableCell>Employee</TableCell>
                                            <TableCell align="center">Status Change</TableCell>
                                            <TableCell>Changed At</TableCell>
                                            <TableCell align="center">Duration</TableCell>
                                            <TableCell>Due Date</TableCell>
                                            <TableCell align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedReports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                                    <Typography color="text.secondary">
                                                        {loading ? 'Loading...' : 'No records found'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedReports.map((report) => (
                                                <TableRow
                                                    key={report.id}
                                                    hover
                                                    sx={{
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Chip
                                                            label={report.taskCode}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {report.taskTitle}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {report.employeeName}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {getStatusChip(report.fromStatus, report.toStatus)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <AccessTimeIcon fontSize="small" color="action" />
                                                            <Typography variant="body2">
                                                                {FormatUtcTime.formatDateTime(report.changedAt)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography variant="body2">
                                                            {report.workDuration || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {report.dueDate ? FormatUtcTime.formatDateWithoutTime(report.dueDate) : '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {getOverdueChip(report.isOverdue)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {/* Pagination */}
                            <TablePagination
                                component="div"
                                count={reports.length}
                                page={page}
                                onPageChange={handlePageChange}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                labelRowsPerPage="Rows per page:"
                            />
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    );
};

export default AdminTaskHistoryReportPage;
