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
    LinearProgress,
    Alert,
    Snackbar,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Autocomplete,
} from "@mui/material";
import {
    Edit as EditIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    AttachFile as AttachFileIcon,
    CalendarToday as CalendarIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
    taskManagementService,
    commentService,
    projectActivityLogService,
    projectManagementService,
} from "../services/projectManagementService";
import type { TaskResponse, CreateOrUpdateSubTaskRequest, CreateTaskRequest, TaskDetailResponse } from "../projectManagementTypes/taskType";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectResponse } from "../projectManagementTypes/projectType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";
import { FormatUtcTime } from "../utils/formatUtcTime";
import { PAGE_TITLES } from "../constants/pageTitles";

export default function AdminTaskDetailsPage() {
    useSetPageTitle(PAGE_TITLES.TASKDETAIL);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { priorities, statuses, members } = useAppData();

    const [task, setTask] = useState<TaskDetailResponse | null>(null);
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [openSubTaskDialog, setOpenSubTaskDialog] = useState<boolean>(false);
    const [openEditTaskDialog, setOpenEditTaskDialog] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    // SubTask form state
    const [subTaskForm, setSubTaskForm] = useState<CreateOrUpdateSubTaskRequest>({
        projectId: 0,
        parentId: 0,
        taskType: "SubTask",
        taskTitle: "",
        description: "",
        assignees: [],
        attachments: [],
        dueDate: "",
        startDate: "",
        priority: 1,
    });

    // Edit Task form state
    const [editTaskForm, setEditTaskForm] = useState<CreateTaskRequest>({
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

    useEffect(() => {
        if (id) {
            loadTaskDetails();
        }
    }, [id]);

    const loadTaskDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const taskData = await taskManagementService.getTaskById(parseInt(id));
            setTask(taskData);

            // Load project
            const projectData = await projectManagementService.getProjectById(taskData.projectId);
            setProject(projectData);

            // Load comments
            const commentsData = await commentService.getAllCommentsOfTask(parseInt(id));
            setComments(commentsData);

            // Load activity logs
            const logsData = await projectActivityLogService.getAllLogsOfTask(parseInt(id));
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
        if (!newComment.trim() || !id) return;

        try {
            await commentService.createComment({
                taskId: parseInt(id),
                description: newComment,
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
        if (!id) return;
        try {
            await taskManagementService.approveTask(parseInt(id));
            setSnackbar({
                open: true,
                message: "Task approved successfully",
                severity: "success",
            });
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
        if (!id) return;
        try {
            await taskManagementService.rejectTask(parseInt(id));
            setSnackbar({
                open: true,
                message: "Task rejected successfully",
                severity: "success",
            });
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

    const handlePriorityChange = async (newPriorityId: number) => {
        if (!id) return;
        try {
            await taskManagementService.changeTaskPriority({
                taskId: parseInt(id),
                newPriorityId,
            });
            setSnackbar({
                open: true,
                message: "Priority updated successfully",
                severity: "success",
            });
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error changing priority:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to change priority",
                severity: "error",
            });
        }
    };

    const handleStatusChange = async (newStatusId: string) => {
        if (!id) return;
        try {
            await taskManagementService.changeTaskStatus({
                taskId: parseInt(id),
                newStatusId,
            });
            setSnackbar({
                open: true,
                message: "Status updated successfully",
                severity: "success",
            });
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error changing status:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to change status",
                severity: "error",
            });
        }
    };

    const handleOpenSubTaskDialog = () => {
        if (!task) return;
        setSubTaskForm({
            projectId: task.projectId,
            parentId: task.taskId,
            taskType: "6", // Task
            taskTitle: "",
            description: "",
            assignees: [],
            attachments: [],
            dueDate: "",
            startDate: "",
            priority: 1,
        });
        setOpenSubTaskDialog(true);
    };

    const handleCreateSubTask = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("projectId", subTaskForm.projectId.toString());
            formDataToSend.append("parentId", subTaskForm.parentId.toString());
            formDataToSend.append("taskType", subTaskForm.taskType);
            formDataToSend.append("taskTitle", subTaskForm.taskTitle);
            formDataToSend.append("description", subTaskForm.description);
            formDataToSend.append("dueDate", subTaskForm.dueDate);
            formDataToSend.append("startDate", subTaskForm.startDate);
            formDataToSend.append("priority", subTaskForm.priority.toString());

            subTaskForm.assignees.forEach((assignee) => {
                formDataToSend.append("assignees", assignee.toString());
            });

            await taskManagementService.createOrUpdateSubTask(formDataToSend);
            setSnackbar({
                open: true,
                message: "Subtask created successfully",
                severity: "success",
            });
            setOpenSubTaskDialog(false);
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error creating subtask:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to create subtask",
                severity: "error",
            });
        }
    };

    const handleOpenEditTaskDialog = () => {
        if (!task) return;
        setEditTaskForm({
            projectId: task.projectId,
            taskType: task.taskType,
            taskTitle: task.taskTitle,
            description: task.description,
            assignees: task.assignees.map((a) => parseInt(a.memberId)),
            attachments: [],
            dueDate: task.dueDate.split("T")[0],
            startDate: task.startDate.split("T")[0],
            priority: task.priority,
        });
        setOpenEditTaskDialog(true);
    };

    const handleUpdateTask = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append("projectId", editTaskForm.projectId.toString());
            formDataToSend.append("taskType", editTaskForm.taskType);
            formDataToSend.append("taskTitle", editTaskForm.taskTitle);
            formDataToSend.append("description", editTaskForm.description);
            formDataToSend.append("dueDate", editTaskForm.dueDate);
            formDataToSend.append("startDate", editTaskForm.startDate);
            formDataToSend.append("priority", editTaskForm.priority.toString());

            editTaskForm.assignees.forEach((assignee) => {
                formDataToSend.append("assignees", assignee.toString());
            });

            editTaskForm.attachments.forEach((file) => {
                formDataToSend.append("attachments", file);
            });

            await taskManagementService.updateTask(parseInt(id), formDataToSend);
            setSnackbar({
                open: true,
                message: "Task updated successfully",
                severity: "success",
            });
            setOpenEditTaskDialog(false);
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error updating task:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to update task",
                severity: "error",
            });
        } finally {
            setLoading(false);
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

    const getPriorityByValue = (priority: number) => {
        return priorities.find((p) => p.level === priority);
    };

    const getCurrentStatus = () => {
        if (!task) return null;
        return statuses.find((s) => s.id === task.statusId) || null;
    };

    const getChipColorByActionName = (actionName: string) => {
        const status = statuses.find((s) => s.name.toLowerCase() === actionName.toLowerCase());
        return status ? status.color : "action.main";
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
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
                    <IconButton onClick={() => navigate("/admin-tasks")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700}>
                            {task?.taskCode}: {task?.taskTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Created by {task?.createdBy} • {FormatUtcTime.formatDateTime(task?.createdAt)}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={handleApprove}
                        size="large"
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={handleReject}
                        size="large"
                    >
                        Reject
                    </Button>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3 }}>
                    {/* Left Column */}
                    <Box>
                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                size="small"
                                onClick={handleOpenEditTaskDialog}
                                sx={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                }}
                            >
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
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                📄 Description
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                                {task?.description ||
                                    "As a user, I need to be able to log in using email and password so that I can access my personalized dashboard. Ensure password complexity requirements are met and include a 'Forgot Password' flow.\n\nAcceptance Criteria:\n• User can enter email and password.\n• Validation for email format and password strength.\n• Error handling for incorrect credentials.\n• Redirect to dashboard on success."}
                            </Typography>
                        </Card>

                        {/* Attachments */}
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Attachments
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {task?.attachments.map((attachment) => (
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
                                                    {attachment.fileName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {attachment.fileSize} • {FormatUtcTime.formatDateTime(attachment.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton size="small">🗑️</IconButton>
                                            <IconButton size="small">☁️</IconButton>
                                        </Box>
                                    </Box>
                                ))}
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
                                    
                                </Box>
                            </Box>
                        </Card>

                        {/* Sub-Tasks */}
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Sub-Task
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenSubTaskDialog}
                                >
                                    Add Sub-Task
                                </Button>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {task?.subTasks.map((subTask) => (
                                    <FormControlLabel
                                        key={subTask.subTaskId}
                                        control={<Checkbox defaultChecked />}
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {subTask.taskTitle}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Created by {subTask.createdBy} {subTask.createdAt} • Assignee: {subTask.assignee}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Box>
                        </Card>

                        {/* Comments */}
                        <Card sx={{ p: 3 }}>
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                    }}
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
                                            {FormatUtcTime.getTimeVietnamAgoUTC(comment.createdAt)}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                            {comment.description}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}

                            {comments.length === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                    No comments yet
                                </Typography>
                            )}
                        </Card>
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

                                {/* Status - Dropdown */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Status
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={getCurrentStatus()?.id || ""}
                                            onChange={(e) => handleStatusChange(String(e.target.value))}
                                            displayEmpty
                                        >
                                            {statuses.map((status) => (
                                                <MenuItem key={status.id} value={status.id}>
                                                    <Chip
                                                        label={status.name}
                                                        color={status.color as any}
                                                        size="medium"
                                                        sx={{
                                                            bgcolor: status.color,
                                                            color: status.color,
                                                        }}
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Priority - Dropdown */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Priority
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={task?.priority || ""}
                                            onChange={(e) => handlePriorityChange(e.target.value as number)}
                                            displayEmpty
                                        >
                                            {priorities.map((priority) => (
                                                <MenuItem key={priority.id} value={priority.level}>
                                                    <Chip
                                                        label={priority.name}
                                                        color={priority.color as any}
                                                        size="medium"
                                                        sx={{
                                                            bgcolor: priority.color,
                                                            color: "white",
                                                        }}
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
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
                                                <Chip
                                                    label={log.actionType}
                                                    color={getChipColorByActionName(log.actionType) as any}
                                                    size="small"
                                                />
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {FormatUtcTime.getTimeVietnamAgoUTC(log.timeStamp)}
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
            </Box>

            {/* Add SubTask Dialog */}
            <Dialog open={openSubTaskDialog} onClose={() => setOpenSubTaskDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Sub-Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Task Title"
                            value={subTaskForm.taskTitle}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, taskTitle: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={subTaskForm.description}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, description: e.target.value })}
                        />
                        <Autocomplete
                            multiple
                            options={members}
                            getOptionLabel={(option) => option.employeeName}
                            value={members.filter((emp) => subTaskForm.assignees.includes(emp.id))}
                            onChange={(_, value) =>
                                setSubTaskForm({ ...subTaskForm, assignees: value.map((v) => v.id) })
                            }
                            renderInput={(params) => <TextField {...params} label="Assignees" />}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={subTaskForm.priority}
                                label="Priority"
                                onChange={(e) =>
                                    setSubTaskForm({ ...subTaskForm, priority: e.target.value as number })
                                }
                            >
                                {priorities.map((priority) => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={subTaskForm.startDate}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            type="date"
                            label="Due Date"
                            value={subTaskForm.dueDate}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSubTaskDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateSubTask}>
                        Create Sub-Task
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Task Dialog */}
            <Dialog open={openEditTaskDialog} onClose={() => setOpenEditTaskDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <TextField
                            label="Task Title"
                            fullWidth
                            value={editTaskForm.taskTitle}
                            onChange={(e) => setEditTaskForm({ ...editTaskForm, taskTitle: e.target.value })}
                        />

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editTaskForm.description}
                            onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                        />

                        <Autocomplete
                            multiple
                            options={members}
                            getOptionLabel={(option) => option.employeeName}
                            value={members.filter((emp) => editTaskForm.assignees.includes(emp.id))}
                            onChange={(_, value) =>
                                setEditTaskForm({ ...editTaskForm, assignees: value.map((v) => v.id) })
                            }
                            renderInput={(params) => <TextField {...params} label="Assignees" />}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={editTaskForm.priority}
                                label="Priority"
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: Number(e.target.value) })}
                            >
                                {priorities.map((priority) => (
                                    <MenuItem key={priority.id} value={priority.level}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Start Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={editTaskForm.startDate}
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, startDate: e.target.value })}
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
                                InputLabelProps={{ shrink: true }}
                                value={editTaskForm.dueDate}
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                                onFocus={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (input.showPicker) {
                                        input.showPicker();
                                    }
                                }}
                            />
                        </Box>

                        <Button
                            variant="outlined"
                            component="label"
                        >
                            Upload Attachments
                            <input
                                type="file"
                                hidden
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setEditTaskForm({
                                            ...editTaskForm,
                                            attachments: Array.from(e.target.files)
                                        });
                                    }
                                }}
                            />
                        </Button>
                        {editTaskForm.attachments.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {editTaskForm.attachments.length} file(s) selected
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditTaskDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdateTask}
                        variant="contained"
                        disabled={!editTaskForm.taskTitle}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}
