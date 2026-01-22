# Hướng Dẫn Sử Dụng Các Tính Năng Mới

## Tổng Quan
Các tính năng mới đã được thêm vào Project Management System bao gồm:
1. Hiển thị thông tin GitHub trên Project Details
2. Thêm member vào project
3. Upload nhiều file attachments cho project và task
4. Navigation đến sub-task details
5. Hệ thống comment với reply, @mention và reactions

## Chi Tiết Các Tính Năng

### 1. AdminProjectDetailsPage - GitHub Information

#### Mô tả
Hiển thị thông tin GitHub Repository Name và GitHub URL với khả năng copy.

#### Vị trí
Trong phần **Detail** (cột bên phải), hiển thị trước **Project Type**.

#### Chức năng
- Hiển thị `gitHubRepositoryName` và `gitHubUrl` từ API `getProjectById`
- Có nút copy để copy thông tin vào clipboard
- Click vào GitHub URL sẽ mở tab mới

#### Code Changes
- Sử dụng `ProjectDetailsResponse` thay vì `ProjectResponse` để có thêm fields GitHub
- Thêm icon `ContentCopyIcon` và handler `handleCopyToClipboard`

---

### 2. AdminProjectDetailsPage - Add Member

#### Mô tả
Cho phép thêm member vào project từ danh sách members trong AppDataContext.

#### Vị trí
Trong phần **Members** (cột bên phải), có nút **Add** bên cạnh label "Members".

#### Chức năng
- Click nút **Add** sẽ mở dialog chọn member
- Dropdown hiển thị danh sách members chưa có trong project (lọc từ `members` trong `AppDataContext`)
- Chọn member và click **Add Member** sẽ gọi API `addProjectMembers`
- Tự động reload project details và activity logs sau khi thêm thành công

#### API Called
```typescript
await projectManagementService.addProjectMembers({
    projectId: parseInt(id),
    memberIds: [selectedMemberId],
});
```

---

### 3. AdminProjectDetailsPage - Upload Multiple Attachments

#### Mô tả
Upload nhiều files cùng lúc vào project.

#### Vị trí
Trong phần **Attachments** (cột trái, sau Description).

#### Chức năng
- Click vào vùng "Choose files (multiple files supported)" để chọn nhiều files
- Hiển thị danh sách files đã chọn dưới dạng Chip, có thể xóa từng file
- Click nút **Upload Files** để upload tất cả files đã chọn
- Gọi API `uploadAttachmentsProject` với FormData

#### API Called
```typescript
const formData = new FormData();
selectedFiles.forEach((file) => {
    formData.append("attachments", file);
});
await projectManagementService.uploadAttachmentsProject(parseInt(id), formData);
```

---

### 4. AdminTaskDetailsPage - Upload Multiple Attachments

#### Mô tả
Upload nhiều files cùng lúc vào task (tương tự như project).

#### Vị trí
Trong phần **Attachments** (cột trái).

#### Chức năng
- Giống như upload attachments trong Project Details
- Gọi API `uploadAttachmentsTask`

#### API Called
```typescript
const formData = new FormData();
selectedFiles.forEach((file) => {
    formData.append("attachments", file);
});
await taskManagementService.uploadAttachmentsTask(parseInt(id), formData);
```

---

### 5. AdminTaskDetailsPage - Sub-Task Navigation

#### Mô tả
Click vào sub-task sẽ chuyển đến trang task detail của sub-task đó.

#### Vị trí
Trong phần **Sub-Task** (cột trái).

#### Chức năng
- Mỗi sub-task item có style hover và cursor pointer
- Click vào sub-task sẽ navigate đến `/admin/project-management/task-detail/{subTaskId}`
- Click vào checkbox vẫn hoạt động bình thường (không navigate)

#### Code
```typescript
const handleSubTaskClick = (subTaskId: number) => {
    navigate(`/admin/project-management/task-detail/${subTaskId}`);
};
```

---

### 6. Comment System với Reply, @Mention và Reactions

#### Component Mới
`CommentSection.tsx` - Component tái sử dụng cho cả Project và Task.

#### Các Tính Năng

##### 6.1. Reply to Comments
- Click nút **Reply** dưới mỗi comment
- Hiển thị input box để reply trực tiếp
- Submit reply bằng nút **Reply** hoặc Enter
- Cancel để hủy reply

##### 6.2. @Mention Members
- Gõ `@` trong comment input
- Hiển thị dropdown danh sách members (tối đa 5)
- Tìm kiếm theo tên member khi gõ tiếp
- Click vào member để chọn, tự động chèn `@{memberName}` vào comment

##### 6.3. Reactions
- Hai loại reaction: **Heart** (❤️) và **Like** (👍)
- Click icon để thêm/bỏ reaction
- Hiển thị số lượng reaction bên cạnh icon
- Icon filled khi user đã react, outline khi chưa

##### 6.4. Context Menu
- Click icon **⋮** (MoreVert) trên mỗi comment
- Menu options: Edit, Delete, Report (placeholder, cần implement logic)

#### Props
```typescript
interface CommentSectionProps {
    comments: CommentResponse[];
    onAddComment: (description: string, parentCommentId?: number) => Promise<void>;
    currentUserId?: number;
}
```

