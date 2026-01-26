# New Features Implementation Guide

## Overview
This guide documents the implementation of two new features:
1. **Employee Profile Page** - A comprehensive profile page showing employee information, projects, tasks, and notifications
2. **Notification Bell** - A real-time notification system in the main navigation bar

---

## 1. Employee Profile Page

### Location
- **File**: `src/pages/EmployeeProfilePage.tsx`
- **Route**: `/profile`
- **Access**: Available to all authenticated users

### Features
- **Header Section**: 
  - Employee avatar with first letter of name
  - Employee name, code, and ID
  - Gradient background for visual appeal

- **Statistics Cards** (4 cards):
  - Total Projects
  - Total Tasks
  - Completed Tasks
  - Overdue Tasks (color changes based on count)

- **Tabs** (3 tabs):
  1. **Projects Tab**:
     - Lists all projects assigned to the employee
     - Shows project name, description, status, and priority
     - Progress bar showing task completion (completed/total tasks)
     - Start and end dates
     - Color-coded status and priority chips
  
  2. **Tasks Tab**:
     - Lists all tasks assigned to the employee
     - Shows task name, description, status, and priority
     - Color-coded priority border (left side)
     - Overdue indicator
     - Days until due / days overdue
     - Color-coded status chips
  
  3. **Notifications Tab**:
     - Summary cards showing unread and today's notifications
     - Recent notifications list (top 5)
     - Notification type and time ago

### API Used
- `employeeRoleService.getEmployeeProfile()` 
  - Endpoint: `GET /api/Employee/summary-by-employee`
  - Returns: `SummaryProfileEmployeeResponse`

### Design Highlights
- Modern gradient header (purple gradient: #667eea to #764ba2)
- Responsive layout with Stack components (avoiding Grid to prevent MUI v7 issues)
- Color-coded elements for better visual distinction
- Hover effects on cards for interactivity
- Loading state with CircularProgress
- Error handling with Alert component

---

## 2. Notification Bell

### Location
- **Component**: `src/components/NotificationBell.tsx`
- **Integrated in**: `src/components/layout/MainNav.tsx`
- **Position**: Main navigation bar, left of the user avatar

### Features
- **Badge**: Shows count of unread notifications
- **Dropdown Menu**:
  - Displays top 5 unread notifications
  - Each notification shows:
    - Title (bold)
    - Type name
    - Time ago
    - Priority indicator (colored circle and left border)
  - "View All Notifications" link at bottom navigates to profile page

- **Priority Colors**:
  - Urgent (4): Red (#ff6b6b)
  - High (3): Orange (#ffa500)
  - Medium (2): Blue (#4facfe)
  - Low (1): Green (#51cf66)

- **Auto-refresh**: Notifications refresh every 30 seconds

### Interaction Flow
1. User clicks notification bell icon
2. Dropdown menu opens showing unread notifications
3. User clicks on a notification:
   - Notification is marked as read via API
   - User is navigated to `/profile` page
   - Menu closes
   - Notifications are reloaded
4. User can also click "View All Notifications" to go to profile page

### APIs Used
- `projectNotificationService.getNotificationUnread()`
  - Endpoint: `GET /api/Notification/unread`
  - Returns: `NotificationResponse[]`
  
- `projectNotificationService.markNotificationReadById(notificationId)`
  - Endpoint: `POST /api/Notification/{notificationId}/read`
  - Marks a single notification as read

### Design Highlights
- Badge with error color for visibility
- Dropdown menu with rounded corners and shadow
- Priority-based color coding (left border + circle icon)
- Loading state while fetching notifications
- Empty state message when no notifications
- Hover effects on menu items
- Auto-refresh functionality for real-time updates

---

## API Changes Made

### Updated API Endpoint
Changed `getNotificationUnread` from:
```typescript
// OLD - POST request (incorrect)
getNotificationUnread: async (): Promise<NotificationResponse[]> => {
    const response = await api.post(`/api/Notification/unread-multiple`);
    return unwrapApiEnvelope(response);
}
```

To:
```typescript
// NEW - GET request (correct)
getNotificationUnread: async (): Promise<NotificationResponse[]> => {
    const response = await api.get(`/api/Notification/unread`);
    return unwrapApiEnvelope(response);
}
```

---

## Routing

### Added Route
```typescript
<Route path="/profile" element={
  <ProtectedRoute>
    <EmployeeProfilePage />
  </ProtectedRoute>
} />
```

This route is accessible to all authenticated users (no specific permission required).

---

## Type Definitions Used

### SummaryProfileEmployeeResponse
```typescript
export interface SummaryProfileEmployeeResponse {
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    projects: ProjectProfileData[];
    tasks: TaskProfileData[];
    notifications: NotificationSummaryResponse[];
}
```

### NotificationResponse
```typescript
export interface NotificationResponse {
    id: number;
    type: number;
    typeName: string;
    title: string;
    message: boolean;
    recipientEmployeeId: string;
    recipientName: string;
    relatedTaskId: string;
    relatedTaskCode: string;
    relatedProjectId: string;
    relatedProjectName: string;
    actionUrl: string;
    isRead: boolean;
    readAt: string;
    priority: number; // 1: Low, 2: Medium, 3: High, 4: Urgent
    createdAt: string;
    timeAgo: string;
}
```

---

## Testing Checklist

### Employee Profile Page
- [ ] Navigate to `/profile` when logged in
- [ ] Verify all employee information is displayed correctly
- [ ] Check statistics cards show correct counts
- [ ] Test all 3 tabs (Projects, Tasks, Notifications)
- [ ] Verify projects show progress bars
- [ ] Check task priority colors and overdue indicators
- [ ] Test responsive layout on different screen sizes
- [ ] Verify loading state appears during data fetch
- [ ] Test error handling when API fails

### Notification Bell
- [ ] Verify notification bell appears in main nav
- [ ] Check badge count matches unread notifications
- [ ] Click bell and verify dropdown opens
- [ ] Verify top 5 notifications are displayed
- [ ] Check priority colors are correct
- [ ] Click a notification and verify:
  - [ ] It navigates to profile page
  - [ ] Notification is marked as read
  - [ ] Badge count decreases
- [ ] Test "View All Notifications" link
- [ ] Verify auto-refresh works (wait 30 seconds)
- [ ] Test empty state (no notifications)
- [ ] Verify loading state during API call

---

## Future Enhancements

### Employee Profile Page
- Add ability to filter/sort projects and tasks
- Add search functionality
- Include charts/graphs for statistics
- Add export functionality (PDF, Excel)
- Add task creation/editing from profile page
- Add project details modal on click

### Notification Bell
- Add notification settings (enable/disable types)
- Add notification sound/desktop notifications
- Add "Mark all as read" functionality
- Add notification preferences (email, in-app, push, SMS)
- Add real-time notifications via SignalR/WebSockets
- Add notification categories/filters
- Add notification search

---

## Known Issues
None at this time.

---

## Dependencies
- React 18+
- MUI v7
- React Router v6
- TypeScript

---

## Maintenance Notes
- Notification auto-refresh interval is set to 30 seconds (configurable in `NotificationBell.tsx`)
- Badge color is set to "error" for visibility (red)
- Profile page uses Stack layout instead of Grid to avoid MUI v7 compatibility issues
