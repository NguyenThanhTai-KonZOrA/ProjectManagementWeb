# Project Manager Role Implementation Guide

## Overview
This guide documents the implementation of Project Manager role permissions and UI enhancements in the Project Management system.

---

## 1. Role-Based Access Control (RBAC)

### New Role Added
- **Role Name**: `Project Manager`
- **Constant**: `UserRole.PROJECT_MANAGER = 'Project Manager'`
- **Priority**: Between Admin and Manager (Admin > Project Manager > Manager > Counter Staff > User > Viewer)

### Permissions
Project Managers have the following permissions:
- `VIEW_ADMIN_DASHBOARD` - Can access admin dashboard
- Full control over project management operations:
  - Create/Edit/Delete Projects
  - Create/Edit/Delete Tasks
  - Change Project Status and Priority
  - Approve/Reject Tasks
  - Add Project Members

### Files Modified
1. **`src/constants/roles.ts`**
   - Added `PROJECT_MANAGER: 'Project Manager'` to `UserRole`
   - Added Project Manager to `ROLE_PERMISSIONS` mapping
   - Updated `getPrimaryRole()` function to include Project Manager in priority order

2. **`src/hooks/useIsProjectManager.ts`** (NEW)
   - Custom hook to check if user is Project Manager or Admin
   - Returns `true` if user has PROJECT_MANAGER or ADMIN role
   - Also includes `useHasRole()` helper function

---

## 2. UI Access Control - AdminProjectsPage

### Button Restrictions
**Create Project Button**
- **Disabled for**: Non-Project Managers
- **Location**: Top action bar
- **Implementation**:
  ```tsx
  <Button
      disabled={!isProjectManager}
      onClick={handleOpenDialog}
  >
      Create project
  </Button>
  ```

### Visual Feedback
- Button becomes greyed out when disabled
- Users without Project Manager role cannot create new projects

---

## 3. UI Access Control - AdminProjectDetailsPage

### Restricted Actions
All the following controls are **disabled** for non-Project Managers:

1. **Edit Project Button**
   - Cannot modify project details
   - Button disabled state: `disabled={!isProjectManager}`

2. **Create Task Button**
   - Cannot create new tasks for the project
   - Button disabled state: `disabled={!isProjectManager}`

3. **Status Dropdown**
   - Cannot change project status
   - Select disabled state: `disabled={!isProjectManager}`

4. **Priority Dropdown**
   - Cannot change project priority
   - Select disabled state: `disabled={!isProjectManager}`

### Code Implementation
```tsx
const isProjectManager = useIsProjectManager();

// Edit Button
<Button
    startIcon={<EditIcon />}
    onClick={handleOpenEditDialog}
    disabled={!isProjectManager}
>
    Edit Project
</Button>

// Create Task Button
<Button
    startIcon={<AddIcon />}
    onClick={handleOpenTaskDialog}
    disabled={!isProjectManager}
>
    Create Task
</Button>

// Status Select
<Select
    value={project?.statusId || 1}
    onChange={(e) => handleStatusChange(Number(e.target.value))}
    disabled={!isProjectManager}
>
    {/* ... */}
</Select>

// Priority Select
<Select
    value={project?.priorityId || 1}
    onChange={(e) => handlePriorityChange(Number(e.target.value))}
    disabled={!isProjectManager}
>
    {/* ... */}
</Select>
```

---

## 4. UI Access Control - AdminTaskDetailsPage

### Restricted Actions

1. **Approve Button**
   - Cannot approve tasks
   - Disabled conditions:
     - User is not Project Manager
     - Task is already rejected
   - Implementation: `disabled={task?.isRejected || !isProjectManager}`

2. **Reject Button**
   - Cannot reject tasks
   - Disabled conditions:
     - User is not Project Manager
     - Task is already approved or rejected
   - Implementation: `disabled={task?.isApproved || task?.isRejected || !isProjectManager}`

### Code Implementation
```tsx
const isProjectManager = useIsProjectManager();

<Button
    color="success"
    startIcon={<ApproveIcon />}
    onClick={handleApprove}
    disabled={task?.isRejected || !isProjectManager}
>
    Approve
</Button>

<Button
    color="error"
    startIcon={<RejectIcon />}
    onClick={handleReject}
    disabled={task?.isApproved || task?.isRejected || !isProjectManager}
>
    Reject
</Button>
```

---

## 5. UI Enhancement - Task Members Display

### Added Members Section
**Location**: AdminTaskDetailsPage > Right Column > Details Card

**Features**:
- Displays all assigned members (assignees)
- Shows member count: `Members (X)`
- Uses `AvatarGroup` component for compact display
- Maximum 10 avatars visible (overflow shows "+N")
- Hover tooltip shows full member name

