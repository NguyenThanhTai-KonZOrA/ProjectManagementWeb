# 🚀 Quick Start - Mock Data Mode

## Bật Mock Data trong 3 bước

### Bước 1: Enable Mock Data
Mở file `public/env-config.js` và sửa:
```javascript
USE_MOCK_DATA: true  // Thay đổi dòng này
```

### Bước 2: Refresh Browser
- Nhấn `Ctrl + Shift + R` (hard refresh)
- Hoặc `F5` để refresh trang

### Bước 3: Verify
Bạn sẽ thấy:
- ✅ Chip màu vàng "Mock Data Mode" ở góc phải trên
- ✅ 6 projects hiển thị trong AdminProjectsPage
- ✅ Dashboard statistics hiển thị đầy đủ

---

## 🎯 Test các tính năng

### 1. View Projects Page
- URL: `/projects` hoặc navigate từ sidebar
- Có 6 projects mẫu
- Filter theo status: All / In Progress / Completed / Pending
- Filter theo category: Gaming / Non-gaming

### 2. Create New Project
1. Click button "Create project"
2. Điền form:
   - Project Name: "Test Project"
   - Project Type: Gaming hoặc Non-gaming
   - Category: Chọn từ dropdown
   - Priority: Low/Medium/High/Critical
   - Dates: Chọn start và end date
   - Members: Chọn team members
   - Description: Mô tả ngắn
3. Click "Create"
4. ✅ Project mới sẽ xuất hiện trong danh sách

### 3. Edit Project
1. Click icon Edit (✏️) trên project card
2. Sửa thông tin
3. Click "Update"
4. ✅ Thay đổi sẽ được lưu (trong memory)

### 4. Delete Project
1. Click icon Delete (🗑️) trên project card
2. Confirm deletion
3. ✅ Project sẽ bị xóa khỏi danh sách

### 5. View Dashboard
- URL: `/dashboard` hoặc `/project-dashboard`
- Xem statistics:
  - Total Projects
  - Completed Tasks
  - Pending Tasks
  - Issues
- Xem Timeline data
- Xem Recent Activities

---

## 📊 Mock Data Chi Tiết

### Projects có sẵn:
1. **Patron Responsible Gaming Alert** - Gaming, High, 30% done
2. **Task Management System** - Non-gaming, Medium, 100% done
3. **Ho Tram Rewards Non Gaming** - Gaming, Critical, 20% done
4. **Patron Responsible Gaming Alert Mobile** - Non-gaming, Medium, 20% done
5. **Task Management System v2** - Non-gaming, Medium, 0% done
6. **Ho Tram Rewards Gaming Edition** - Gaming, High, 20% done

### Team Members:
- John Doe, Jane Smith, Mike Johnson, Sarah Williams
- David Brown, Emily Davis, Chris Wilson, Lisa Anderson
- Tom Martin, Amy Garcia

---

## ⚠️ Lưu ý quan trọng

### Data Persistence
- ❌ Data chỉ lưu trong **memory** (RAM)
- ❌ **Refresh page sẽ reset** về dữ liệu mẫu
- ✅ Tất cả thay đổi chỉ temporary

### Để giữ data sau refresh:
Có thể implement localStorage (nâng cao):
```typescript
// TODO: Implement localStorage persistence
localStorage.setItem('projects', JSON.stringify(projects));
```

---

## 🔄 Chuyển sang Real API

### Khi backend ready:

1. **Disable Mock Data**
   ```javascript
   // public/env-config.js
   USE_MOCK_DATA: false
   ```

2. **Verify API URL**
   ```javascript
   API_BASE: 'http://your-backend-url:port'
   ```

3. **Refresh Browser**
   - Chip "Mock Data Mode" sẽ biến mất
   - App sẽ call real API endpoints

4. **Test với Real Data**
   - Create/Edit/Delete sẽ persist trong database
   - Data từ backend thật
   - Authentication required

---

## 🐛 Troubleshooting

### Issue: Không thấy projects
**Solution:**
1. Check console for errors
2. Verify `USE_MOCK_DATA: true` in env-config.js
3. Hard refresh (Ctrl + Shift + R)

### Issue: Chip "Mock Data Mode" không xuất hiện
**Solution:**
1. Check `USE_MOCK_DATA: true` in env-config.js
2. Refresh browser
3. Check browser console

### Issue: Create project không work
**Solution:**
1. Fill all required fields
2. Check console for validation errors
3. Refresh và thử lại

### Issue: Data bị reset sau refresh
**Solution:**
- Đây là behavior bình thường với mock data
- Data lưu trong memory, không persist
- Muốn persist → implement localStorage

---

## 📱 Demo Workflow

### Scenario 1: Create Gaming Project
```
1. Navigate to /projects
2. Click "Create project"
3. Fill form:
   - Name: "New Gaming Feature"
   - Type: Gaming
   - Category: web-application
   - Priority: High
   - Start Date: 2026-01-20
   - End Date: 2026-02-20
   - Members: Select 4 members
   - Description: "Exciting new feature"
4. Click Create
5. ✅ See new project in grid
```

### Scenario 2: Filter Projects
```
1. Navigate to /projects
2. Click "In Progress" filter
3. ✅ See only in-progress projects
4. Click "Gaming" category filter
5. ✅ See only Gaming projects
6. Click "All" to reset
```

### Scenario 3: View Dashboard
```
1. Navigate to /dashboard
2. ✅ See 6 total projects
3. ✅ See completed/pending tasks
4. ✅ See timeline data
5. ✅ See recent activities
```

---

## 🎨 UI Features to Test

### Project Cards
- ✅ Project icon và name
- ✅ Priority badge với màu sắc (Critical/High/Medium/Low)
- ✅ Category và Type badges
- ✅ Team member avatars
- ✅ Progress bar với percentage
- ✅ Days left indicator
- ✅ Edit và Delete buttons

### Dashboard
- ✅ 4 statistic cards với icons
- ✅ Timeline list với dates
- ✅ Task distribution bars
- ✅ Recent activities với timestamps

### Filters
- ✅ Status toggle buttons
- ✅ Category toggle buttons
- ✅ Responsive grid layout

---

## 💡 Tips

1. **Fast Testing**: Dùng mock data để test UI nhanh
2. **Offline Work**: Không cần internet hoặc VPN
3. **Consistent Data**: Data luôn giống nhau mỗi lần refresh
4. **Easy Reset**: Chỉ cần refresh để reset về ban đầu
5. **Safe Testing**: Không làm ảnh hưởng database thật

---

## 📚 Next Steps

1. ✅ Test tất cả CRUD operations
2. ✅ Test filters và sorting
3. ✅ Test responsive design (mobile/tablet/desktop)
4. ✅ Customize mock data nếu cần
5. ✅ Chuyển sang real API khi backend ready

---

Enjoy developing! 🎉

Có câu hỏi? Check:
- `Notes/MOCK_DATA_GUIDE.md` - Chi tiết guide
- `Notes/MOCK_DATA_IMPLEMENTATION.md` - Technical details
- Console logs - Debug information
