import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    LinearProgress,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    Refresh as RefreshIcon,
    Folder as FolderIcon,
    CheckCircle as CheckCircleIcon,
    PendingActions as PendingActionsIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { projectDashboardService } from "../services/projectManagementService";
import type { ProjectOverviewDashboardResponse } from "../projectManagementTypes/projectDashboardType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import { FormatUtcTime } from "../utils/formatUtcTime";
import { useSetPageTitle } from "../hooks/useSetPageTitle";
import { PAGE_TITLES } from "../constants/pageTitles";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: string;
}

const StatCard = ({ title, value, icon, color, subtitle, trend }: StatCardProps) => (
    <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
        <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                    {trend && (
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <TrendingUpIcon fontSize="small" sx={{ color: "success.main", mr: 0.5 }} />
                            <Typography variant="caption" color="success.main" fontWeight={600}>
                                {trend}
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: color,
                        width: 56,
                        height: 56,
                        boxShadow: 2,
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
    </Card>
);

export default function AdminProjectDashboardPage() {
    useSetPageTitle(PAGE_TITLES.DASHBOARD);
    const [loading, setLoading] = useState<boolean>(false);
    const [dashboardData, setDashboardData] = useState<ProjectOverviewDashboardResponse | null>(null);
    const [recentActivities, setRecentActivities] = useState<ProjectActivityLog[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const data = await projectDashboardService.getProjectOverview();
            setDashboardData(data);
            setRecentActivities(data.recentActivities || []);
        } catch (error: any) {
            console.error("Error loading dashboard data:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to load dashboard data",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "created":
            case "create":
                return <FolderIcon fontSize="small" color="primary" />;
            case "updated":
            case "update":
                return <AssignmentIcon fontSize="small" color="info" />;
            case "completed":
            case "complete":
                return <CheckCircleIcon fontSize="small" color="success" />;
            case "failed":
            case "error":
                return <WarningIcon fontSize="small" color="error" />;
            default:
                return <AssignmentIcon fontSize="small" color="action" />;
        }
    };

    return (
        <AdminLayout>
            {loading && <LinearProgress sx={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 1300 }} />}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box>
                        {/* <Typography variant="h4" fontWeight={700} gutterBottom>
                            Project Management Dashboard
                        </Typography> */}
                        <Typography variant="body2" color="text.secondary">
                            Overview of all projects, tasks, and activities
                        </Typography>
                    </Box>
                    <Tooltip title="Refresh Dashboard">
                        <IconButton onClick={loadDashboardData} disabled={loading} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Statistics Cards */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 3, mb: 3 }}>
                    <StatCard
                        title="Total Projects"
                        value={dashboardData?.totalProjects || 0}
                        icon={<FolderIcon />}
                        color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        subtitle="Active projects"
                    />
                    <StatCard
                        title="Completed Tasks"
                        value={dashboardData?.totalCompletedTasks || 0}
                        icon={<CheckCircleIcon />}
                        color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                        subtitle="Successfully finished"
                    />
                    <StatCard
                        title="Pending Tasks"
                        value={dashboardData?.totalPendingTasks || 0}
                        icon={<PendingActionsIcon />}
                        color="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                        subtitle="In progress"
                    />
                    <StatCard
                        title="Issues"
                        value={dashboardData?.totalIssues || 0}
                        icon={<WarningIcon />}
                        color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                        subtitle="Requires attention"
                    />
                </Box>

                {/* Timeline Chart & Task Distribution */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3, mb: 3 }}>
                    {/* Timeline Data Table */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Timeline Overview
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                                {dashboardData?.projectOverTimeline && dashboardData.projectOverTimeline.length > 0 ? (
                                    <List>
                                        {dashboardData.projectOverTimeline.map((item, index) => (
                                            <Box key={index}>
                                                <ListItem sx={{ px: 0 }}>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {new Date(item.date).toLocaleDateString('vi-VN', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                                                <Chip
                                                                    label={`Completed: ${item.completedTasks}`}
                                                                    size="small"
                                                                    color="success"
                                                                    variant="outlined"
                                                                />
                                                                <Chip
                                                                    label={`Pending: ${item.pendingTasks}`}
                                                                    size="small"
                                                                    color="warning"
                                                                    variant="outlined"
                                                                />
                                                                <Chip
                                                                    label={`Issues: ${item.issues}`}
                                                                    size="small"
                                                                    color="error"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                {index < dashboardData.projectOverTimeline.length - 1 && <Divider />}
                                            </Box>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: "center", py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No timeline data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Task Distribution */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Task Distribution
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Completed
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {dashboardData?.totalCompletedTasks || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            ((dashboardData?.totalCompletedTasks || 0) /
                                                ((dashboardData?.totalCompletedTasks || 0) +
                                                    (dashboardData?.totalPendingTasks || 1))) *
                                            100
                                        }
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "success.lighter",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: "success.main",
                                            },
                                        }}
                                    />
                                </Box>
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Pending
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {dashboardData?.totalPendingTasks || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            ((dashboardData?.totalPendingTasks || 0) /
                                                ((dashboardData?.totalCompletedTasks || 0) +
                                                    (dashboardData?.totalPendingTasks || 1))) *
                                            100
                                        }
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "warning.lighter",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: "warning.main",
                                            },
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Issues
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {dashboardData?.totalIssues || 0}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            ((dashboardData?.totalIssues || 0) /
                                                ((dashboardData?.totalCompletedTasks || 0) +
                                                    (dashboardData?.totalPendingTasks || 1))) *
                                            100
                                        }
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: "error.lighter",
                                            "& .MuiLinearProgress-bar": {
                                                bgcolor: "error.main",
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Recent Activities */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Recent Activities
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {recentActivities.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No recent activities
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {recentActivities.slice(0, 10).map((activity, index) => (
                                    <Box key={activity.id}>
                                        <ListItem
                                            sx={{
                                                px: 0,
                                                "&:hover": {
                                                    bgcolor: "action.hover",
                                                    borderRadius: 1,
                                                },
                                            }}
                                        >
                                            <Box sx={{ mr: 2 }}>{getActivityIcon(activity.actionType)}</Box>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {activity.memberAction}
                                                        </Typography>
                                                        <Chip
                                                            label={activity.actionType}
                                                            size="small"
                                                            sx={{ height: 20, fontSize: "0.7rem" }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {activity.details}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.disabled">
                                                            {FormatUtcTime.formatDateTime(activity.timestamp.toString())}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < recentActivities.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </AdminLayout>
    );
}
