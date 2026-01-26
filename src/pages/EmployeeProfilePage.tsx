import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    LinearProgress,
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Person as PersonIcon,
    Work as WorkIcon,
    Assignment as AssignmentIcon,
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    CalendarToday as CalendarIcon,
    FolderOpen as FolderIcon,
} from '@mui/icons-material';
import { employeeRoleService } from '../services/rolePermissionService';
import type { SummaryProfileEmployeeResponse } from '../projectManagementTypes/projectMember';
import { useSetPageTitle } from '../hooks/useSetPageTitle';
import AdminLayout from '../components/layout/AdminLayout';
import { useNavigate } from "react-router-dom";
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

export default function EmployeeProfilePage() {
    useSetPageTitle('Employee Profile');
    const [profile, setProfile] = useState<SummaryProfileEmployeeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeRoleService.getEmployeeProfile();
            setProfile(data);
        } catch (err) {
            setError('Failed to load profile information');
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !profile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error">{error || 'No profile data available'}</Alert>
            </Container>
        );
    }

    const completedTasks = profile.tasks.filter(t => t.statusName.toLowerCase() === 'completed').length;
    const overdueTasks = profile.tasks.filter(t => t.isOverDue).length;

    return (
        <AdminLayout>


            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Section */}
                <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            p: 4,
                        }}
                    >
                        <Stack direction="row" spacing={3} alignItems="center">
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: 'white',
                                    color: '#667eea',
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    border: '4px solid rgba(255, 255, 255, 0.3)',
                                }}
                            >
                                {profile.employeeName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box flex={1}>
                                <Typography variant="h3" fontWeight="bold" gutterBottom>
                                    {profile.employeeName}
                                </Typography>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Chip
                                        icon={<WorkIcon />}
                                        label={`Employee Code: ${profile.employeeCode}`}
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    <Chip
                                        icon={<PersonIcon />}
                                        label={`ID: ${profile.employeeId}`}
                                        sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Statistics Cards */}
                    <Box sx={{ p: 3, bgcolor: 'background.default' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <Card sx={{ bgcolor: '#667eea', color: 'white', flex: 1 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">
                                                {profile.projects.length}
                                            </Typography>
                                            <Typography variant="body2">Total Projects</Typography>
                                        </Box>
                                        <FolderIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                            <Card sx={{ bgcolor: '#f093fb', color: 'white', flex: 1 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">
                                                {profile.tasks.length}
                                            </Typography>
                                            <Typography variant="body2">Total Tasks</Typography>
                                        </Box>
                                        <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                            <Card sx={{ bgcolor: '#4facfe', color: 'white', flex: 1 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">
                                                {completedTasks}
                                            </Typography>
                                            <Typography variant="body2">Completed Tasks</Typography>
                                        </Box>
                                        <CheckCircleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                            <Card sx={{ bgcolor: overdueTasks > 0 ? '#ff6b6b' : '#51cf66', color: 'white', flex: 1 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h4" fontWeight="bold">
                                                {overdueTasks}
                                            </Typography>
                                            <Typography variant="body2">Overdue Tasks</Typography>
                                        </Box>
                                        <ScheduleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Box>
                </Paper>

                {/* Tabs Section */}
                <Paper elevation={3}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            },
                        }}
                    >
                        <Tab icon={<FolderIcon />} label="Projects" iconPosition="start" />
                        <Tab icon={<AssignmentIcon />} label="Tasks" iconPosition="start" />
                        <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
                    </Tabs>

                    {/* Projects Tab */}
                    <TabPanel value={activeTab} index={0}>
                        {profile.projects.length === 0 ? (
                            <Alert severity="info">No projects found</Alert>
                        ) : (
                            <Stack spacing={3}>
                                {profile.projects.map((project) => {
                                    const progress = project.totalTasks > 0
                                        ? (project.completedTasks / project.totalTasks) * 100
                                        : 0;

                                    return (
                                        <Card key={project.projectId} elevation={2}>
                                            <CardContent>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/admin/project-management/projects/${project?.projectId}`);
                                                            }}
                                                            sx={{
                                                                textUnderlineOffset: '2px',
                                                                cursor: "pointer",
                                                            }}>
                                                            {project.projectName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" paragraph>
                                                            {project.projectDescription}
                                                        </Typography>
                                                    </Box>

                                                    <Stack direction="row" spacing={1}>
                                                        <Chip
                                                            label={project.statusName}
                                                            color={
                                                                project.statusName.toLowerCase() === 'completed'
                                                                    ? 'success'
                                                                    : project.statusName.toLowerCase() === 'in progress'
                                                                        ? 'primary'
                                                                        : 'default'
                                                            }
                                                            size="small"
                                                        />
                                                        <Chip
                                                            label={project.priorityName}
                                                            color={
                                                                project.priorityName.toLowerCase() === 'high'
                                                                    ? 'error'
                                                                    : project.priorityName.toLowerCase() === 'medium'
                                                                        ? 'warning'
                                                                        : 'default'
                                                            }
                                                            size="small"
                                                        />
                                                    </Stack>

                                                    <Box>
                                                        <Stack direction="row" justifyContent="space-between" mb={1}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Progress
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {project.completedTasks}/{project.totalTasks} tasks ({Math.round(progress)}%)
                                                            </Typography>
                                                        </Stack>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={progress}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </Box>

                                                    <Stack direction="row" spacing={2}>
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <CalendarIcon fontSize="small" color="action" />
                                                            <Typography variant="caption" color="text.secondary">
                                                                Start: {new Date(project.startDate).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                        <Box display="flex" alignItems="center" gap={0.5}>
                                                            <CalendarIcon fontSize="small" color="action" />
                                                            <Typography variant="caption" color="text.secondary">
                                                                End: {new Date(project.endDate).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Stack>
                        )}
                    </TabPanel>

                    {/* Tasks Tab */}
                    <TabPanel value={activeTab} index={1}>
                        {profile.tasks.length === 0 ? (
                            <Alert severity="info">No tasks found</Alert>
                        ) : (
                            <Stack spacing={2}>
                                {profile.tasks.map((task) => (
                                    <Card
                                        key={task.taskId}
                                        elevation={1}
                                        sx={{
                                            borderLeft: `4px solid ${task.priorityColor || '#ccc'}`,
                                            '&:hover': { boxShadow: 3 },
                                        }}
                                    >
                                        <CardContent>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/project-management/tasks/${task?.taskId}`);
                                                        }}
                                                        sx={{
                                                            textUnderlineOffset: '2px',
                                                            cursor: "pointer",
                                                        }}>
                                                        {task.taskTitle}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {task.taskCode}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    Status: &nbsp;&nbsp;
                                                    <Chip
                                                        label={task.statusName}
                                                        size="small"
                                                        color={task.statusColor as any}
                                                    />
                                                    &nbsp;&nbsp;|&nbsp;&nbsp;  Priority:
                                                    <Chip
                                                        label={task.priorityName}
                                                        size="small"
                                                        color={task.priorityColor as any}
                                                        sx={{
                                                            bgcolor: task.priorityColor,
                                                            color: 'white',
                                                        }}
                                                    />
                                                    {task.isOverDue && (
                                                        <Chip
                                                            label="OVERDUE"
                                                            size="small"
                                                            color="error"
                                                        />
                                                    )}
                                                </Stack>
                                                <Stack direction="row" spacing={2} flexWrap="wrap">
                                                    <Typography variant="caption" color="text.secondary">
                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </Typography>
                                                    <Typography variant="caption" color={task.isOverDue ? 'error' : 'text.secondary'}>
                                                        {task.daysUntilDue >= 0
                                                            ? `${task.daysUntilDue} days left`
                                                            : `${Math.abs(task.daysUntilDue)} days overdue`}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </TabPanel>

                    {/* Notifications Tab */}
                    <TabPanel value={activeTab} index={2}>
                        {profile.notifications.recentNotifications.length === 0 ? (
                            <Alert severity="info">No notifications</Alert>
                        ) : (
                            <Stack spacing={2}>
                                <Card elevation={2}>
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                                <Card sx={{ bgcolor: '#667eea', color: 'white', flex: 1 }}>
                                                    <CardContent>
                                                        <Typography variant="h4" fontWeight="bold">
                                                            {profile.notifications.totalUnread}
                                                        </Typography>
                                                        <Typography variant="body2">Unread</Typography>
                                                    </CardContent>
                                                </Card>
                                                <Card sx={{ bgcolor: '#4facfe', color: 'white', flex: 1 }}>
                                                    <CardContent>
                                                        <Typography variant="h4" fontWeight="bold">
                                                            {profile.notifications.totalToday}
                                                        </Typography>
                                                        <Typography variant="body2">Today</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Stack>
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    Recent Notifications
                                                </Typography>
                                                <List dense>
                                                    {profile.notifications.recentNotifications.map((notification) => (
                                                        <ListItem key={notification.id}>
                                                            <ListItemIcon>
                                                                <NotificationsIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={notification.title}
                                                                secondary={`${notification.message} - ${notification.timeAgo}`}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        )}
                    </TabPanel>
                </Paper>
            </Container>
        </AdminLayout>
    );
}
