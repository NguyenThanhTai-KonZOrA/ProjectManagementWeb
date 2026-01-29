# Task History Report Implementation Guide

## Overview
This guide documents the implementation of the Task History Report page with filtering, pagination, and export functionality.

---

## 1. Page Information

### Route
- **Path**: `/admin/project-management/task-history-report`
- **Permission**: `VIEW_ADMIN_DASHBOARD`
- **Component**: `AdminTaskHistoryReportPage.tsx`

### Features
✅ Advanced filtering (Date range, Project, Employee, Period Type)
✅ Autocomplete dropdowns for Project and Employee
✅ Paginated table display
✅ Export to Excel functionality
✅ Real-time loading states
✅ Responsive UI design based on AdminAuditLogsPage

---

## 2. API Integration

### Services Used

**taskHistoryReportService**
- `getTaskHistoryReport(filter: TaskReportFilterRequest): Promise<TaskReportFilterResponse[]>`
  - Endpoint: `POST /api/TaskReport/history`
  - Returns filtered task history records
  
- `exportTaskHistoryReport(filter: TaskReportFilterRequest): Promise<Blob>`
  - Endpoint: `POST /api/TaskReport/history/export`
  - Downloads Excel file with task history data

**projectManagementService**
- `getProjectsSummary(): Promise<ProjectSummaryResponse[]>`
  - Endpoint: `GET /api/project/summary`
  - Loads all projects for dropdown

**projectMemberService**
- `getAllMembers(): Promise<MemberByEmployeeResponse[]>`
  - Endpoint: `GET /api/ProjectMember/all`
  - Loads all employees for dropdown

---

## 3. Filter Components

### Date Range Filter
```tsx
// From Date
<TextField
    label="From Date"
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    inputProps={{
        max: FormatUtcTime.getTodayString()
    }}
/>

// To Date
<TextField
    label="To Date"
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    inputProps={{
        max: FormatUtcTime.getTodayString(),
        min: fromDate
    }}
/>
```

**Default Values**:
- From Date: 7 days ago
- To Date: Today

### Project Autocomplete
```tsx
<Autocomplete
    options={projects}
    getOptionLabel={(option) => `${option.projectCode} - ${option.projectName}`}
    value={selectedProject}
    onChange={(_event, newValue) => setSelectedProject(newValue)}
    loading={loadingProjects}
    renderInput={(params) => (
        <TextField
            {...params}
            label="Project"
            placeholder="Select project..."
        />
    )}
/>
```

**Features**:
- Searchable dropdown
- Shows project code + name
- Loading indicator
- Nullable (can be cleared)

### Employee Autocomplete
```tsx
<Autocomplete
    options={employees}
    getOptionLabel={(option) => `${option.employeeName} (${option.employeeCode})`}
    value={selectedEmployee}
    onChange={(_event, newValue) => setSelectedEmployee(newValue)}
    loading={loadingEmployees}
    renderInput={(params) => (
        <TextField
            {...params}
            label="Employee"
            placeholder="Select employee..."
        />
    )}
/>
```

**Features**:
- Searchable dropdown
- Shows employee name + code
- Loading indicator
- Nullable (can be cleared)

### Period Type Dropdown
```tsx
<Select
    value={periodType}
    onChange={(e) => setPeriodType(Number(e.target.value))}
    label="Period Type"
>
    <MenuItem value={0}>All</MenuItem>
    <MenuItem value={1}>Daily</MenuItem>
    <MenuItem value={2}>Weekly</MenuItem>
    <MenuItem value={3}>Monthly</MenuItem>
    <MenuItem value={4}>Quarterly</MenuItem>
</Select>
```

---

## 4. Table Display

### Columns
| Column | Description | Alignment | Format |
|--------|-------------|-----------|--------|
| Task Code | Unique task identifier | Left | Chip (Primary) |
| Task Title | Task description | Left | Text (Bold) |
| Employee | Assigned employee name | Left | Text |
| Status Change | From → To status | Center | Two chips with arrow |
| Changed At | Timestamp of change | Left | DateTime with icon |
| Duration | Work duration | Center | Text |
| Due Date | Task deadline | Left | Date format |
| Status | Overdue/On Time | Center | Chip (Success/Error) |

