import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Avatar,
    LinearProgress,
    Alert,
    Snackbar,
    Divider,
    Menu,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
    taskManagementService,
    projectManagementService,
} from "../services/projectManagementService";
import type { TaskResponse } from "../projectManagementTypes/taskType";
import type { ProjectResponse } from "../projectManagementTypes/projectType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";

export default function AdminTasksPage() {
    useSetPageTitle("Task Management");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { projectsSummary, members } = useAppData();
    
    const [loading, setLoading] = useState<boolean>(false);
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskResponse[]>([]);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [projectFilter, setProjectFilter] = useState<string>(searchParams.get("projectId") || "All");
    const [projectTypeFilter, setProjectTypeFilter] = useState<string>("All");
    const [assigneeFilter, setAssigneeFilter] = useState<string>("All");
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<TaskResponse | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data = await taskManagementService.getAllTasks();
            setTasks(data);
            setFilteredTasks(data);
        } catch (error: any) {
            console.error("Error loading tasks:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to load tasks",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const data = await projectManagementService.getAllProjects();
            setProjects(data);
        } catch (error: any) {
            console.error("Error loading projects:", error);
        }
    };

    useEffect(() => {
        loadTasks();
        loadProjects();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = tasks;

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (task) =>
                    task.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.taskCode.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Project filter
        if (projectFilter !== "All") {
            filtered = filtered.filter((task) => task.projectId === parseInt(projectFilter));
        }

        // Status filter
        if (statusFilter !== "All") {
            filtered = filtered.filter((task) => getTaskStatus(task) === statusFilter);
        }

        // Project type filter
        if (projectTypeFilter !== "All") {
            filtered = filtered.filter((task) => {
                const project = projects.find((p) => parseInt(p.id) === task.projectId);
                const typeValue = projectTypeFilter === "Gaming" ? 1 : 2;
                return project?.projectType === typeValue;
            });
        }

        // Assignee filter
        if (assigneeFilter !== "All") {
            filtered = filtered.filter((task) => 
                task.assignees.some((assignee) => assignee.memberId === assigneeFilter)
            );
        }

        setFilteredTasks(filtered);
        setPage(0);
    }, [searchQuery, projectFilter, statusFilter, projectTypeFilter, assigneeFilter, tasks, projects]);

    const getTaskStatus = (task: TaskResponse): string => {
        // Mock status logic - in real app, this would come from task data
        const statuses = ["In Progress", "New", "Completed", "Rejected"];
        return statuses[task.id % statuses.length];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress":
                return "info";
            case "New":
                return "warning";
            case "Completed":
                return "success";
            case "Rejected":
                return "error";
            default:
                return "default";
        }
    };

    const getPriorityLabel = (priority: number): string => {
        switch (priority) {
            case 3:
                return "Critical";
            case 2:
                return "High";
            case 1:
                return "Medium";
            default:
                return "Low";
        }
    };

    const getPriorityColor = (priority: number): "error" | "warning" | "info" | "default" => {
        switch (priority) {
            case 3:
                return "error";
            case 2:
                return "warning";
            case 1:
                return "info";
            default:
                return "default";
        }
    };

    const handleTaskClick = (taskId: number) => {
        navigate(`/admin/project-management/tasks/${taskId}`);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: TaskResponse) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setSelectedTaskForMenu(task);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTaskForMenu(null);
    };

    const handleEdit = () => {
        if (selectedTaskForMenu) {
            console.log("Edit task:", selectedTaskForMenu.id);
            // Implement edit functionality
        }
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (!selectedTaskForMenu) return;

        if (!confirm("Are you sure you want to delete this task?")) {
            handleMenuClose();
            return;
        }

        try {
            await taskManagementService.deleteTask(selectedTaskForMenu.id);
            setSnackbar({
                open: true,
                message: "Task deleted successfully",
                severity: "success",
            });
            loadTasks();
        } catch (error: any) {
            console.error("Error deleting task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to delete task",
                severity: "error",
            });
        }
        handleMenuClose();
    };

    const handleApprove = async () => {
        if (!selectedTaskForMenu) return;

        try {
            await taskManagementService.approveTask(selectedTaskForMenu.id);
            setSnackbar({
                open: true,
                message: "Task approved successfully",
                severity: "success",
            });
            loadTasks();
        } catch (error: any) {
            console.error("Error approving task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to approve task",
                severity: "error",
            });
        }
        handleMenuClose();
    };

    const handleReject = async () => {
        if (!selectedTaskForMenu) return;

        try {
            await taskManagementService.rejectTask(selectedTaskForMenu.id);
            setSnackbar({
                open: true,
                message: "Task rejected successfully",
                severity: "success",
            });
            loadTasks();
        } catch (error: any) {
            console.error("Error rejecting task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to reject task",
                severity: "error",
            });
        }
        handleMenuClose();
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    return (
        <AdminLayout>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {loading && <LinearProgress sx={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 20 }} />}

            <Box sx={{ p: 3 }}>
                {/* Header & Filters */}
                <Card sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Search */}
                        <TextField
                            placeholder="Search task by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            sx={{ minWidth: 250 }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                            }}
                        />

                        {/* Project Filter */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Project Name</InputLabel>
                            <Select 
                                value={projectFilter} 
                                label="Project Name" 
                                onChange={(e) => setProjectFilter(e.target.value)}
                            >
                                <MenuItem value="All">All Projects</MenuItem>
                                {projectsSummary.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.projectName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Project Type Filter */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Project Type</InputLabel>
                            <Select
                                value={projectTypeFilter}
                                label="Project Type"
                                onChange={(e) => setProjectTypeFilter(e.target.value)}
                            >
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="Gaming">Gaming</MenuItem>
                                <MenuItem value="Non-Gaming">Non-Gaming</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Assignee Filter */}
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Assignees</InputLabel>
                            <Select
                                value={assigneeFilter}
                                label="Assignees"
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                            >
                                <MenuItem value="All">All Assignees</MenuItem>
                                {members.map((member) => (
                                    <MenuItem key={member.id} value={member.id.toString()}>
                                        {member.employeeName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Status Filter */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                                <MenuItem value="All">All</MenuItem>
                                <MenuItem value="In Progress">In Progress</MenuItem>
                                <MenuItem value="New">New</MenuItem>
                                <MenuItem value="Completed">Completed</MenuItem>
                                <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ flex: 1 }} />

                        {/* Create Task Button */}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                        >
                            Create task
                        </Button>
                    </Box>
                </Card>

                {/* Task List Table */}
                <Card>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Task list ({filteredTasks.length})
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#Key</TableCell>
                                    <TableCell>Task Title</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Assignees</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Due date</TableCell>
                                    <TableCell align="center">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => {
                                    const status = getTaskStatus(task);
                                    return (
                                        <TableRow
                                            key={task.id}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleTaskClick(task.id)}
                                        >
                                            <TableCell>{task.taskCode}</TableCell>
                                            <TableCell>{task.taskTitle}</TableCell>
                                            <TableCell>
                                                <Chip label={status} size="small" color={getStatusColor(status) as any} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Avatar
                                                        src={task.assignees[0]?.memberImage}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {task.assignees[0]?.memberName.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body2">{task.assignees[0]?.memberName}</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getPriorityLabel(task.priority)}
                                                    size="small"
                                                    color={getPriorityColor(task.priority)}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(task.dueDate)}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, task)}
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filteredTasks.length)} of{" "}
                            {filteredTasks.length}
                        </Typography>
                        <TablePagination
                            component="div"
                            count={filteredTasks.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[10, 20, 50]}
                        />
                    </Box>

                    {filteredTasks.length === 0 && !loading && (
                        <Box sx={{ textAlign: "center", py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                No tasks found
                            </Typography>
                        </Box>
                    )}
                </Card>
            </Box>

            {/* Action Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleApprove}>
                    <ApproveIcon fontSize="small" sx={{ mr: 1, color: "success.main" }} /> Approve
                </MenuItem>
                <MenuItem onClick={handleReject}>
                    <RejectIcon fontSize="small" sx={{ mr: 1, color: "error.main" }} /> Reject
                </MenuItem>
            </Menu>
        </AdminLayout>
    );
}
