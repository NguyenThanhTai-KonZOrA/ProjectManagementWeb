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
    AvatarGroup,
    Chip,
    IconButton,
    Tooltip,
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
    CheckCircle,
    Cancel as RejectIcon,
    ArrowBack as ArrowBackIcon,
    Add as AddIcon,
    BugReport as BugIcon,
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
import type { ProjectDetailsResponse, ProjectResponse } from "../projectManagementTypes/projectType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";
import { FormatUtcTime } from "../utils/formatUtcTime";
import { PAGE_TITLES } from "../constants/pageTitles";
import CommentSection from "../components/CommentSection";
import type { TaskAttachmentsResponse } from "../projectManagementTypes/taskAttachmentsType";
import { useIsProjectManager } from "../hooks/useIsProjectManager";
import { extractErrorMessage } from "../utils/errorHandler";

export default function AdminTaskDetailsPage() {
    useSetPageTitle(PAGE_TITLES.TASKDETAIL);
    const API_BASE = (window as any)._env_?.API_BASE;
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { priorities, statuses, members } = useAppData();
    const isProjectManager = useIsProjectManager();

    const [task, setTask] = useState<TaskDetailResponse | null>(null);
    const [project, setProject] = useState<ProjectDetailsResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [openSubTaskDialog, setOpenSubTaskDialog] = useState<boolean>(false);
    const [openBugTaskDialog, setOpenBugTaskDialog] = useState<boolean>(false);
    const [openEditTaskDialog, setOpenEditTaskDialog] = useState<boolean>(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

    // Bug Task form state
    const [bugTaskForm, setBugTaskForm] = useState<CreateOrUpdateSubTaskRequest>({
        projectId: 0,
        parentId: 0,
        taskType: "Bug",
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

    const handleCommentSubmit = async (description: string, parentCommentId?: number) => {
        if (!id) return;
        try {
            await commentService.createComment({
                taskId: parseInt(id),
                description,
                parentCommentId,
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

    const handleUpdateComment = async (commentId: number, description: string) => {
        if (!id) return;
        try {
            await commentService.updateComment(commentId, {
                taskId: parseInt(id),
                description,
                commentId: commentId,
            });
            loadTaskDetails();
            setSnackbar({
                open: true,
                message: "Comment updated successfully",
                severity: "success",
            });
        } catch (error: any) {
            console.error("Error updating comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to update comment",
                severity: "error",
            });
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await commentService.deleteComment(commentId);
            loadTaskDetails();
            setSnackbar({
                open: true,
                message: "Comment deleted successfully",
                severity: "success",
            });
        } catch (error: any) {
            console.error("Error deleting comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to delete comment",
                severity: "error",
            });
        }
    };

    const findCommentById = (comments: CommentResponse[], commentId: number): CommentResponse | null => {
        for (const comment of comments) {
            if (comment.id === commentId) return comment;
            if (comment.replies && comment.replies.length > 0) {
                const found = findCommentById(comment.replies, commentId);
                if (found) return found;
            }
        }
        return null;
    };

    const handleReactionToggle = async (commentId: number, reactionType: number) => {
        try {
            const comment = findCommentById(comments, commentId);
            if (!comment) return;

            // If user already has this reaction, delete it, otherwise create it
            if (comment.currentUserReaction === reactionType) {
                await commentService.deleteReaction(commentId);
            } else {
                await commentService.createReaction({
                    commentId,
                    reactionType,
                });
            }
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error toggling reaction:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to toggle reaction",
                severity: "error",
            });
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setSelectedFiles(Array.from(files));
        }
    };

    const handleUploadAttachments = async () => {
        if (!id || selectedFiles.length === 0) return;
        try {
            const formData = new FormData();
            formData.append("taskId", id);
            selectedFiles.forEach((file) => {
                formData.append("attachments", file);
            });

            await taskManagementService.uploadAttachmentsTask(parseInt(id), formData);
            setSnackbar({
                open: true,
                message: "Files uploaded successfully",
                severity: "success",
            });
            setSelectedFiles([]);
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error uploading files:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to upload files",
                severity: "error",
            });
        }
    };

    const handleSubTaskClick = (subTaskId: number) => {
        navigate(`/admin/project-management/tasks/${subTaskId}`);
    };

    const handleApprove = async () => {
        if (!id) return;
        if (task?.isApproved) {
            setSnackbar({
                open: true,
                message: "This task is already approved!",
                severity: "info",
            });
            return;
        }
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

    const handleOpenBugTaskDialog = () => {
        if (!task) return;
        setBugTaskForm({
            projectId: task.projectId,
            parentId: task.taskId,
            taskType: "2", // Bug
            taskTitle: "",
            description: "",
            assignees: [],
            attachments: [],
            dueDate: "",
            startDate: "",
            priority: 1,
        });
        setOpenBugTaskDialog(true);
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
            console.error("Error saving task:", error);
            const errorMessage = extractErrorMessage(error, "Failed to load applications data");
            setSnackbar({
                open: true,
                message: errorMessage || "Failed to save sub task",
                severity: "error",
            });
        }
    };

    const handleCreateBugTask = async () => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("projectId", bugTaskForm.projectId.toString());
            formDataToSend.append("parentId", bugTaskForm.parentId.toString());
            formDataToSend.append("taskType", bugTaskForm.taskType);
            formDataToSend.append("taskTitle", bugTaskForm.taskTitle);
            formDataToSend.append("description", bugTaskForm.description);
            formDataToSend.append("dueDate", bugTaskForm.dueDate);
            formDataToSend.append("startDate", bugTaskForm.startDate);
            formDataToSend.append("priority", bugTaskForm.priority.toString());

            bugTaskForm.assignees.forEach((assignee) => {
                formDataToSend.append("assignees", assignee.toString());
            });

            await taskManagementService.createOrUpdateBugTask(formDataToSend);
            setSnackbar({
                open: true,
                message: "Bug task created successfully",
                severity: "success",
            });
            setOpenBugTaskDialog(false);
            loadTaskDetails();
        } catch (error: any) {
            console.error("Error saving task:", error);
            const errorMessage = extractErrorMessage(error, "Failed to load applications data");
            setSnackbar({
                open: true,
                message: errorMessage || "Failed to save bug task",
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
            assignees: task.assignees.map((a) => a.memberId),
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

    const handleDeleteAttachment = async (attachmentId: number) => {
        setLoading(true);
        if (!attachmentId) return;

        await taskManagementService.deleteAttachmentsTask(attachmentId)
            .then(() => {
                setSnackbar({
                    open: true,
                    message: "Attachment deleted successfully",
                    severity: "success",
                });
            })
            .catch((error) => {
                console.error("Error deleting attachment:", error);
                setSnackbar({
                    open: true,
                    message: error?.response?.data?.message || "Failed to delete attachment",
                    severity: "error",
                });
            });

        loadTaskDetails();
        setLoading(false);
    }

    const handleDownloadAttachment = async (attachment: TaskAttachmentsResponse) => {
        setLoading(true);
        if (!attachment) return;
        const url = window.URL.createObjectURL(new Blob([API_BASE + attachment.fileUrl]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${attachment.fileName}`);
        document.body.appendChild(link);
        link.click();
        loadTaskDetails();
        setLoading(false);
    };

    // if task.isApproved is true, only show status New, Publish, Cancle
    // if task.isRejected disable all status change
    const reSetStatus = () => {
        if (task?.isApproved || task?.isApproved === null) {
            return statuses.filter(s => s.name === 'New' || s.name === 'Publish' || s.name === 'Cancel');
        } else if (task?.isRejected) {
            return statuses.filter(s => s.id === task.statusId);
        } else {
            return statuses;
        }
    }

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
                        disabled={task?.isRejected || !isProjectManager}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={handleReject}
                        size="large"
                        disabled={task?.isApproved || task?.isRejected || !isProjectManager}
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
                                disabled={task?.isRejected}
                                sx={{
                                    background: task?.isRejected ? "grey.400" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                }}
                            >
                                Edit Task
                            </Button>
                            <Button variant="outlined" startIcon={<ShareIcon />} size="small" disabled={task?.isRejected}>
                                Share
                            </Button>
                            <Button variant="outlined" size="small" disabled={task?.isRejected}>
                                📋 Copy Link
                            </Button>
                            <IconButton size="small" disabled={task?.isRejected}>
                                <MoreVertIcon />
                            </IconButton>

                            <Typography variant="h6" color="error" sx={{ alignSelf: "center", ml: "auto" }}>
                                {task?.isRejected && "This task has been rejected and cannot be modified."}
                            </Typography>
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
                                        key={attachment.id}
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
                                                    {attachment.fileSize} KB • {FormatUtcTime.formatDateTime(attachment.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton size="small" onClick={() => handleDeleteAttachment(attachment.id)}>🗑️</IconButton>
                                            <IconButton size="small" onClick={() => handleDownloadAttachment(attachment)}>☁️</IconButton>
                                        </Box>
                                    </Box>
                                ))}

                                {/* Upload new attachments */}
                                <Box sx={{ mt: 2 }}>
                                    <input
                                        type="file"
                                        multiple
                                        style={{ display: "none" }}
                                        id="task-attachment-upload"
                                        onChange={handleFileSelect}
                                    />
                                    <label htmlFor="task-attachment-upload">
                                        <Box
                                            sx={{
                                                border: "2px dashed",
                                                borderColor: "primary.main",
                                                borderRadius: 2,
                                                p: 3,
                                                textAlign: "center",
                                                cursor: "pointer",
                                                "&:hover": { bgcolor: "action.hover" },
                                            }}
                                        >
                                            {/* <AttachFileIcon color="primary" /> */}
                                            <Typography variant="body2" color="primary">
                                                📎 Choose files (multiple files supported)
                                            </Typography>
                                        </Box>
                                    </label>
                                    {selectedFiles.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" fontWeight={600} gutterBottom>
                                                Selected files: {selectedFiles.length}
                                            </Typography>
                                            {selectedFiles.map((file, index) => (
                                                <Chip
                                                    key={index}
                                                    label={file.name}
                                                    size="small"
                                                    sx={{ mr: 1, mb: 1 }}
                                                    onDelete={() => {
                                                        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                                                    }}
                                                />
                                            ))}
                                            <Box sx={{ mt: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={handleUploadAttachments}
                                                >
                                                    Upload Files
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
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
                                    disabled={task?.isRejected}
                                >
                                    Add Sub-Task
                                </Button>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {task?.subTasks && task.subTasks.length > 0 ? (
                                    task?.subTasks.map((subTask) => (
                                        <Box
                                            key={subTask.subTaskId}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                p: 1,
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                "&:hover": { bgcolor: "action.hover" },
                                            }}
                                            onClick={() => handleSubTaskClick(subTask.subTaskId)}
                                        >
                                            <FormControlLabel
                                                control={<Checkbox defaultChecked />}
                                                label={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {subTask.taskCode}: {subTask.taskTitle}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Created by {subTask.createdBy} • At: {FormatUtcTime.formatDateTime(subTask.createdAt)} • Assignee: {subTask.createdBy}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                        No sub tasks yet
                                    </Typography>
                                )}
                            </Box>
                        </Card>

                        {/* Bugs-Tasks */}
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    Bug Tasks
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenBugTaskDialog}
                                    disabled={task?.isRejected}
                                >
                                    Add Bug Task
                                </Button>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {task?.bugTasks && task.bugTasks.length > 0 ? (
                                    task.bugTasks.map((bugTask) => (
                                        <Box
                                            key={bugTask.subTaskId}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                p: 1,
                                                borderRadius: 1,
                                                cursor: "pointer",
                                                "&:hover": { bgcolor: "action.hover" },
                                            }}
                                            onClick={() => handleSubTaskClick(bugTask.subTaskId)}
                                        >
                                            <FormControlLabel
                                                control={<Checkbox defaultChecked />}
                                                label={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <BugIcon sx={{ color: "error.main", fontSize: 20 }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {bugTask.taskCode}: {bugTask.taskTitle}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Created by {bugTask.createdBy} • At: {FormatUtcTime.formatDateTime(bugTask.createdAt)} • Assignee: {bugTask.createdBy}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                        No bug tasks yet
                                    </Typography>
                                )}
                            </Box>
                        </Card>

                        {/* Comments */}
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Comments
                            </Typography>
                            <CommentSection
                                comments={comments}
                                onAddComment={handleCommentSubmit}
                                onUpdateComment={handleUpdateComment}
                                onDeleteComment={handleDeleteComment}
                                onReactionToggle={handleReactionToggle}
                                currentUserId={1}
                            />
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
                                            label={task?.parentTaskId && task.parentTaskId > 0 ? "Sub-Task" : "Task"}
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
                                            disabled={task?.isRejected}
                                        >
                                            {statuses
                                                .filter(s => s.entityType === 'Task')
                                                .filter(s => {
                                                    // If approved, only show New, Publish, Cancel
                                                    if (task && task?.isApproved === true) {
                                                        return (s.name === 'In Progress' || s.name === 'Completed' || s.name === 'On Hold' || s.name === 'Cancelled');
                                                    }
                                                    if (task && task?.isApproved === null) {
                                                        return (s.name === 'New' || s.name === 'Published' || s.name === 'On Hold');
                                                    }
                                                    // If rejected, show all but disable selection
                                                    return true;
                                                })
                                                .map((status) => (
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
                                            disabled={task?.isRejected}
                                        >
                                            {priorities.filter((priority) => priority.entityType === 'Task').map((priority) => (
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
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Due Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                        <CalendarIcon fontSize="small" color="action" />
                                        <Typography variant="body2">{formatDate(task?.dueDate || new Date())}</Typography>
                                    </Box>
                                </Box>

                                {/* Members */}
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Members ({task?.assignees?.length || 0})
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <AvatarGroup max={10}>
                                            {task?.assignees?.map((assignee, index) => (
                                                <Tooltip key={index} title={assignee.memberName}>
                                                    <Avatar
                                                        src={assignee.memberImage}
                                                        alt={assignee.memberName}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {assignee.memberName.charAt(0)}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
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
                                {priorities.filter((priority) => priority.entityType === 'Task').map((priority) => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {/* <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={subTaskForm.startDate}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, startDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        /> */}
                        <TextField
                            fullWidth
                            type="date"
                            label="Due Date"
                            value={subTaskForm.dueDate}
                            onChange={(e) => setSubTaskForm({ ...subTaskForm, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            onFocus={(e) => {
                                const input = e.target as HTMLInputElement;
                                if (input.showPicker) {
                                    input.showPicker();
                                }
                            }}
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

            {/* Add Bug Task Dialog */}
            <Dialog open={openBugTaskDialog} onClose={() => setOpenBugTaskDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add Bug Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Task Title"
                            value={bugTaskForm.taskTitle}
                            onChange={(e) => setBugTaskForm({ ...bugTaskForm, taskTitle: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={bugTaskForm.description}
                            onChange={(e) => setBugTaskForm({ ...bugTaskForm, description: e.target.value })}
                        />
                        <Autocomplete
                            multiple
                            options={members}
                            getOptionLabel={(option) => option.employeeName}
                            value={members.filter((emp) => bugTaskForm.assignees.includes(emp.id))}
                            onChange={(_, value) =>
                                setBugTaskForm({ ...bugTaskForm, assignees: value.map((v) => v.id) })
                            }
                            renderInput={(params) => <TextField {...params} label="Assignees" />}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={bugTaskForm.priority}
                                label="Priority"
                                onChange={(e) =>
                                    setBugTaskForm({ ...bugTaskForm, priority: e.target.value as number })
                                }
                            >
                                {priorities.filter((priority) => priority.entityType === 'Task').map((priority) => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            type="date"
                            label="Due Date"
                            value={bugTaskForm.dueDate}
                            onChange={(e) => setBugTaskForm({ ...bugTaskForm, dueDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            onFocus={(e) => {
                                const input = e.target as HTMLInputElement;
                                if (input.showPicker) {
                                    input.showPicker();
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBugTaskDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBugTask}>
                        Create Bug Task
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
                                {priorities.filter((priority) => priority.entityType === 'Task').map((priority) => (
                                    <MenuItem key={priority.id} value={priority.level}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>


                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editTaskForm.description}
                            onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
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
