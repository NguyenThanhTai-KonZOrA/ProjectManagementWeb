import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    AvatarGroup,
    TextField,
    LinearProgress,
    Alert,
    Snackbar,
    Divider,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import {
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
    ArrowBack as ArrowBackIcon,
    ContentCopy as ContentCopyIcon,
    Add as AddIcon,
    AttachFile as AttachFileIcon,
    MoreVert as MoreVertIcon,
    Share as ShareIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
    projectManagementService,
    commentService,
    projectActivityLogService,
    projectCategoryService,
    taskManagementService,
} from "../services/projectManagementService";
import type { ProjectResponse, CreateProjectRequest, ProjectDetailsResponse } from "../projectManagementTypes/projectType";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";
import { FormatUtcTime } from "../utils/formatUtcTime";
import CommentSection from "../components/CommentSection";
import { PAGE_TITLES } from "../constants/pageTitles";
import { TaskType, type CreateTaskRequest } from "../projectManagementTypes/taskType";

export default function AdminProjectDetailsPage() {
    useSetPageTitle(PAGE_TITLES.PROJECTDETAIL);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { priorities, members, statuses } = useAppData();
    const [loading, setLoading] = useState<boolean>(false);
    const [project, setProject] = useState<ProjectDetailsResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [categories, setCategories] = useState<ProjectCategoryResponse[]>([]);
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
    const [openAddMemberDialog, setOpenAddMemberDialog] = useState<boolean>(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useState<HTMLInputElement | null>(null)[0];
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    const [openTaskDialog, setOpenTaskDialog] = useState<boolean>(false);
    const [formTaskData, setFormTaskData] = useState<CreateTaskRequest>({
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

    const [formData, setFormData] = useState<CreateProjectRequest>({
        projectName: "",
        projectType: 1,
        startDate: "",
        endDate: "",
        projectMembers: [],
        priority: 1,
        projectCategory: "",
        description: "",
    });

    const loadProjectDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const projectData = await projectManagementService.getProjectById(parseInt(id));
            setProject(projectData);
        } catch (error: any) {
            console.error("Error loading project:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to load project",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        if (!id) return;
        try {
            const commentsData = await commentService.getAllCommentsOfProject(parseInt(id));
            setComments(commentsData);
        } catch (error: any) {
            console.error("Error loading comments:", error);
        }
    };

    const loadActivityLogs = async () => {
        if (!id) return;
        try {
            const logsData = await projectActivityLogService.getAllLogsOfProject(parseInt(id));
            setActivityLogs(logsData);
        } catch (error: any) {
            console.error("Error loading activity logs:", error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await projectCategoryService.getAllCategories();
            setCategories(data);
        } catch (error: any) {
            console.error("Error loading categories:", error);
        }
    };

    useEffect(() => {
        loadProjectDetails();
        loadComments();
        loadActivityLogs();
        loadCategories();
    }, [id]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !id) return;

        try {
            await commentService.createComment({
                projectId: parseInt(id),
                description: newComment,
            });
            setNewComment("");
            setSnackbar({
                open: true,
                message: "Comment added successfully",
                severity: "success",
            });
            loadComments();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error adding comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to add comment",
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

    const handleOpenEditDialog = () => {
        if (!project) return;
        setFormData({
            projectName: project.projectName,
            projectType: project.projectType,
            startDate: project.startDate.split("T")[0],
            endDate: project.endDate.split("T")[0],
            projectMembers: project.projectMembers.map((m) => m.memberId),
            priority: project.priorityId,
            projectCategory: project.projectCategoryId.toString(),
            description: project.description,
        });
        setOpenEditDialog(true);
    };

    const handleUpdateProject = async () => {
        if (!id) return;
        try {
            setLoading(true);
            await projectManagementService.updateProject(parseInt(id), formData);
            setSnackbar({
                open: true,
                message: "Project updated successfully",
                severity: "success",
            });
            setOpenEditDialog(false);
            loadProjectDetails();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error updating project:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to update project",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = () => {
        if (!project) return "Pending";
        const completionPercentage = (project.totalTaskCompleted / project.totalTasks) * 100;
        if (completionPercentage === 100) return "Completed";
        if (completionPercentage > 0) return "In Progress";
        return "Pending";
    };

    const getStatusColor = (): "success" | "info" | "default" => {
        if (!project) return "default";
        const completionPercentage = (project.totalTaskCompleted / project.totalTasks) * 100;
        if (completionPercentage === 100) return "success";
        if (completionPercentage > 0) return "info";
        return "default";
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setSnackbar({
            open: true,
            message: `${label} copied to clipboard`,
            severity: "success",
        });
    };

    const handleAddMember = async () => {
        if (!selectedMemberIds.length || !id) return;
        try {
            await projectManagementService.addProjectMembers({
                projectId: parseInt(id),
                memberIds: selectedMemberIds,
            });
            setSnackbar({
                open: true,
                message: "Member(s) added successfully",
                severity: "success",
            });
            setOpenAddMemberDialog(false);
            setSelectedMemberIds([]);
            loadProjectDetails();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error adding member:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to add member",
                severity: "error",
            });
        }
    };

    const handleStatusChange = async (newStatusId: number) => {
        if (!id) return;
        try {
            await projectManagementService.changeProjectStatus({
                projectId: parseInt(id),
                newStatusId,
            });
            setSnackbar({
                open: true,
                message: "Status updated successfully",
                severity: "success",
            });
            loadProjectDetails();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error changing status:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to change status",
                severity: "error",
            });
        }
    };

    const handlePriorityChange = async (newPriorityId: number) => {
        if (!id) return;
        try {
            await projectManagementService.changeProjectPriority({
                projectId: parseInt(id),
                newPriorityId,
            });
            setSnackbar({
                open: true,
                message: "Priority updated successfully",
                severity: "success",
            });
            loadProjectDetails();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error changing priority:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to change priority",
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
            formData.append("projectId", id);
            selectedFiles.forEach((file) => {
                formData.append("attachments", file);
            });

            await projectManagementService.uploadAttachmentsProject(parseInt(id), formData);
            setSnackbar({
                open: true,
                message: "Files uploaded successfully",
                severity: "success",
            });
            setSelectedFiles([]);
            loadProjectDetails();
            loadActivityLogs();
        } catch (error: any) {
            console.error("Error uploading files:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to upload files",
                severity: "error",
            });
        }
    };

    const handleCommentSubmit = async (description: string, parentCommentId?: number) => {
        if (!id) return;
        try {
            await commentService.createComment({
                projectId: parseInt(id),
                description,
                parentCommentId,
            });
            loadComments();
            loadActivityLogs();
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
                projectId: parseInt(id),
                description,
                commentId: commentId
            });
            loadComments();
            loadActivityLogs();
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
            loadComments();
            loadActivityLogs();
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
            if (!comment) {
                console.log('Comment not found:', commentId);
                return;
            }

            console.log('Before reaction - Comment:', comment.id, 'Current reaction:', comment.currentUserReaction, 'New reaction:', reactionType);

            // If user already has this reaction, delete it, otherwise create it
            if (comment.currentUserReaction === reactionType) {
                await commentService.deleteReaction(commentId);
                console.log('Deleted reaction');
            } else {
                await commentService.createReaction({
                    commentId,
                    reactionType,
                });
                console.log('Created reaction');
            }

            // Reload comments to get updated data
            await loadComments();
            console.log('Comments reloaded');
        } catch (error: any) {
            console.error("Error toggling reaction:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to toggle reaction",
                severity: "error",
            });
        }
    };

    if (!project && !loading) {
        return (
            <AdminLayout>
                <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="h6" color="text.secondary">
                        Project not found
                    </Typography>
                    <Button onClick={() => navigate("/admin-projects")} sx={{ mt: 2 }}>
                        Go back to projects
                    </Button>
                </Box>
            </AdminLayout>
        );
    }

    const getChipColorByActionName = (actionName: string) => {
        const status = statuses.find((s) => s.name.toLowerCase() === actionName.toLowerCase());
        return status ? status.color : "action.main";
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
            const error = validateField(field, formTaskData[field]);
            if (error) {
                errors[field] = error;
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    const handleFieldBlur = (fieldName: keyof CreateTaskRequest) => {
        const error = validateField(fieldName, formTaskData[fieldName]);
        setValidationErrors(prev => ({
            ...prev,
            [fieldName]: error
        }));
    };

    const isFormValid = (): boolean => {
        return formTaskData.projectId !== 0 &&
            formTaskData.taskTitle.trim() !== '' &&
            formTaskData.taskType !== '' &&
            formTaskData.description.trim() !== '' &&
            formTaskData.assignees.length > 0 &&
            formTaskData.startDate !== '' &&
            formTaskData.dueDate !== '' &&
            !validationErrors.dueDate;
    };

    const handleOpenTaskDialog = () => {
        setFormTaskData({
            projectId: project ? parseInt(project.id) : 0,
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
        setOpenTaskDialog(true);
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
            formDataToSend.append("ProjectId", formTaskData.projectId.toString());
            formDataToSend.append("TaskType", formTaskData.taskType);
            formDataToSend.append("TaskTitle", formTaskData.taskTitle);
            formDataToSend.append("Description", formTaskData.description);
            formDataToSend.append("DueDate", formTaskData.dueDate);
            formDataToSend.append("StartDate", formTaskData.startDate);
            formDataToSend.append("Priority", formTaskData.priority.toString());

            formTaskData.assignees.forEach((assignee) => {
                formDataToSend.append("Assignees", assignee.toString());
            });

            formTaskData.attachments.forEach((file) => {
                formDataToSend.append("Attachments", file);
            });

            await taskManagementService.createTask(formDataToSend);
            setSnackbar({
                open: true,
                message: "Task created successfully",
                severity: "success",
            });
            setOpenTaskDialog(false);

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

            {loading && <LinearProgress sx={{ position: "fixed", top: 64, left: 0, right: 30, zIndex: 20 }} />}

            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <IconButton onClick={() => navigate("/admin/project-management/projects")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={700}>
                            {project?.projectCode}: {project?.projectName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Created by {project?.createdBy} • {FormatUtcTime.formatDateTime(project?.createdAt)}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
                    {/* Left Column - Project Details */}
                    <Box>
                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<EditIcon />}
                                    onClick={handleOpenEditDialog}
                                    sx={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    }}
                                >
                                    Edit Project
                                </Button>

                                <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenTaskDialog}
                                    sx={{
                                        background: "linear-gradient(135deg, #b86f9aff 0%, #780fe0ff 100%)",
                                    }}
                                >
                                    Create Task
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

                            <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                                <Button variant="contained" size="small"
                                    sx={{
                                        background: "linear-gradient(to left top, #71a2ecff, #004d7a, #008793, #00bf72, #a8eb12)",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin-tasks?projectId=${project?.id}`);
                                    }}
                                >
                                    View Tasks List
                                </Button>
                            </Box>
                        </Box>

                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                {/* Project Title & Edit Button */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                    {/* <Box>
                                        <Typography variant="h5" fontWeight={700} gutterBottom>
                                            {project?.projectName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Created by {project?.projectMembers[0]?.memberName || "Unknown"} •{" "}
                                            {formatDate(new Date())}
                                        </Typography>
                                    </Box> */}
                                    {/* <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={handleOpenEditDialog}
                                        sx={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        }}
                                    >
                                        Edit Project
                                    </Button> */}
                                </Box>

                                {/* Description Section */}
                                <Box sx={{ my: 3 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        📄 Description
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
                                        {project?.description || "No description provided."}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Attachments Section */}
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Attachments
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {project?.attachments.map((attachment) => (
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
                                            <IconButton size="small">🗑️</IconButton>
                                            <IconButton size="small">☁️</IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                            <input
                                type="file"
                                multiple
                                style={{ display: "none" }}
                                id="attachment-upload"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="attachment-upload">
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
                        </Card>

                        {/* Comment Section */}
                        <Card>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Right Column - Details & Activity Log */}
                    <Box>
                        {/* Details Card */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Detail
                                </Typography>

                                {/* GitHub Repository Name */}
                                {project?.gitHubRepositoryName && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            GitHub Repository
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {project.gitHubRepositoryName}
                                            </Typography>
                                            <Tooltip title="Copy repository name">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopyToClipboard(project.gitHubRepositoryName, "Repository name")}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                )}

                                {/* GitHub URL */}
                                {project?.gitHubUrl && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            GitHub URL
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                sx={{
                                                    color: "primary.main",
                                                    cursor: "pointer",
                                                    textDecoration: "underline",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                    maxWidth: "200px",
                                                }}
                                                onClick={() => window.open(project.gitHubUrl, "_blank")}
                                            >
                                                {project.gitHubUrl}
                                            </Typography>
                                            <Tooltip title="Copy GitHub URL">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopyToClipboard(project.gitHubUrl, "GitHub URL")}
                                                >
                                                    <ContentCopyIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                )}

                                {/* Project Type */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Project Type
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={project?.projectTypeName}
                                            size="small"
                                            sx={{
                                                bgcolor: project?.projectType === 1 ? "#C19A6B" : "#8B7FDE",
                                                color: "white",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                </Box>

                                {/* Project Category */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Project Category
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {project?.projectCategoryName}
                                    </Typography>
                                </Box>

                                {/* Status */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Status
                                    </Typography>
                                    <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                                        <Select
                                            value={project?.statusId || 1}
                                            onChange={(e) => handleStatusChange(Number(e.target.value))}
                                        >
                                            {statuses.filter(s => s.entityType === 'Project').map((status) => (
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

                                {/* Priority */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Priority
                                    </Typography>
                                    <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                                        <Select
                                            value={project?.priorityId || 1}
                                            onChange={(e) => handlePriorityChange(Number(e.target.value))}
                                        >
                                            {priorities.filter(p => p.entityType === 'Project').map((priority) => (
                                                <MenuItem key={priority.id} value={priority.id}>
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

                                {/* Start Date */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Start Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                        <CalendarIcon fontSize="small" color="action" />
                                        <Typography variant="body2">{formatDate(new Date())}</Typography>
                                    </Box>
                                </Box>

                                {/* End Date */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        End Date
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                        <CalendarIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Members */}
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Members
                                        </Typography>
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => setOpenAddMemberDialog(true)}
                                        >
                                            Add
                                        </Button>
                                    </Box>
                                    <Box sx={{ mt: 1 }}>
                                        <AvatarGroup max={10}>
                                            {project?.projectMembers.map((member, index) => (
                                                <Tooltip key={index} title={member.memberName}>
                                                    <Avatar
                                                        src={member.memberImage}
                                                        alt={member.memberName}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {member.memberName.charAt(0)}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Activity Log Card */}
                        <Card>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            {/* Edit Project Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <TextField
                            label="Project Name"
                            fullWidth
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Project Type</InputLabel>
                            <Select
                                value={formData.projectType}
                                label="Project Type"
                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as number })}
                            >
                                <MenuItem value={2}>Gaming</MenuItem>
                                <MenuItem value={1}>Non-gaming</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    onFocus={(e) => {
                                        const input = e.target as HTMLInputElement;
                                        if (input.showPicker) {
                                            input.showPicker();
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    onFocus={(e) => {
                                        const input = e.target as HTMLInputElement;
                                        if (input.showPicker) {
                                            input.showPicker();
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Autocomplete
                            multiple
                            options={members}
                            getOptionLabel={(option) => option.employeeName}
                            value={members.filter((emp) => formData.projectMembers.includes(emp.id))}
                            onChange={(_, value) =>
                                setFormData({ ...formData, projectMembers: value.map((v) => v.id) })
                            }
                            renderInput={(params) => <TextField {...params} label="Project Members" />}
                        />

                        {/* Project Category and Priority */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Project Category</InputLabel>
                                    <Select
                                        value={formData.projectCategory}
                                        label="Project Category"
                                        onChange={(e) => setFormData({ ...formData, projectCategory: e.target.value })}
                                    >
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
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
                                        {priorities.filter((priority) => priority.entityType === 'Project').map((priority) => (
                                            <MenuItem key={priority.id} value={priority.id}>
                                                {priority.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpdateProject}
                        variant="contained"
                        disabled={!formData.projectName || !formData.projectCategory}
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={openAddMemberDialog} onClose={() => setOpenAddMemberDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Members to Project</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        multiple
                        options={members.filter(
                            (member) =>
                                !project?.projectMembers.some((pm) => pm.memberId === member.id)
                        )}
                        getOptionLabel={(option) => option.employeeName}
                        value={members.filter((m) => selectedMemberIds.includes(m.id))}
                        onChange={(_, value) => setSelectedMemberIds(value.map((v) => v.id))}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Members"
                                placeholder="Choose members to add"
                                sx={{ mt: 2 }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Avatar sx={{ width: 24, height: 24 }}>
                                        {option.employeeName.charAt(0)}
                                    </Avatar>
                                    {option.employeeName}
                                </Box>
                            </li>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenAddMemberDialog(false);
                        setSelectedMemberIds([]);
                    }}>Cancel</Button>
                    <Button onClick={handleAddMember} variant="contained" disabled={selectedMemberIds.length === 0}>
                        Add Member{selectedMemberIds.length > 1 ? 's' : ''}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit Task Dialog */}
            <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        <FormControl fullWidth required error={!!validationErrors.projectId}>
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={formTaskData.projectId || ""}
                                label="Project"
                                onChange={(e) => {
                                    setFormTaskData({ ...formTaskData, projectId: e.target.value as number });
                                    if (validationErrors.projectId) {
                                        setValidationErrors({ ...validationErrors, projectId: undefined });
                                    }
                                }}
                                onBlur={() => handleFieldBlur('projectId')}
                            >
                                <MenuItem value={project?.id ? Number(project.id) : ""}>
                                    <em>{project?.projectName || "None"}</em>
                                </MenuItem>
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
                            value={formTaskData.taskTitle}
                            onChange={(e) => {
                                setFormTaskData({ ...formTaskData, taskTitle: e.target.value });
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
                                        value={formTaskData.taskType}
                                        label="Task Type"
                                        onChange={(e) => {
                                            setFormTaskData({ ...formTaskData, taskType: e.target.value });
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
                                value={formTaskData.startDate}
                                onChange={(e) => {
                                    setFormTaskData({ ...formTaskData, startDate: e.target.value });
                                    if (validationErrors.startDate) {
                                        setValidationErrors({ ...validationErrors, startDate: undefined });
                                    }
                                    // Re-validate due date when start date changes
                                    if (formTaskData.dueDate) {
                                        const dueDateError = validateField('dueDate', formTaskData.dueDate);
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
                                value={formTaskData.dueDate}
                                onChange={(e) => {
                                    setFormTaskData({ ...formTaskData, dueDate: e.target.value });
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
                            value={members.filter((emp) => formTaskData.assignees.includes(emp.id))}
                            onChange={(_, value) => {
                                setFormTaskData({ ...formTaskData, assignees: value.map((v) => v.id) });
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
                            value={formTaskData.description}
                            onChange={(e) => {
                                setFormTaskData({ ...formTaskData, description: e.target.value });
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
                                        setFormTaskData({
                                            ...formTaskData,
                                            attachments: Array.from(e.target.files)
                                        });
                                    }
                                }}
                            />
                        </Button>
                        {formTaskData.attachments.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {formTaskData.attachments.length} file(s) selected
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateOrUpdateTask}
                        variant="contained"
                        disabled={!isFormValid() || loading}
                    >
                        {"Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout >
    );
}
