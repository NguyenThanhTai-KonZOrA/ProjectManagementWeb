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
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
    projectManagementService,
    commentService,
    projectActivityLogService,
    projectCategoryService,
} from "../services/projectManagementService";
import type { ProjectResponse, CreateProjectRequest, ProjectDetailsResponse } from "../projectManagementTypes/projectType";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { useAppData } from "../contexts/AppDataContext";
import { FormatUtcTime } from "../utils/formatUtcTime";
import CommentSection from "../components/CommentSection";

export default function AdminProjectDetailsPage() {
    useSetPageTitle("View Details");
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
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            projectMembers: project.projectMembers.map((m) => parseInt(m.memberId)),
            priority: project.priority,
            projectCategory: project.projectCategoryName,
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

    const handleStatusChange = async (newStatusId: string) => {
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
            loadComments();
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
                    <Typography variant="h6" fontWeight={700}>
                        Back
                    </Typography>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
                    {/* Left Column - Project Details */}
                    <Box>
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                {/* Project Title & Edit Button */}
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700} gutterBottom>
                                            {project?.projectName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Created by {project?.projectMembers[0]?.memberName || "Unknown"} •{" "}
                                            {formatDate(new Date())}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={handleOpenEditDialog}
                                        sx={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        }}
                                    >
                                        Edit Project
                                    </Button>
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

                                <Divider sx={{ my: 2 }} />

                                {/* Attachments Section */}
                                <Box>
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
                                </Box>
                            </CardContent>
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
                                            value={project?.statusId?.toString() || ""}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            displayEmpty
                                        >
                                            {statuses && statuses.filter((s: any) => s.entityType === 'Project').map((status: any) => (
                                                <MenuItem key={status.id} value={status.id.toString()}>
                                                    {status.name}
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
                                            value={project?.priority || 1}
                                            onChange={(e) => handlePriorityChange(Number(e.target.value))}
                                        >
                                            {priorities.filter(p => p.entityType === 'Project').map((priority) => (
                                                <MenuItem key={priority.id} value={priority.id}>
                                                    {priority.name}
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
                                                {log.actionType}
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
                                <MenuItem value={1}>Gaming</MenuItem>
                                <MenuItem value={2}>Non-gaming</MenuItem>
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
                                !project?.projectMembers.some((pm) => parseInt(pm.memberId) === member.id)
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
        </AdminLayout>
    );
}
