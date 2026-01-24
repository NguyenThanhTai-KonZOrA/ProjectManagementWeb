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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";
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
            {loading && <LinearProgress sx={{ position: "fixed", top: 64, left: 0, right: 40, zIndex: 20 }} />}

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
                        color="#6375db"
                        subtitle="Active projects"
                    />
                    <StatCard
                        title="Completed Tasks"
                        value={dashboardData?.totalCompletedTasks || 0}
                        icon={<CheckCircleIcon />}
                        color="success.main"
                        subtitle="Successfully finished"
                    />
                    <StatCard
                        title="Pending Tasks"
                        value={dashboardData?.totalPendingTasks || 0}
                        icon={<PendingActionsIcon />}
                        color="warning.main"
                        subtitle="In progress"
                    />
                    <StatCard
                        title="Issues"
                        value={dashboardData?.totalIssues || 0}
                        icon={<WarningIcon />}
                        color="error.main"
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
                                                                Due date: {FormatUtcTime.formatDateWithoutTime(item.dueDate)}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                                                                <Typography variant="body2">
                                                                    <strong>Project Name:</strong> {item.projectName}
                                                                </Typography>
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
                                Task Status Overview
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ height: 350, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#4caf50" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#2e7d32" stopOpacity={1} />
                                            </linearGradient>
                                            <linearGradient id="gradientPending" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#ff9800" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#e65100" stopOpacity={1} />
                                            </linearGradient>
                                            <linearGradient id="gradientIssues" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f44336" stopOpacity={0.8} />
                                                <stop offset="100%" stopColor="#c62828" stopOpacity={1} />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={[
                                                { name: "Completed", value: dashboardData?.totalCompletedTasks || 0, color: "url(#gradientCompleted)" },
                                                { name: "Pending", value: dashboardData?.totalPendingTasks || 0, color: "url(#gradientPending)" },
                                                { name: "Issues", value: dashboardData?.totalIssues || 0, color: "url(#gradientIssues)" },
                                            ]}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            innerRadius={60}
                                            fill="#8884d8"
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1000}
                                            animationEasing="ease-out"
                                        >
                                            {[
                                                { name: "Completed", value: dashboardData?.totalCompletedTasks || 0, color: "url(#gradientCompleted)" },
                                                { name: "Pending", value: dashboardData?.totalPendingTasks || 0, color: "url(#gradientPending)" },
                                                { name: "Issues", value: dashboardData?.totalIssues || 0, color: "url(#gradientIssues)" },
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                border: "1px solid #ccc",
                                                borderRadius: "8px",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value, entry: any) => (
                                                <span style={{ color: "#666", fontSize: "14px" }}>
                                                    {value}: {entry.payload.value}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
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
                                                            {FormatUtcTime.formatDateTime(activity.timeStamp)}
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
