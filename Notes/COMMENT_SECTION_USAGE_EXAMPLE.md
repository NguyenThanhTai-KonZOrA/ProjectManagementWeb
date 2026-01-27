# CommentSection Component - Usage Guide

## Overview
CommentSection đã được cập nhật để sử dụng API mới với các tính năng:
- Hiển thị comments với nested replies
- Edit và delete comments
- React với Love (❤️) và Like (👍)
- Mention users với @
- Hiển thị edited status

## Props Interface

```typescript
interface CommentSectionProps {
    comments: CommentResponse[];
    onAddComment: (description: string, parentCommentId?: number) => Promise<void>;
    onUpdateComment?: (commentId: number, description: string) => Promise<void>;
    onDeleteComment?: (commentId: number) => Promise<void>;
    onReactionToggle?: (commentId: number, reactionType: number) => Promise<void>;
    currentUserId?: number;
}
```

## Reaction Types
- **Like = 0**
- **Love = 1**

## Usage Example

### In Project Details Page

```typescript
import CommentSection from "../components/CommentSection";
import { commentService } from "../services/projectManagementService";

export default function AdminProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info";
    }>({ open: false, message: "", severity: "info" });

    const loadComments = async () => {
        if (!id) return;
        try {
            const commentsData = await commentService.getAllCommentsOfProject(parseInt(id));
            setComments(commentsData);
        } catch (error: any) {
            console.error("Error loading comments:", error);
        }
    };

    const handleAddComment = async (description: string, parentCommentId?: number) => {
        if (!id) return;
        try {
            await commentService.createComment({
                projectId: parseInt(id),
                description,
                parentCommentId,
            });
            setSnackbar({
                open: true,
                message: "Comment added successfully",
                severity: "success",
            });
            await loadComments();
        } catch (error: any) {
            console.error("Error adding comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to add comment",
                severity: "error",
            });
        }
    };

    const handleUpdateComment = async (commentId: number, description: string) => {
        if (!id) return;
        try {
            await commentService.updateComment(commentId, {
                projectId: parseInt(id),
                description,
            });
            setSnackbar({
                open: true,
                message: "Comment updated successfully",
                severity: "success",
            });
            await loadComments();
        } catch (error: any) {
            console.error("Error updating comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to update comment",
                severity: "error",
            });
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await commentService.deleteComment(commentId);
            setSnackbar({
                open: true,
                message: "Comment deleted successfully",
                severity: "success",
            });
            await loadComments();
        } catch (error: any) {
            console.error("Error deleting comment:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to delete comment",
                severity: "error",
            });
        }
    };

    const handleReactionToggle = async (commentId: number, reactionType: number) => {
        try {
            // Check if user already reacted with this type
            const comment = comments.find(c => c.id === commentId);
            if (comment && comment.currentUserReaction === reactionType) {
                // Remove reaction
                await commentService.deleteReaction(commentId);
            } else {
                // Add or change reaction
                await commentService.createReaction({
                    commentId,
                    reactionType,
                });
            }
            await loadComments();
        } catch (error: any) {
            console.error("Error toggling reaction:", error);
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || "Failed to react",
                severity: "error",
            });
        }
    };

    return (
        <AdminLayout>
            {/* ... other content ... */}
            
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Comment
                    </Typography>

                    <CommentSection 
                        comments={comments}
                        onAddComment={handleAddComment}
                        onUpdateComment={handleUpdateComment}
                        onDeleteComment={handleDeleteComment}
                        onReactionToggle={handleReactionToggle}
                        currentUserId={currentUser?.id}
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
```

### In Task Details Page

```typescript
const handleAddComment = async (description: string, parentCommentId?: number) => {
    if (!id) return;
    try {
        await commentService.createComment({
            taskId: parseInt(id), // Use taskId instead of projectId
            description,
            parentCommentId,
        });
        setSnackbar({
            open: true,
            message: "Comment added successfully",
            severity: "success",
        });
        await loadComments();
    } catch (error: any) {
        console.error("Error adding comment:", error);
        setSnackbar({
            open: true,
            message: error?.response?.data?.message || "Failed to add comment",
            severity: "error",
        });
    }
};
```

## API Response Structure

```typescript
interface CommentResponse {
    id: number;
    projectId?: number;
    taskId?: number;
    employeeId: number;
    employeeName: string;
    parentCommentId: number;
    description: string;
    isEdited: boolean;
    editedAt: string;
    likeCount: number;
    loveCount: number;
    heartCount: number;
    totalReactions: number;
    currentUserReaction: number; // Like = 0, Love = 1, or -1 if no reaction
    replies: CommentResponse[]; // Nested replies
    reactions: CommentReactionResponse[];
    createdAt: string;
    updatedAt: string;
}
```

## Features

### 1. **Nested Replies**
- Comments với `parentCommentId === 0` hoặc `null` là root comments
- `replies` array chứa các reply comments
- UI hiển thị nested với indentation

### 2. **Edit Comment**
- Click "..." menu → "Edit"
- Inline editing với Save/Cancel buttons
- Hiển thị "Edited" badge nếu `isEdited === true`

### 3. **Delete Comment**
- Click "..." menu → "Delete"
- Confirmation dialog trước khi delete
- Call API `deleteComment(commentId)`

### 4. **Reactions**
- Love (❤️) = reactionType: 1
- Like (👍) = reactionType: 0
- Toggle reaction bằng cách click icon
- Hiển thị count và highlight nếu user đã react
- `currentUserReaction` cho biết user đã react type nào

### 5. **Mentions**
- Type @ để mở mention dropdown
- Select user từ dropdown
- Auto-complete user name vào comment

## Notes

- Ensure `loadComments()` is called after create/update/delete operations
- Handle errors properly with snackbar notifications
- `currentUserId` prop is optional but recommended for reaction features
- Use `projectId` for project comments, `taskId` for task comments
