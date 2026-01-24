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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
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
import { type TaskResponse, type CreateTaskRequest, TaskType } from "../projectManagementTypes/taskType";
import type { ProjectResponse, ProjectSummaryResponse } from "../projectManagementTypes/projectType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";

export default function AdminTasksPage() {
    useSetPageTitle("Task Management");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { members, priorities, statuses } = useAppData();

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
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
    const [projectsSummary, setProjectsSummary] = useState<ProjectSummaryResponse[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    const [formData, setFormData] = useState<CreateTaskRequest>({
        projectId: 0,
        taskType: "Task",
        taskTitle: "",
        description: "",
        assignees: [],
        attachments: [],
        dueDate: "",
        startDate: "",
        priority: 1,
    });

    const [validationErrors, setValidationErrors] = useState<{
        projectId?: string;
        taskTitle?: string;
        taskType?: string;
        description?: string;
        assignees?: string;
        priority?: string;
        startDate?: string;
        dueDate?: string;
    }>({});

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

    const loadSummaryProjects = async () => {
        try {
            const data = await projectManagementService.getProjectsSummary();
            setProjectsSummary(data);
        } catch (error: any) {
            console.error("Error loading projects:", error);
        }
    };

    useEffect(() => {
        loadTasks();
        loadSummaryProjects();
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
            filtered = filtered.filter((task) => task.statusId === parseInt(statusFilter));
        }

        // Project type filter
        if (projectTypeFilter !== "All") {
            filtered = filtered.filter((task) => {
                return task?.projectTypeName === projectTypeFilter;
            });
        }

        // Assignee filter
        if (assigneeFilter !== "All") {
            filtered = filtered.filter((task) =>
                task.assignees.some((assignee) => assignee.memberId === parseInt(assigneeFilter))
            );
        }

        setFilteredTasks(filtered);
        setPage(0);
    }, [searchQuery, projectFilter, statusFilter, projectTypeFilter, assigneeFilter, tasks, projects]);

    const getTaskStatus = (task: TaskResponse): string => {
        // Mock status logic - in real app, this would come from task data
        const statuses = ["In Progress", "New", "Completed", "Rejected"];
        return statuses[task.taskId % statuses.length];
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
            setEditingTask(selectedTaskForMenu);
            setFormData({
                projectId: selectedTaskForMenu.projectId,
                taskType: selectedTaskForMenu.taskType,
                taskTitle: selectedTaskForMenu.taskTitle,
                description: selectedTaskForMenu.description,
                assignees: selectedTaskForMenu.assignees.map((a) => a.memberId),
                attachments: [],
                dueDate: selectedTaskForMenu.dueDate.split("T")[0],
                startDate: selectedTaskForMenu.startDate.split("T")[0],
                priority: selectedTaskForMenu.priority,
            });
            setValidationErrors({});
            setOpenDialog(true);
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
            await taskManagementService.deleteTask(selectedTaskForMenu.taskId);
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
            await taskManagementService.approveTask(selectedTaskForMenu.taskId);
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
            await taskManagementService.rejectTask(selectedTaskForMenu.taskId);
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

    const validateField = (fieldName: keyof CreateTaskRequest, value: any): string | undefined => {
        switch (fieldName) {
            case 'projectId':
                return !value || value === 0 ? 'Project is required' : undefined;
            case 'taskTitle':
                return !value || value.trim() === '' ? 'Task Title is required' : undefined;
            case 'taskType':
                return !value || value === '' ? 'Task Type is required' : undefined;
            case 'description':
                return !value || value.trim() === '' ? 'Description is required' : undefined;
            case 'assignees':
                return !value || value.length === 0 ? 'At least one Assignee is required' : undefined;
            case 'startDate':
                return !value ? 'Start Date is required' : undefined;
            case 'dueDate':
                if (!value) return 'Due Date is required';
                if (formData.startDate && new Date(value) < new Date(formData.startDate)) {
                    return 'Due Date must be after Start Date';
                }
                return undefined;
            default:
                return undefined;
        }
    };

    const validateAllFields = (): boolean => {
        const errors: any = {};
        let isValid = true;

        const fieldsToValidate: (keyof CreateTaskRequest)[] = [
            'projectId',
            'taskTitle',
            'taskType',
            'description',
            'assignees',
            'startDate',
            'dueDate'
        ];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    const handleFieldBlur = (fieldName: keyof CreateTaskRequest) => {
        const error = validateField(fieldName, formData[fieldName]);
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    const isFormValid = (): boolean => {
        return formData.projectId !== 0 &&
            formData.taskTitle.trim() !== '' &&
            formData.taskType !== '' &&
            formData.description.trim() !== '' &&
            formData.assignees.length > 0 &&
            formData.startDate !== '' &&
            formData.dueDate !== '' &&
            !validationErrors.dueDate;
    };

    const handleOpenDialog = () => {
        setEditingTask(null);
        setFormData({
            projectId: projectFilter !== "All" ? parseInt(projectFilter) : 0,
            taskType: "Task",
            taskTitle: "",
            description: "",
            assignees: [],
            attachments: [],
            dueDate: "",
            startDate: "",
            priority: 1,
        });
        setValidationErrors({});
        setOpenDialog(true);
    };

    const handleCreateOrUpdateTask = async () => {
        if (!validateAllFields()) {
            setSnackbar({
                open: true,
                message: "Please fill in all required fields correctly",
                severity: "error",
            });
            return;
        }

        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append("ProjectId", formData.projectId.toString());
            formDataToSend.append("TaskType", formData.taskType);
            formDataToSend.append("TaskTitle", formData.taskTitle);
            formDataToSend.append("Description", formData.description);
            formDataToSend.append("DueDate", formData.dueDate);
            formDataToSend.append("StartDate", formData.startDate);
            formDataToSend.append("Priority", formData.priority.toString());

            formData.assignees.forEach((assignee) => {
                formDataToSend.append("Assignees", assignee.toString());
            });

            formData.attachments.forEach((file) => {
                formDataToSend.append("Attachments", file);
            });

            if (editingTask) {
                await taskManagementService.updateTask(editingTask.taskId, formDataToSend);
                setSnackbar({
                    open: true,
                    message: "Task updated successfully",
                    severity: "success",
                });
            } else {
                await taskManagementService.createTask(formDataToSend);
                setSnackbar({
                    open: true,
                    message: "Task created successfully",
                    severity: "success",
                });
            }
            setOpenDialog(false);
            loadTasks();
        } catch (error: any) {
            console.error("Error saving task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to save task",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
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
                                <MenuItem value="NonGaming">Non-Gaming</MenuItem>
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
                                {statuses.filter((status) => status.entityType === 'Task').map((status) => (
                                    <MenuItem key={status.id} value={status.id}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ flex: 1 }} />

                        {/* Create Task Button */}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDialog}
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
                                            key={task.taskId}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => handleTaskClick(task.taskId)}
                                        >
                                            <TableCell>{task.taskCode}</TableCell>
                                            <TableCell>{task.taskTitle}</TableCell>
                                            <TableCell>
                                                <Chip label={task.statusName} size="small" color={task.statusColor as any} />
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
                                                    label={task.priorityName}
                                                    size="small"
                                                    color={task.priorityColor as any}
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

            {/* Create/Edit Task Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <FormControl fullWidth required error={!!validationErrors.projectId}>
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={formData.projectId || ""}
                                label="Project"
                                onChange={(e) => {
                                    setFormData({ ...formData, projectId: e.target.value as number });
                                    if (validationErrors.projectId) {
                                        setValidationErrors({ ...validationErrors, projectId: undefined });
                                    }
                                }}
                                onBlur={() => handleFieldBlur('projectId')}
                            >
                                {projectsSummary.map((project) => (
                                    <MenuItem key={project.id} value={parseInt(project.id)}>
                                        {project.projectName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {validationErrors.projectId && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                    {validationErrors.projectId}
                                </Typography>
                            )}
                        </FormControl>

                        <TextField
                            label="Task Title"
                            fullWidth
                            required
                            value={formData.taskTitle}
                            onChange={(e) => {
                                setFormData({ ...formData, taskTitle: e.target.value });
                                if (validationErrors.taskTitle) {
                                    setValidationErrors({ ...validationErrors, taskTitle: undefined });
                                }
                            }}
                            onBlur={() => handleFieldBlur('taskTitle')}
                            error={!!validationErrors.taskTitle}
                            helperText={validationErrors.taskTitle}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth required error={!!validationErrors.taskType}>
                                    <InputLabel>Task Type</InputLabel>
                                    <Select
                                        value={formData.taskType}
                                        label="Task Type"
                                        onChange={(e) => {
                                            setFormData({ ...formData, taskType: e.target.value });
                                            if (validationErrors.taskType) {
                                                setValidationErrors({ ...validationErrors, taskType: undefined });
                                            }
                                        }}
                                        onBlur={() => handleFieldBlur('taskType')}
                                    >
                                        {TaskType.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {validationErrors.taskType && (
                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                            {validationErrors.taskType}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={formData.priority}
                                        label="Priority"
                                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                    >
                                        {priorities.filter((priority) => priority.entityType === 'Task').map((priority) => (
                                            <MenuItem key={priority.id} value={priority.level}>
                                                {priority.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.startDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, startDate: e.target.value });
                                    if (validationErrors.startDate) {
                                        setValidationErrors({ ...validationErrors, startDate: undefined });
                                    }
                                    // Re-validate due date when start date changes
                                    if (formData.dueDate) {
                                        const dueDateError = validateField('dueDate', formData.dueDate);
                                        setValidationErrors(prev => ({ ...prev, dueDate: dueDateError }));
                                    }
                                }}
                                onBlur={() => handleFieldBlur('startDate')}
                                error={!!validationErrors.startDate}
                                helperText={validationErrors.startDate}
                                onFocus={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (input.showPicker) {
                                        input.showPicker();
                                    }
                                }}
                            />

                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.dueDate}
                                onChange={(e) => {
                                    setFormData({ ...formData, dueDate: e.target.value });
                                    if (validationErrors.dueDate) {
                                        setValidationErrors({ ...validationErrors, dueDate: undefined });
                                    }
                                }}
                                onBlur={() => handleFieldBlur('dueDate')}
                                error={!!validationErrors.dueDate}
                                helperText={validationErrors.dueDate}
                                onFocus={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (input.showPicker) {
                                        input.showPicker();
                                    }
                                }}
                            />
                        </Box>

                        <Autocomplete
                            multiple
                            options={members}
                            getOptionLabel={(option) => option.employeeName}
                            value={members.filter((emp) => formData.assignees.includes(emp.id))}
                            onChange={(_, value) => {
                                setFormData({ ...formData, assignees: value.map((v) => v.id) });
                                if (validationErrors.assignees) {
                                    setValidationErrors({ ...validationErrors, assignees: undefined });
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Assignees"
                                    required
                                    error={!!validationErrors.assignees}
                                    helperText={validationErrors.assignees}
                                    onBlur={() => handleFieldBlur('assignees')}
                                />
                            )}
                        />



                        <TextField
                            label="Description"
                            fullWidth
                            required
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                if (validationErrors.description) {
                                    setValidationErrors({ ...validationErrors, description: undefined });
                                }
                            }}
                            onBlur={() => handleFieldBlur('description')}
                            error={!!validationErrors.description}
                            helperText={validationErrors.description}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            size="large"
                        >
                            📎Upload Attachments
                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setFormData({
                                            ...formData,
                                            attachments: Array.from(e.target.files)
                                        });
                                    }
                                }}
                            />
                        </Button>
                        {formData.attachments.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {formData.attachments.length} file(s) selected
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateOrUpdateTask}
                        variant="contained"
                        disabled={!isFormValid() || loading}
                    >
                        {editingTask ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}
