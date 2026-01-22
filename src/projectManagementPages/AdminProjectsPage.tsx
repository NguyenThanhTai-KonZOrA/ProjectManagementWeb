import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    LinearProgress,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    Chip,
    Avatar,
    AvatarGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Autocomplete,
    ToggleButtonGroup,
    ToggleButton,
    InputAdornment,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    Comment as CommentIcon,
    CalendarToday as CalendarIcon,
    Category as CategoryIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import { projectManagementService, projectCategoryService } from "../services/projectManagementService";
import type { CreateProjectRequest, ProjectResponse } from "../projectManagementTypes/projectType";
import type { ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";
import { useAppData } from "../contexts/AppDataContext";

export default function AdminProjectsPage() {
    useSetPageTitle(PAGE_TITLES.DEFAULT);
    const { priorities, statuses, members } = useAppData();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [categories, setCategories] = useState<ProjectCategoryResponse[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<ProjectResponse[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<ProjectResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
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

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await projectManagementService.getAllProjects();
            setProjects(data);
            setFilteredProjects(data);
        } catch (error: any) {
            console.error("Error loading projects:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to load projects",
                severity: "error",
            });
        } finally {
            setLoading(false);
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
        loadProjects();
        loadCategories();
    }, []);

    // Filter projects based on status and category
    useEffect(() => {
        let filtered = projects;

        // Search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (project) =>
                    project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    project.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== "All") {
            filtered = filtered.filter((p) => getProjectStatus(p) === statusFilter);
        }

        if (categoryFilter !== "All") {
            filtered = filtered.filter((p) => p.projectType === parseInt(categoryFilter));
        }

        setFilteredProjects(filtered);
    }, [searchQuery, statusFilter, categoryFilter, projects]);

    const getProjectStatus = (project: ProjectResponse): string => {
        const completionPercentage = (project.totalTaskCompleted / project.totalTasks) * 100;
        if (completionPercentage === 100) return "Completed";
        if (completionPercentage > 0) return "In Progress";
        return "Pending";
    };

    const getDaysLeft = (timeline: string): number => {
        debugger
        if (!timeline) return 0;
        const match = timeline.match(/(\d+)\s*Month/i);
        if (match) {
            return parseInt(match[1]) * 30;
        }
        return 0;
    };

    const getPriorityLabel = (priority: number): string => {
        switch (priority) {
            case 4:
                return "Critical";
            case 3:
                return "High";
            case 2:
                return "Medium";
            default:
                return "Low";
        }
    };

    const getPriorityColor = (priority: number): "error" | "warning" | "info" | "default" => {
        switch (priority) {
            case 4:
                return "error";
            case 3:
                return "warning";
            case 2:
                return "info";
            default:
                return "default";
        }
    };

    const handleCreateOrUpdate = async () => {
        try {
            setLoading(true);
            if (editingProject) {
                await projectManagementService.updateProject(parseInt(editingProject.id), formData);
                setSnackbar({
                    open: true,
                    message: "Project updated successfully",
                    severity: "success",
                });
            } else {
                await projectManagementService.createProject(formData);
                setSnackbar({
                    open: true,
                    message: "Project created successfully",
                    severity: "success",
                });
            }
            setOpenDialog(false);
            setEditingProject(null);
            resetForm();
            loadProjects();
        } catch (error: any) {
            console.error("Error saving project:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to save project",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            setLoading(true);
            await projectManagementService.deleteProject(parseInt(id));
            setSnackbar({
                open: true,
                message: "Project deleted successfully",
                severity: "success",
            });
            loadProjects();
        } catch (error: any) {
            console.error("Error deleting project:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to delete project",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project: ProjectResponse) => {
        setEditingProject(project);
        setFormData({
            projectName: project.projectName,
            projectType: project.projectType,
            startDate: new Date().toISOString().split("T")[0], // Adjust based on actual data
            endDate: new Date().toISOString().split("T")[0], // Adjust based on actual data
            projectMembers: project.projectMembers.map((m) => parseInt(m.memberId)),
            priority: project.priority,
            projectCategory: project.projectCategory,
            description: project.description,
        });
        setOpenDialog(true);
    };

    const resetForm = () => {
        setFormData({
            projectName: "",
            projectType: 1,
            startDate: "",
            endDate: "",
            projectMembers: [],
            priority: 1,
            projectCategory: "",
            description: "",
        });
    };

    const handleOpenDialog = () => {
        resetForm();
        setEditingProject(null);
        setOpenDialog(true);
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

            <Box sx={{ p: 3 }}>
                {/* Header */}
                {loading && <LinearProgress sx={{ position: "fixed", top: 64, left: 0, right: 30, zIndex: 20 }} />}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {/* Status Filter */}
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={(_, value) => value && setStatusFilter(value)}
                            size="small"
                        >
                            <ToggleButton value="All">All</ToggleButton>
                            <ToggleButton value="In Progress">In Progress</ToggleButton>
                            <ToggleButton value="Completed">Completed</ToggleButton>
                            <ToggleButton value="Pending">Pending</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {/* Project name search */}
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Search by project name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ width: 350 }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        {/* Category Filter */}
                        <ToggleButtonGroup
                            value={categoryFilter}
                            exclusive
                            onChange={(_, value) => value && setCategoryFilter(value)}
                            size="small"
                        >
                            <ToggleButton value="All">All</ToggleButton>
                            <ToggleButton value="Gaming">Gaming</ToggleButton>
                            <ToggleButton value="Non-gaming">Non-gaming</ToggleButton>
                        </ToggleButtonGroup>

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenDialog}
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            Create project
                        </Button>
                    </Box>
                </Box>

                {/* Projects Grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
                    {filteredProjects.map((project) => {
                        const status = getProjectStatus(project);
                        const daysLeft = parseInt(project.projectTimeLine);
                        const completionPercentage = Math.round((project.totalTaskCompleted / project.totalTasks) * 100) || 0;
                        const priorityLabel = getPriorityLabel(project.priority);
                        const priorityColor = getPriorityColor(project.priority);

                        return (
                            <Card
                                key={project.id}
                                sx={{
                                    position: "relative",
                                    borderRadius: 2,
                                    boxShadow: 3,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardContent>
                                    {/* Header Section */}
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: project.projectType === 1 ? "primary.main" : "warning.main",
                                            }}
                                        >
                                            <CategoryIcon />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                sx={{
                                                    mb: 0.5,
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        color: "primary.main",
                                                        textDecoration: "underline"
                                                    }
                                                }}
                                                onClick={() => navigate(`/admin/project-management/projects/${project.id}`)}
                                            >
                                                {project.projectName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {project.projectType === 1 ? "Web application" : "App mobile"}
                                            </Typography>
                                        </Box>

                                        {/* Action Buttons */}
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEdit(project)}
                                                sx={{
                                                    bgcolor: "primary.lighter",
                                                    "&:hover": { bgcolor: "primary.light" },
                                                }}
                                            >
                                                <EditIcon fontSize="small" color="primary" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDelete(project.id)}
                                                sx={{
                                                    bgcolor: "error.lighter",
                                                    "&:hover": { bgcolor: "error.light" },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" color="error" />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Priority & Category Tags */}
                                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                        <Chip
                                            label={project.projectTypeName}
                                            size="small"
                                            sx={{
                                                bgcolor: project.projectType === 1 ? "#8B7FDE" : "#C19A6B",
                                                color: "white",
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Chip label={priorityLabel} size="small" color={priorityColor} />
                                        <Chip
                                            label={project.statusName}
                                            size="small"
                                            sx={{
                                                bgcolor: project.statusId === 1 ? "#8B7FDE" : "#C19A6B",
                                                color: "white",
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>

                                    {/* Project Stats */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <PeopleIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {project.projectMembers.length} Member
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <AssignmentIcon fontSize="small" color="action" />
                                            <Typography
                                                variant="body2"
                                                color="primary"
                                                sx={{
                                                    cursor: "pointer",
                                                    textDecoration: "underline",
                                                    "&:hover": { color: "primary.dark" }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin-tasks?projectId=${project.id}`);
                                                }}
                                            >
                                                {project.totalTasks} Tasks
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <ScheduleIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {project.projectTimeLine}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <CommentIcon fontSize="small" color="action" />
                                            <Typography variant="body2" color="text.secondary">
                                                {project.comments.length}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Progress Bar */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                Progress
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {completionPercentage}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={completionPercentage}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: "grey.200",
                                                "& .MuiLinearProgress-bar": {
                                                    borderRadius: 4,
                                                    bgcolor: completionPercentage === 100 ? "success.main" : "primary.main",
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Team Members */}
                                    <Box sx={{ mb: 1 }}>
                                        <AvatarGroup max={10} sx={{ justifyContent: "flex-start" }}>
                                            {project.projectMembers.map((member, index) => (
                                                <Tooltip key={index} title={member.memberName}>
                                                    <Avatar
                                                        src={member.memberImage}
                                                        alt={member.memberName}
                                                        sx={{ width: 25, height: 25 }}
                                                    />
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Box>
                                    {/* Days Left Indicator */}
                                    {status !== "Completed" && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                mb: 2,
                                                p: 1,
                                                bgcolor: daysLeft <= 20 ? "error.lighter" : "info.lighter",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <CalendarIcon
                                                fontSize="small"
                                                sx={{ color: daysLeft <= 20 ? "error.main" : "info.main" }}
                                            />
                                            <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                sx={{ color: daysLeft <= 20 ? "error.main" : "info.main" }}
                                            >
                                                {daysLeft} Days Left
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Completed Indicator */}
                                    {status === "Completed" && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                mb: 2,
                                                p: 1,
                                                bgcolor: "grey.200",
                                                borderRadius: 1,
                                            }}
                                        >
                                            <CalendarIcon fontSize="small" sx={{ color: "grey.600" }} />
                                            <Typography variant="caption" fontWeight={600} sx={{ color: "grey.600" }}>
                                                0 Day Left
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Action Buttons */}
                                    {/* <Box sx={{ display: "flex", gap: 1 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(project)}
                                            sx={{
                                                bgcolor: "primary.lighter",
                                                "&:hover": { bgcolor: "primary.light" },
                                            }}
                                        >
                                            <EditIcon fontSize="small" color="primary" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(project.id)}
                                            sx={{
                                                bgcolor: "error.lighter",
                                                "&:hover": { bgcolor: "error.light" },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" color="error" />
                                        </IconButton>
                                    </Box> */}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>

                {/* No Projects Message */}
                {filteredProjects.length === 0 && !loading && (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No projects found
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
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
                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                            >
                                <MenuItem value={1}>Gaming</MenuItem>
                                <MenuItem value={2}>Non-gaming</MenuItem>
                            </Select>
                        </FormControl>

                        {/** Start and End Date Fields Two Cloumn **/}
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
                                {priorities.map((priority) => (
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
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleCreateOrUpdate}
                        variant="contained"
                        disabled={!formData.projectName || !formData.projectCategory}
                    >
                        {editingProject ? "Update" : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
}