### Status Change Display
```tsx
const getStatusChip = (fromStatus: string, toStatus: string) => {
    const isCompleted = toStatus?.toLowerCase().includes('completed');
    const isInProgress = toStatus?.toLowerCase().includes('progress');
    
    return (
        <Stack direction="row" spacing={0.5}>
            <Chip label={fromStatus} variant="outlined" />
            <Typography>→</Typography>
            <Chip 
                label={toStatus} 
                color={isCompleted ? 'success' : isInProgress ? 'info' : 'default'}
            />
        </Stack>
    );
};
```

### Overdue Status Display
```tsx
const getOverdueChip = (isOverdue: boolean | undefined) => {
    return isOverdue ? (
        <Chip
            icon={<WarningIcon />}
            label="Overdue"
            color="error"
        />
    ) : (
        <Chip
            icon={<CheckCircleIcon />}
            label="On Time"
            color="success"
        />
    );
};
```

---

## 5. Pagination

### Implementation
```tsx
<TablePagination
    component="div"
    count={reports.length}
    page={page}
    onPageChange={handlePageChange}
    rowsPerPage={rowsPerPage}
    onRowsPerPageChange={handleRowsPerPageChange}
    rowsPerPageOptions={[10, 25, 50, 100]}
    labelRowsPerPage="Rows per page:"
/>
```

**Features**:
- Client-side pagination
- Configurable page sizes: 10, 25, 50, 100
- Displays total records count
- Automatically resets to page 0 on filter changes

### Paginated Data
```tsx
const paginatedReports = reports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
);
```

---

## 6. Export Functionality

### Excel Export
```tsx
const handleExport = async () => {
    try {
        setExporting(true);
        
        const request: TaskReportFilterRequest = {
            projectId: selectedProject?.id ? Number(selectedProject.id) : undefined,
            employeeId: selectedEmployee?.id,
            fromDate: fromDate ? new Date(fromDate) : undefined,
            toDate: toDate ? new Date(toDate) : undefined,
            periodType: periodType === 0 ? undefined : periodType
        };

        const blob = await taskHistoryReportService.exportTaskHistoryReport(request);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TaskHistoryReport_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting report:', error);
    } finally {
        setExporting(false);
    }
};
```

**Features**:
- Downloads Excel file (.xlsx)
- Filename includes current date
- Loading state during export
- Button disabled when no data
- Same filters applied as table view

---

## 7. Loading States

### Table Loading Overlay
```tsx
{loading && (
    <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.7)"
        zIndex={10}
        sx={{ backdropFilter: 'blur(2px)' }}
    >
        <CircularProgress size={40} />
    </Box>
)}
```

### Dropdown Loading
- Project autocomplete shows loading spinner
- Employee autocomplete shows loading spinner
- Data loaded on component mount

---

## 8. Filter Request Structure

### TaskReportFilterRequest
```typescript
interface TaskReportFilterRequest {
    projectId?: number;        // From selectedProject.id
    employeeId?: number;       // From selectedEmployee.id
    fromDate?: Date;           // Converted from string
    toDate?: Date;             // Converted from string
    periodType?: number;       // 0 = All, 1-4 = specific periods
}
```

### Example Request
```json
{
    "projectId": 123,
    "employeeId": 456,
    "fromDate": "2026-01-21T00:00:00",
    "toDate": "2026-01-28T00:00:00",
    "periodType": 2
}
```

---

## 9. Response Structure

### TaskReportFilterResponse
```typescript
interface TaskReportFilterResponse {
    id: number;
    taskId: number;
    taskCode: string;
    taskTitle: string;
    employeeId: number;
    employeeName: string;
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    projectId?: number;
    workDuration?: string;
    completedAt?: string;
    isOverdue?: boolean;
    dueDate?: string;
    periodType?: number;
}
```

### Example Response
```json
[
    {
        "id": 1,
        "taskId": 101,
        "taskCode": "TASK-001",
        "taskTitle": "Implement login feature",
        "employeeId": 456,
        "employeeName": "John Doe",
        "fromStatus": "In Progress",
        "toStatus": "Completed",
        "changedAt": "2026-01-28T10:30:00",
        "projectId": 123,
        "workDuration": "3 hours",
        "completedAt": "2026-01-28T10:30:00",
        "isOverdue": false,
        "dueDate": "2026-01-30T00:00:00",
        "periodType": 1
    }
]
```

