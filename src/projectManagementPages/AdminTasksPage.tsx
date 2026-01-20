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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Alert,
    Snackbar,
    Tooltip,
    AvatarGroup,
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
    AttachFile as AttachFileIcon,
    CalendarToday as CalendarIcon,
    Share as ShareIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import {
    taskManagementService,
    commentService,
    projectActivityLogService,
    projectManagementService,
} from "../services/projectManagementService";
import type { TaskResponse } from "../projectManagementTypes/taskType";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectResponse } from "../projectManagementTypes/projectType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";

interface TaskDetailDialogProps {
    open: boolean;
    taskId: number | null;
    onClose: () => void;
    onTaskUpdated: () => void;
}

function TaskDetailDialog({ open, taskId, onClose, onTaskUpdated }: TaskDetailDialogProps) {
    const [task, setTask] = useState<TaskResponse | null>(null);
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    useEffect(() => {
        if (open && taskId) {
            loadTaskDetails();
        }
    }, [open, taskId]);

    const loadTaskDetails = async () => {
        if (!taskId) return;
        setLoading(true);
        try {
            const taskData = await taskManagementService.getTaskById(taskId);
            setTask(taskData);

            // Load project
            const projectData = await projectManagementService.getProjectById(taskData.projectId);
            setProject(projectData);

            // Load comments
            const commentsData = await commentService.getAllCommentsOfTask(taskId);
            setComments(commentsData);

            // Load activity logs
            const logsData = await projectActivityLogService.getAllLogsOfTask(taskId);
            setActivityLogs(logsData);
        } catch (error: any) {
            console.error("Error loading task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to load task",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !taskId) return;

        try {
            await commentService.createComment({
                taskId: taskId,
                content: newComment,
            });
            setNewComment("");
            setSnackbar({
                open: true,
                message: "Comment added successfully",
                severity: "success",
            });
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error adding comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to add comment",
                severity: "error",
            });
        }
    };

    const handleApprove = async () => {
        if (!taskId) return;
        try {
            await taskManagementService.approveTask(taskId);
            setSnackbar({
                open: true,
                message: "Task approved successfully",
                severity: "success",
            });
            onTaskUpdated();
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error approving task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to approve task",
                severity: "error",
            });
        }
    };

    const handleReject = async () => {
        if (!taskId) return;
        try {
            await taskManagementService.rejectTask(taskId);
            setSnackbar({
                open: true,
                message: "Task rejected successfully",
                severity: "success",
            });
            onTaskUpdated();
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error rejecting task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to reject task",
                severity: "error",
            });
        }
    };

    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(date);
    };

    const getTimeAgo = (dateString: string | Date) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
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

    return (
        <>
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

            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                {loading && <LinearProgress />}
                <DialogTitle>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6" fontWeight={700}>
                            {task?.taskCode}: {task?.taskTitle}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ApproveIcon />}
                                onClick={handleApprove}
                                size="small"
                            >
                                Approve
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={handleReject}
                                size="small"
                            >
                                Reject
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        Created by Jane Doe • Oct 10, 2023
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3 }}>
                        {/* Left Column */}
                        <Box>
                            {/* Action Buttons */}
                            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                                <Button variant="outlined" startIcon={<EditIcon />} size="small">
                                    Edit Task
                                </Button>
                                <Button variant="outlined" startIcon={<ShareIcon />} size="small">
                                    Share
                                </Button>
                                <Button variant="outlined" size="small">
                                    📋 Copy Link
                                </Button>
                                <IconButton size="small">
                                    <MoreVertIcon />
                                </IconButton>
                            </Box>

                            {/* Description */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    📄 Description
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                                    {task?.description ||
                                        "As a user, I need to be able to log in using email and password so that I can access my personalized dashboard. Ensure password complexity requirements are met and include a 'Forgot Password' flow.\n\nAcceptance Criteria:\n• User can enter email and password.\n• Validation for email format and password strength.\n• Error handling for incorrect credentials.\n• Redirect to dashboard on success."}
                                </Typography>
                            </Box>

                            {/* Attachments */}
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Attachments
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 1.5,
                                            bgcolor: "warning.lighter",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <AttachFileIcon fontSize="small" />
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    Screen-versions.png
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    34 KB • 23 Aug 2022 2:36pm
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton size="small">🗑️</IconButton>
                                            <IconButton size="small">☁️</IconButton>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            p: 1.5,
                                            bgcolor: "warning.lighter",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <AttachFileIcon fontSize="small" />
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    Mockups.png
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    174 KB • 23 Aug 2022 2:36pm
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton size="small">🗑️</IconButton>
                                            <IconButton size="small">☁️</IconButton>
                                        </Box>
                                    </Box>
                                    <Box
                                        sx={{
                                            border: "2px dashed",
                                            borderColor: "primary.main",
                                            borderRadius: 2,
                                            p: 2,
                                            textAlign: "center",
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "action.hover" },
                                        }}
                                    >
                                        <Typography variant="body2" color="primary">
                                            📎 Choose files
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Comments */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Comment
                                </Typography>
                                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                                    <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
                                    <TextField
                                        fullWidth
                                        placeholder="Add a comment"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        size="small"
                                    />
                                    <Button variant="contained" onClick={handleAddComment} disabled={!newComment.trim()}>
                                        Comment
                                    </Button>
                                </Box>

                                {comments.map((comment) => (
                                    <Box key={comment.id} sx={{ display: "flex", gap: 2, mb: 2 }}>
                                        <Avatar sx={{ width: 32, height: 32 }}>
                                            {comment.memberName.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="body2" fontWeight={600} color="primary">
                                                    {comment.memberName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Commented
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {getTimeAgo(comment.createdAt)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {comment.content}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}

                                {comments.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                        No comments yet
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Right Column - Details */}
                        <Box>
                            <Card variant="outlined">
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Detail
                                    </Typography>

                                    {/* Project Name */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Project Name
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {project?.projectName}
                                        </Typography>
                                    </Box>

                                    {/* Task Type */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Task Type
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                icon={<span>✓</span>}
                                                label="Task"
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Box>

                                    {/* Status */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip label="In Progress" size="small" color="info" />
                                        </Box>
                                    </Box>

                                    {/* Priority */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Priority
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                label={getPriorityLabel(task?.priority || 0)}
                                                size="small"
                                                color={getPriorityColor(task?.priority || 0)}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Assignees */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Assignees
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24 }}>
                                                    {task?.assignees[0]?.memberName.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2">{task?.assignees[0]?.memberName}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Start Date */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Start Date
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{formatDate(task?.startDate || new Date())}</Typography>
                                        </Box>
                                    </Box>

                                    {/* Due Date */}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Due Date
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{formatDate(task?.dueDate || new Date())}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Card>

                            {/* Activity Log */}
                            <Card variant="outlined" sx={{ mt: 2 }}>
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Activity Log
                                    </Typography>

                                    {activityLogs.map((log) => (
                                        <Box key={log.id} sx={{ mb: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="body2" fontWeight={600} color="primary">
                                                    {log.memberAction}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {log.actionType}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {getTimeAgo(log.timestamp)}
                                            </Typography>
                                            {log.details && (
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    {log.details}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}

                                    {activityLogs.length === 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                            No activity logs yet
                                        </Typography>
                                    )}
                                </Box>
                            </Card>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default function AdminTasksPage() {
    useSetPageTitle("Task Management");
    const [loading, setLoading] = useState<boolean>(false);
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<TaskResponse[]>([]);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [projectTypeFilter, setProjectTypeFilter] = useState<string>("All");
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [selectedTask, setSelectedTask] = useState<number | null>(null);
    const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
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

        // Status filter
        if (statusFilter !== "All") {
            filtered = filtered.filter((task) => getTaskStatus(task) === statusFilter);
        }

        // Project type filter
        if (projectTypeFilter !== "All") {
            filtered = filtered.filter((task) => {
                const project = projects.find((p) => parseInt(p.id) === task.projectId);
                return project?.projectType === projectTypeFilter;
            });
        }

        setFilteredTasks(filtered);
        setPage(0);
    }, [searchQuery, statusFilter, projectTypeFilter, tasks, projects]);

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
        setSelectedTask(taskId);
        setTaskDialogOpen(true);
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
                                <MenuItem value="Non-gaming">Non-gaming</MenuItem>
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

            {/* Task Detail Dialog */}
            <TaskDetailDialog
                open={taskDialogOpen}
                taskId={selectedTask}
                onClose={() => {
                    setTaskDialogOpen(false);
                    setSelectedTask(null);
                }}
                onTaskUpdated={loadTasks}
            />
        </AdminLayout>
    );
}