#### Sử dụng trong AdminProjectDetailsPage
```typescript
<CommentSection
    comments={comments}
    onAddComment={handleCommentSubmit}
    currentUserId={1}
/>
```

#### Sử dụng trong AdminTaskDetailsPage
```typescript
<CommentSection
    comments={comments}
    onAddComment={handleCommentSubmit}
    currentUserId={1}
/>
```

---

## API Requirements

### Đã Có (Existing APIs)
1. `projectManagementService.getProjectById(id)` - Returns `ProjectDetailsResponse` with GitHub info
2. `projectManagementService.addProjectMembers(request)` - Add members to project
3. `projectManagementService.uploadAttachmentsProject(id, formData)` - Upload project attachments
4. `taskManagementService.uploadAttachmentsTask(id, formData)` - Upload task attachments
5. `commentService.createComment(request)` - Create comment (supports `parentCommentId` for replies)

### Cần Implement (Backend)
1. **Reactions API** - Hiện tại reactions chỉ lưu ở client-side (state). Cần API để:
   - POST `/api/comment/{commentId}/react` - Add/remove reaction
   - GET `/api/comment/{commentId}/reactions` - Get all reactions

2. **Edit/Delete Comment API** - Hiện tại menu chỉ là placeholder:
   - PUT `/api/comment/{commentId}` - Edit comment
   - DELETE `/api/comment/{commentId}` - Delete comment

3. **Comment Mentions** - Backend cần xử lý @mentions:
   - Parse mentions từ description
   - Tạo notifications cho mentioned users

---

## TypeScript Types Updates

### ProjectType.ts
- Đã có `ProjectDetailsResponse` extends `ProjectResponse` với:
  - `gitHubRepositoryName: string`
  - `gitHubUrl: string`

### CommentType.ts
- Cần thêm (nếu implement replies từ backend):
```typescript
export interface CommentResponse {
    id: number;
    projectId: number;
    taskId: number;
    memberId: number;
    memberName: string;
    description: string;
    parentCommentId?: number; // For replies
    createdAt: string;
    updatedAt: string;
}
```

---

## UI/UX Enhancements

### GitHub Info
- Truncate long URLs with ellipsis (maxWidth: 200px)
- Blue underlined link style
- Copy confirmation via Snackbar

### Add Member
- Filter out members already in project
- Avatar preview in dropdown
- Auto-close dialog after success

### File Upload
- Drag and drop zone với dashed border
- Chip display cho selected files
- Delete individual files before upload
- Upload progress feedback via Snackbar

### Sub-Task
- Hover effect (bgcolor: action.hover)
- Cursor pointer
- Checkbox không trigger navigation

### Comments
- Nested replies với indentation (ml: depth * 4)
- @mention dropdown với avatar
- Reaction buttons với count
- Time ago display
- Reply box inline với comment

---

## Testing Checklist

### AdminProjectDetailsPage
- [ ] GitHub info displays correctly
- [ ] Copy GitHub name works
- [ ] Copy GitHub URL works
- [ ] Click GitHub URL opens new tab
- [ ] Add member dialog opens
- [ ] Add member dropdown filters correctly
- [ ] Add member API call successful
- [ ] File upload input accepts multiple files
- [ ] Selected files display as chips
- [ ] Delete chip removes file
- [ ] Upload files API call successful
- [ ] Comments with replies work
- [ ] @mention dropdown appears
- [ ] @mention inserts correctly
- [ ] Reactions toggle correctly

### AdminTaskDetailsPage
- [ ] File upload works same as project
- [ ] Sub-task click navigates correctly
- [ ] Checkbox click doesn't navigate
- [ ] Comments work same as project

### CommentSection
- [ ] Add comment works
- [ ] Reply button shows reply input
- [ ] Reply submit works
- [ ] Reply cancel works
- [ ] @mention search filters
- [ ] @mention select inserts text
- [ ] Heart reaction toggles
- [ ] Like reaction toggles
- [ ] Reaction count updates
- [ ] Menu opens on click
- [ ] Nested replies display correctly

---

## Future Improvements

1. **Real-time Updates** - WebSocket cho comments và reactions
2. **Rich Text Editor** - Markdown support, formatting
3. **File Preview** - Preview images/documents trước khi upload
4. **Drag & Drop** - Direct drag and drop files
5. **Emoji Reactions** - Thêm nhiều emoji reactions
6. **Notification System** - Notify khi được @mention
7. **Comment Threads** - Collapse/expand reply threads
8. **Edit History** - Show edit history cho comments

---

## Troubleshooting

### TypeScript Errors
- Ensure `ProjectDetailsResponse` is imported correctly
- Check API returns correct type
- Restart TypeScript server if needed

### API Errors
- Check network tab for request/response
- Verify FormData format for file uploads
- Check authentication token

### UI Issues
- Clear browser cache
- Check Material-UI version compatibility
- Verify theme configuration

---

## Notes
- `currentUserId` hiện tại được hardcode là `1` - cần lấy từ auth context
- Reactions chưa persist vào database
- Comment edit/delete chưa được implement
- Cần test với real API endpoints
