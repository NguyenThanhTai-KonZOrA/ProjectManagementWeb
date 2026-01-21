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
} from "@mui/material";
import {
    Edit as EditIcon,
    CalendarToday as CalendarIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import {
    projectManagementService,
    commentService,
    projectActivityLogService,
} from "../services/projectManagementService";
import type { ProjectResponse } from "../projectManagementTypes/projectType";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";

export default function AdminProjectDetailsPage() {
    useSetPageTitle("View Details");
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [project, setProject] = useState<ProjectResponse | null>(null);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [activityLogs, setActivityLogs] = useState<ProjectActivityLog[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

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

    useEffect(() => {
        loadProjectDetails();
        loadComments();
        loadActivityLogs();
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
                                        <Typography variant="body2" color="primary">
                                            📎 Choose files
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Comment Section */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Comment
                                </Typography>

                                {/* Add Comment */}
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

                                {/* Comments List */}
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

                                {/* Project Type */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Project Type
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={project?.projectType}
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
                                        {project?.projectCategory}
                                    </Typography>
                                </Box>

                                {/* Status */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip label={getStatusLabel()} size="small" color={getStatusColor()} />
                                    </Box>
                                </Box>

                                {/* Priority */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Priority
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={getPriorityLabel(project?.priority || 0)}
                                            size="small"
                                            color={getPriorityColor(project?.priority || 0)}
                                        />
                                    </Box>
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
                                    <Typography variant="caption" color="text.secondary">
                                        Members
                                    </Typography>
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
                                            <Tooltip title="Add member">
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "action.hover", cursor: "pointer" }}>
                                                    +
                                                </Avatar>
                                            </Tooltip>
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
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </AdminLayout>
    );
}
