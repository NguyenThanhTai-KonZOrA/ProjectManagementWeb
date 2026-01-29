import * as React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Drawer,
    Stack,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Assessment as AssessmentIcon,
    BarChart as BarChartIcon,
    PersonSearch as PersonSearchIcon,
    DesignServices as DesignServicesIcon,
    Groups as GroupsIcon,
    AddBusiness as AddBusinessIcon,
    FormatListNumberedRtl as FormatListNumberedRtlIcon,
    ManageHistory as ManageHistoryIcon,
    AssignmentInd as RoleManagementIcon,
    VerifiedUser as PermissionManagementIcon,
    Archive as ArchiveIcon,
    Apps as AppIcon,
    Category as CategoryIcon,
    FileDownloadDone as FileDownloadDoneIcon,
    Filter9Plus as Filter9PlusIcon,
} from '@mui/icons-material';
import { Permission } from '../../constants/roles';
import { usePermission } from '../../hooks/usePermission';
import type { NavItem } from '../../type/commonType';
import { ThemeToggleButton } from '../ThemeToggleButton';

const navItems: NavItem[] = [
    {
        key: 'dashboard',
        title: 'Dashboard',
        href: '/admin-dashboard',
        icon: DashboardIcon,
        requiredPermission: Permission.VIEW_ADMIN_DASHBOARD
    },
    {
        key: 'project',
        title: 'Project Management',
        href: '/admin/project-management/projects',
        icon: AppIcon,
        requiredPermission: Permission.VIEW_APPLICATION_MANAGEMENT
    },
    {
        key: 'task',
        title: 'Task Management',
        href: '/admin-tasks',
        icon: AssignmentIcon,
        requiredPermission: Permission.VIEW_APPLICATION_MANAGEMENT
    },
    {
        key: 'category',
        title: 'Category Management',
        href: '/admin-category',
        icon: CategoryIcon,
        requiredPermission: Permission.VIEW_CATEGORY_MANAGEMENT
    },
    {
        key: 'icons',
        title: 'Icons Management',
        href: '/admin-icons',
        icon: Filter9PlusIcon,
        requiredPermission: Permission.VIEW_ICON_MANAGEMENT
    },
    // {
    //     key: 'application',
    //     title: 'Application Management',
    //     href: '/admin-application',
    //     icon: AppIcon,
    //     requiredPermission: Permission.VIEW_APPLICATION_MANAGEMENT
    // },
    // {
    //     key: 'category',
    //     title: 'Category Management',
    //     href: '/admin-category',
    //     icon: CategoryIcon,
    //     requiredPermission: Permission.VIEW_CATEGORY_MANAGEMENT
    // },
    // {
    //     key: 'package',
    //     title: 'Packages Management',
    //     href: '/admin-package',
    //     icon: FileDownloadDoneIcon,
    //     requiredPermission: Permission.VIEW_PACKAGE_MANAGEMENT
    // },

    // {
    //     key: 'installation',
    //     title: 'Installation Logs',
    //     href: '/admin-installation',
    //     icon: ManageHistoryIcon,
    //     requiredPermission: Permission.VIEW_INSTALLATION_LOGS
    // },
   {
        key: 'admin-task-history-report',
        title: 'Task History Report',
        href: '/admin/project-management/task-history-report',
        icon: AssessmentIcon,
        requiredPermission: Permission.VIEW_INSTALLATION_REPORTS
    },
    {
        key: 'admin-audit-logs',
        title: 'Audit Logs',
        href: '/admin-audit-logs',
        icon: ManageHistoryIcon,
        requiredPermission: Permission.VIEW_AUDIT_LOGS,
    },
    {
        key: 'admin-roles',
        title: 'Role Management',
        href: '/admin-roles',
        icon: RoleManagementIcon,
        requiredPermission: Permission.VIEW_ROLE_MANAGEMENT
    },
    {
        key: 'admin-permissions',
        title: 'Permission Management',
        href: '/admin-permissions',
        icon: PermissionManagementIcon,
        requiredPermission: Permission.VIEW_PERMISSION_MANAGEMENT
    },
    {
        key: 'admin-employees',
        title: 'Employee Management',
        href: '/admin-employees',
        icon: PeopleIcon,
        requiredPermission: Permission.VIEW_EMPLOYEE_MANAGEMENT
    },
    {
        key: 'admin-settings',
        title: 'System Settings',
        href: '/admin-settings',
        icon: SettingsIcon,
        requiredPermission: Permission.VIEW_SYSTEM_SETTINGS
    },
];

interface MobileNavProps {
    onClose: () => void;
    open: boolean;
}

export function MobileNav({ onClose, open }: MobileNavProps): React.JSX.Element {
    const location = useLocation();
    const { can } = usePermission();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    // Filter nav items base on permissions
    const filteredNavItems = navItems.filter((item) => {
        // If item does not require permission, always show
        if (!item.requiredPermission) {
            return true;
        }
        // Only show if user has permission
        return can(item.requiredPermission);
    });

    return (
        <Drawer
            anchor="left"
            onClose={onClose}
            open={open}
            PaperProps={{
                sx: {
                    background: isDarkMode
                        ? 'linear-gradient(180deg, #1a1f3a 0%, #0f1419 100%)'
                        : 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    color: 'var(--mui-palette-common-white)',
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: isDarkMode ? '1px solid rgba(139, 154, 247, 0.1)' : 'none',
                },
            }}
            sx={{ display: { lg: 'none' } }}
        >
            {/* Logo Section */}
            <Stack spacing={1} sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                    <img src="/images/TheGrandHoTram.png" alt="Logo" style={{ height: 70, width: 'auto' }} />
                </Box>
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        letterSpacing: 0.5,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    Project Management
                </Typography>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', mx: 2 }} />

            {/* Navigation Items */}
            <Box
                sx={{
                    flex: '1 1 auto',
                    overflow: 'auto',
                    py: 2,
                }}
            >
                <List sx={{ px: 2 }}>
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    component={RouterLink}
                                    to={item.href}
                                    onClick={onClose}
                                    sx={{
                                        borderRadius: 2,
                                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.85)',
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                        backdropFilter: isActive ? 'blur(10px)' : 'none',
                                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: isActive
                                                ? 'rgba(255, 255, 255, 0.2)'
                                                : 'rgba(255, 255, 255, 0.08)',
                                            transform: 'translateX(4px)',
                                        },
                                        py: 1.2,
                                        px: 2,
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: 'inherit',
                                            minWidth: 40,
                                        }}
                                    >
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: isActive ? 600 : 500,
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Theme Toggle at Bottom */}
            <Box sx={{ p: 2, mt: 'auto' }}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.15)', mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ThemeToggleButton />
                </Box>
            </Box>
        </Drawer>
    );
}