### Implementation
```tsx
import { Avatar, AvatarGroup, Tooltip } from "@mui/material";

{/* Members */}
<Box>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        Members ({task?.assignees?.length || 0})
    </Typography>
    <Box sx={{ mt: 1 }}>
        <AvatarGroup max={10}>
            {task?.assignees?.map((assignee, index) => (
                <Tooltip key={index} title={assignee.memberName}>
                    <Avatar
                        src={assignee.memberImage}
                        alt={assignee.memberName}
                        sx={{ width: 32, height: 32 }}
                    >
                        {assignee.memberName.charAt(0)}
                    </Avatar>
                </Tooltip>
            ))}
        </AvatarGroup>
    </Box>
</Box>
```

---

## 6. UI Enhancement - Bug Icon for Bug Tasks

### Visual Distinction
**Purpose**: Differentiate Bug Tasks from SubTasks with visual icons

**Implementation**:
- **SubTasks**: Green checkmark icon (`CheckCircle`)
- **Bug Tasks**: Red bug icon (`BugIcon`)

### Code Changes
```tsx
import { 
    CheckCircle, 
    BugReport as BugIcon 
} from "@mui/icons-material";

// SubTask Display
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <CheckCircle sx={{ color: "success.main", fontSize: 20 }} />
    <Box>
        <Typography variant="body2" fontWeight={600}>
            {subTask.taskCode}: {subTask.taskTitle}
        </Typography>
        {/* ... */}
    </Box>
</Box>

// Bug Task Display
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <BugIcon sx={{ color: "error.main", fontSize: 20 }} />
    <Box>
        <Typography variant="body2" fontWeight={600}>
            {bugTask.taskCode}: {bugTask.taskTitle}
        </Typography>
        {/* ... */}
    </Box>
</Box>
```

### Visual Indicators
- **SubTask Icon**: ✓ (Green - success.main color)
- **Bug Icon**: 🐛 (Red - error.main color)
- **Size**: 20px for both icons
- **Positioning**: Left side of task title

---

## Summary of Changes

### Files Created
1. `src/hooks/useIsProjectManager.ts` - Role checking hook

### Files Modified
1. `src/constants/roles.ts` - Added Project Manager role
2. `src/projectManagementPages/AdminProjectsPage.tsx` - Disabled Create button
3. `src/projectManagementPages/AdminProjectDetailsPage.tsx` - Disabled Edit, Create Task, Status, Priority
4. `src/projectManagementPages/AdminTaskDetailsPage.tsx` - 
   - Disabled Approve/Reject buttons
   - Added Members section
   - Added icons for SubTasks and Bugs

### Key Features
✅ Role-based access control for Project Manager
✅ UI elements disabled for non-Project Managers
✅ Members display in task details
✅ Visual distinction between SubTasks and Bugs

---

## Testing Checklist

### Project Manager Role
- [ ] User with "Project Manager" role can create projects
- [ ] User with "Project Manager" role can edit projects
- [ ] User with "Project Manager" role can create tasks
- [ ] User with "Project Manager" role can change status/priority
- [ ] User with "Project Manager" role can approve/reject tasks

### Non-Project Manager Users
- [ ] Create Project button is disabled
- [ ] Edit Project button is disabled
- [ ] Create Task button is disabled
- [ ] Status dropdown is disabled
- [ ] Priority dropdown is disabled
- [ ] Approve button is disabled
- [ ] Reject button is disabled

### UI Enhancements
- [ ] Members section shows all assigned members
- [ ] AvatarGroup displays correctly (max 10, overflow shows +N)
- [ ] Hover tooltips show member names
- [ ] SubTasks show green checkmark icon
- [ ] Bug Tasks show red bug icon
- [ ] Icons are properly aligned with task titles

---

## User Experience

### For Project Managers
- Full access to all project management features
- Can create, edit, and manage projects
- Can approve/reject tasks
- Visual feedback: All buttons and controls are enabled

### For Regular Users
- Read-only access to project information
- Cannot modify projects or tasks
- Cannot approve/reject tasks
- Visual feedback: Disabled buttons appear greyed out
- Clear indication of limited permissions

---

## Future Enhancements

1. **Permission Granularity**
   - Separate permissions for different actions
   - Custom role creation
   - Per-project permissions

2. **Visual Feedback**
   - Tooltip messages explaining why buttons are disabled
   - Permission denied modal dialogs
   - Role badges on user profiles

3. **Audit Trail**
   - Log all permission-restricted actions
   - Track who attempted restricted actions
   - Permission change notifications

---

## Maintenance Notes

- The `useIsProjectManager` hook centralizes role checking logic
- Admin users have all permissions including Project Manager rights
- Role priority order is important for `getPrimaryRole()` function
- UI components should always check `isProjectManager` before allowing actions

---

**Last Updated**: January 28, 2026
**Version**: 1.0.0
