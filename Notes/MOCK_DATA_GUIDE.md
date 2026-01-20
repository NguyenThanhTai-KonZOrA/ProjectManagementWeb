# Mock Data Configuration Guide

## Cách sử dụng Mock Data

Mock data được sử dụng khi backend server chưa sẵn sàng hoặc để testing/development.

### 1. Bật/Tắt Mock Data

Mở file `public/env-config.js` và thay đổi giá trị `USE_MOCK_DATA`:

```javascript
window._env_ = {
  API_BASE: 'http://10.21.10.1:8102',
  BUILD_VERSION: 'dev-20251007-125851-9885e08',
  BUILD_DATE: '2025-10-07 12:58:51',
  PACKAGE_VERSION: '0.0.0',
  USE_MOCK_DATA: true, // Set to true để dùng mock data, false để dùng API thật
};
```

### 2. Mock Data có sẵn

File `public/Mockup/mockup_data.ts` chứa:

#### Projects (6 projects)
- Patron Responsible Gaming Alert (Gaming, High Priority, 10 tasks, 3 completed)
- Task Management System (Non-gaming, Medium Priority, 30 tasks, all completed)
- Ho Tram Rewards Non Gaming (Gaming, Critical Priority, 10 tasks, 2 completed)
- Patron Responsible Gaming Alert Mobile (Non-gaming, Medium Priority, 10 tasks, 2 completed)
- Task Management System v2 (Non-gaming, Medium Priority, 30 tasks, 0 completed)
- Ho Tram Rewards Gaming Edition (Gaming, High Priority, 10 tasks, 2 completed)

#### Project Categories (4 categories)
- Web Application
- Mobile Application
- Desktop Application
- API Service

#### Dashboard Data
- Total Projects: 6
- Completed Tasks: 37
- Pending Tasks: 53
- Issues: 8
- Timeline data (8 days)
- Recent Activities (10 activities)

#### Tasks (2 sample tasks)
- Design UI/UX
- Implement Frontend

#### Comments (2 sample comments)
- Progress feedback
- Color scheme review

#### Activity Logs (10 activities)
- Project creation, updates, task completion, etc.

### 3. Tính năng của Mock Service

Mock services hỗ trợ đầy đủ CRUD operations:

#### Project Management
- ✅ Create project
- ✅ Update project
- ✅ Delete project
- ✅ Get project by ID
- ✅ Get all projects

#### Task Management
- ✅ Create task
- ✅ Update task
- ✅ Delete task
- ✅ Get task by ID
- ✅ Get all tasks
- ✅ Get tasks by project

#### Category Management
- ✅ Create category
- ✅ Update category
- ✅ Delete category
- ✅ Get category by ID
- ✅ Get all categories

#### Comment Management
- ✅ Create comment
- ✅ Update comment
- ✅ Delete comment
- ✅ Get comment by ID
- ✅ Get all comments
- ✅ Get comments by task/project

#### Dashboard & Activity Logs
- ✅ Get project overview
- ✅ Get all activity logs
- ✅ Get logs by project/task

### 4. Đặc điểm của Mock Data

- **Simulated API Delay**: 500ms delay để giống thật
- **In-Memory Storage**: Data được lưu trong memory, refresh page sẽ reset về mẫu ban đầu
- **Auto-generated IDs**: Tự động tạo ID mới khi create
- **Activity Logging**: Tự động ghi log khi có thao tác
- **Real-time Statistics**: Dashboard tự động tính toán từ data hiện tại

### 5. Cấu trúc Files

```
public/
  └── Mockup/
      └── mockup_data.ts          # Mock data definitions
  └── env-config.js               # Config file (bật/tắt mock)

src/
  └── services/
      ├── projectManagementService.ts       # Service chính (auto switch)
      └── mockProjectManagementService.ts   # Mock service implementation
```

### 6. Testing với Mock Data

1. **Enable Mock Data**:
   ```javascript
   USE_MOCK_DATA: true
   ```

2. **Test các tính năng**:
   - Tạo project mới
   - Edit project
   - Delete project
   - Filter projects
   - Xem dashboard statistics

3. **Disable Mock Data** khi backend ready:
   ```javascript
   USE_MOCK_DATA: false
   ```

### 7. Customize Mock Data

Để thay đổi mock data, edit file `public/Mockup/mockup_data.ts`:

```typescript
// Thêm project mới
export const mockProjects: ProjectResponse[] = [
    // ... existing projects
    {
        id: "7",
        projectName: "Your New Project",
        projectCode: "YNP-007",
        priority: 2,
        // ... other fields
    }
];

// Thay đổi dashboard statistics
export const mockDashboardData: ProjectOverviewDashboardResponse = {
    totalProjects: 7, // Update số lượng
    totalCompletedTasks: 50,
    // ... other fields
};
```

### 8. Troubleshooting

**Q: Mock data không hoạt động?**
- Kiểm tra `USE_MOCK_DATA: true` trong `env-config.js`
- Clear cache và refresh browser
- Check console cho errors

**Q: Data bị reset sau khi refresh?**
- Đây là behavior bình thường vì mock data lưu trong memory
- Nếu cần persist, có thể implement localStorage

**Q: Làm sao để test với API thật?**
- Set `USE_MOCK_DATA: false` trong `env-config.js`
- Đảm bảo `API_BASE` URL đúng
- Backend server phải đang chạy

### 9. Best Practices

1. **Development**: Dùng mock data để develop UI/UX không cần backend
2. **Testing**: Test các edge cases với mock data
3. **Demo**: Dùng mock data cho demo/presentation
4. **Production**: Luôn set `USE_MOCK_DATA: false` trước khi deploy

### 10. Mock Data vs Real API

| Feature | Mock Data | Real API |
|---------|-----------|----------|
| Speed | Fast (500ms) | Depends on network |
| Persistence | No (memory only) | Yes (database) |
| Data Reset | Every refresh | Never (unless deleted) |
| Offline Work | Yes | No |
| Validation | Basic | Full |
| Security | None | Full authentication |

---

## Quick Start

1. Mở `public/env-config.js`
2. Set `USE_MOCK_DATA: true`
3. Refresh browser
4. Bắt đầu develop với mock data!

Khi backend ready:
1. Set `USE_MOCK_DATA: false`
2. Update `API_BASE` nếu cần
3. Refresh và enjoy! 🚀