---

## 10. UI/UX Features

### Filter Panel
- Collapsible card with grey background
- Filter icon in header
- Responsive flexbox layout
- All filters in one row with wrapping

### Action Buttons
1. **Search** (Primary, Contained)
   - Triggers data refresh with current filters
   - Disabled during loading
   
2. **Refresh** (Outlined)
   - Reloads data with same filters
   - Disabled during loading

3. **Clear** (Outlined)
   - Resets all filters to default
   - Resets to page 0

4. **Export** (Success, Contained)
   - Downloads Excel file
   - Disabled when no data or exporting
   - Shows loading spinner during export

### Visual Indicators
- **Loading Overlay**: Blurred background with spinner
- **Status Chips**: Color-coded (Success/Info/Default)
- **Overdue Indicator**: Red warning chip
- **Status Change**: Arrow between two chips
- **Access Time Icon**: Next to timestamp

---

## 11. File Structure

### Files Created
```
src/pages/
  └── AdminTaskHistoryReportPage.tsx    (Main component)

Notes/
  └── TASK_HISTORY_REPORT_GUIDE.md     (This file)
```

### Files Modified
```
src/App.tsx                             (Added route)
src/constants/pageTitles.ts             (Added page title)
```

---

## 12. Usage Example

### Navigation
1. User navigates to `/admin/project-management/task-history-report`
2. Page loads with default filters (Last 7 days)
3. Projects and employees dropdowns populate automatically

### Filtering Workflow
1. Select date range (From/To)
2. Choose project from autocomplete (optional)
3. Choose employee from autocomplete (optional)
4. Select period type (optional)
5. Click "Search" button
6. Table updates with filtered data

### Export Workflow
1. Apply desired filters
2. Click "Export" button
3. Excel file downloads automatically
4. Filename: `TaskHistoryReport_YYYY-MM-DD.xlsx`

---

## 13. Testing Checklist

### Filter Testing
- [ ] Date range validation (To Date >= From Date)
- [ ] Max date is today
- [ ] Project autocomplete search works
- [ ] Employee autocomplete search works
- [ ] Period type dropdown shows all options
- [ ] Clear button resets all filters

### Data Display
- [ ] Table shows correct columns
- [ ] Status change displays as "From → To"
- [ ] Overdue status shows correct color
- [ ] Pagination works correctly
- [ ] Empty state message displays when no data

### Export Testing
- [ ] Export button disabled when no data
- [ ] Excel file downloads with correct name
- [ ] Exported data matches table filters
- [ ] Loading spinner shows during export

### Performance
- [ ] Loading overlay displays during data fetch
- [ ] Autocomplete dropdowns show loading state
- [ ] No errors in console
- [ ] Responsive on different screen sizes

---

## 14. Troubleshooting

### Issue: No data displayed
**Solution**: Check if:
- Date range is valid
- API endpoints are accessible
- Network connection is stable
- Filters are not too restrictive

### Issue: Export not working
**Solution**: Check if:
- Backend returns Blob correctly
- Browser allows file downloads
- No console errors during export
- File size is not too large

### Issue: Autocomplete not loading
**Solution**: Check if:
- API endpoints return data
- Loading state is properly set
- Error handling is in place
- Network is available

---

## 15. Future Enhancements

### Possible Improvements
1. **Advanced Filters**
   - Task status filter
   - Priority filter
   - Task type filter (Bug/SubTask)

2. **Data Visualization**
   - Charts for status changes
   - Employee performance metrics
   - Project completion trends

3. **Real-time Updates**
   - Auto-refresh every N seconds
   - WebSocket integration for live data

4. **Export Options**
   - PDF export
   - CSV export
   - Custom column selection

5. **Saved Filters**
   - Save filter presets
   - Load saved filters
   - Share filter configurations

---

**Last Updated**: January 28, 2026
**Version**: 1.0.0
**Author**: AI Assistant
