import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    ListItemIcon,
    ListItemText,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { projectNotificationService } from '../services/projectManagementService';
import type { NotificationResponse } from '../projectManagementTypes/projectNotificationType';

export function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    useEffect(() => {
        loadNotifications();
        // Refresh notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await projectNotificationService.getNotificationUnread();
            setNotifications(data.slice(0, 5)); // Only show top 5
            setUnreadCount(data.length);
        } catch (err) {
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: NotificationResponse) => {
        try {
            // Mark as read
            await projectNotificationService.markNotificationReadById(notification.id);
            
            // Navigate to profile
            navigate('/profile');
            
            // Close menu
            handleClose();
            
            // Reload notifications
            loadNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 4: return '#ff6b6b'; // Urgent
            case 3: return '#ffa500'; // High
            case 2: return '#4facfe'; // Medium
            case 1: return '#51cf66'; // Low
            default: return '#ccc';
        }
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    onClick={handleClick}
                    sx={{ color: 'inherit' }}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    mt: 1,
                    '& .MuiPaper-root': {
                        borderRadius: 2,
                        minWidth: 350,
                        maxWidth: 400,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Notifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </Typography>
                </Box>
                <Divider />

                {loading ? (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No unread notifications
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CircleIcon 
                                        sx={{ 
                                            fontSize: 12, 
                                            color: getPriorityColor(notification.priority)
                                        }} 
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="bold" noWrap>
                                            {notification.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {notification.typeName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {notification.timeAgo}
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        ))}
                        <Divider />
                        <MenuItem
                            onClick={() => {
                                navigate('/profile');
                                handleClose();
                            }}
                            sx={{
                                justifyContent: 'center',
                                color: 'primary.main',
                                fontWeight: 'bold',
                            }}
                        >
                            View All Notifications
                        </MenuItem>
                    </>
                )}
            </Menu>
        </>
    );
}
