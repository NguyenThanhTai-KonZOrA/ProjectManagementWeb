import {
    Box,
    Avatar,
    Typography,
    TextField,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    FavoriteBorder as HeartIcon,
    Favorite as HeartFilledIcon,
    ThumbUpAltOutlined as LikeIcon,
    ThumbUpAlt as LikeFilledIcon,
    MoreVert as MoreVertIcon,
    Reply as ReplyIcon,
} from "@mui/icons-material";
import { useState, useRef } from "react";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import { FormatUtcTime } from "../utils/formatUtcTime";
import { useAppData } from "../contexts/AppDataContext";
import { commentService } from "../services/projectManagementService";

interface CommentSectionProps {
    comments: CommentResponse[];
    onAddComment: (description: string, parentCommentId?: number) => Promise<void>;
    onUpdateComment?: (commentId: number, description: string) => Promise<void>;
    onDeleteComment?: (commentId: number) => Promise<void>;
    onReactionToggle?: (commentId: number, reactionType: number) => Promise<void>;
    currentUserId?: number;
}

export default function CommentSection({ 
    comments, 
    onAddComment, 
    onUpdateComment,
    onDeleteComment,
    onReactionToggle,
}: CommentSectionProps) {
    const { members } = useAppData();
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedComment, setSelectedComment] = useState<CommentResponse | null>(null);
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);

    // Build comment tree (root comments are those with parentCommentId = 0 or null)
    const buildCommentTree = (comments: CommentResponse[]): CommentResponse[] => {
        return comments.filter(comment => !comment.parentCommentId || comment.parentCommentId === 0);
    };

    const rootComments = buildCommentTree(comments);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart || 0;
        
        setNewComment(value);
        setCursorPosition(cursorPos);

        // Check if user is typing @mention
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtSymbol !== -1) {
            const searchText = textBeforeCursor.substring(lastAtSymbol + 1);
            if (!searchText.includes(' ')) {
                setMentionSearch(searchText);
                setShowMentions(true);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }
    };

    const handleMentionSelect = (memberName: string) => {
        const textBeforeCursor = newComment.substring(0, cursorPosition);
        const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = newComment.substring(cursorPosition);
        
        const newText = 
            newComment.substring(0, lastAtSymbol) + 
            `@${memberName} ` + 
            textAfterCursor;
        
        setNewComment(newText);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const filteredMembers = members.filter(member =>
        member.employeeName.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    const handleReaction = async (comment: CommentResponse, reactionType: number) => {
        if (onReactionToggle) {
            await onReactionToggle(comment.id, reactionType);
        }
    };

    const hasUserReacted = (comment: CommentResponse, reactionType: number): boolean => {
        return comment.currentUserReaction === reactionType;
    };

    const getReactionCount = (comment: CommentResponse, reactionType: number): number => {
        // ReactionType: Like = 0, Love = 1
        if (reactionType === 0) {
            return comment.likeCount;
        } else if (reactionType === 1) {
            return comment.loveCount || comment.heartCount || 0;
        }
        return 0;
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        await onAddComment(newComment, replyTo || undefined);
        setNewComment("");
        setReplyTo(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, comment: CommentResponse) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const handleEditClick = () => {
        if (selectedComment) {
            setEditingCommentId(selectedComment.id);
            setEditText(selectedComment.description);
        }
        handleMenuClose();
    };

    const handleSaveEdit = async () => {
        if (editingCommentId && onUpdateComment) {
            await onUpdateComment(editingCommentId, editText);
            setEditingCommentId(null);
            setEditText("");
        }
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditText("");
    };

    const handleDeleteClick = () => {
        if (selectedComment) {
            setDeleteCommentId(selectedComment.id);
            setOpenDeleteDialog(true);
        }
        handleMenuClose();
    };

    const handleConfirmDelete = async () => {
        if (deleteCommentId && onDeleteComment) {
            await onDeleteComment(deleteCommentId);
            setOpenDeleteDialog(false);
            setDeleteCommentId(null);
        }
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setDeleteCommentId(null);
    };

    const renderComment = (comment: CommentResponse, depth: number = 0) => {
        const loveCount = getReactionCount(comment, 1); // Love = 1
        const likeCount = getReactionCount(comment, 0); // Like = 0
        const hasLove = hasUserReacted(comment, 1);
        const hasLike = hasUserReacted(comment, 0);
        const isEditing = editingCommentId === comment.id;

        return (
            <Box key={comment.id} sx={{ ml: depth * 4 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.employeeName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Box 
                            sx={{ 
                                bgcolor: "action.hover", 
                                borderRadius: 2, 
                                p: 1.5,
                                position: "relative"
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="body2" fontWeight={600} color="primary">
                                        {comment.employeeName}
                                    </Typography>
                                    {comment.isEdited && (
                                        <Chip 
                                            label="Edited" 
                                            size="small" 
                                            sx={{ height: 16, fontSize: "0.65rem" }} 
                                        />
                                    )}
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuOpen(e, comment)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                {FormatUtcTime.getTimeVietnamAgoUTC(comment.createdAt)}
                                {comment.isEdited && comment.editedAt && (
                                    <span> • Edited {FormatUtcTime.getTimeVietnamAgoUTC(comment.editedAt)}</span>
                                )}
                            </Typography>
                            
                            {isEditing ? (
                                <Box sx={{ mt: 1 }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        size="small"
                                    />
                                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                        <Button size="small" variant="contained" onClick={handleSaveEdit}>
                                            Save
                                        </Button>
                                        <Button size="small" onClick={handleCancelEdit}>
                                            Cancel
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                    {comment.description}
                                </Typography>
                            )}
                        </Box>

                        {/* Reaction buttons and counts */}
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                            <Tooltip title={hasLove ? "Remove love" : "React with love"}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleReaction(comment, 1)}
                                    color={hasLove ? "error" : "default"}
                                >
                                    {hasLove ? <HeartFilledIcon fontSize="small" /> : <HeartIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            {loveCount > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {loveCount}
                                </Typography>
                            )}

                            <Tooltip title={hasLike ? "Remove like" : "React with like"}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleReaction(comment, 0)}
                                    color={hasLike ? "primary" : "default"}
                                >
                                    {hasLike ? <LikeFilledIcon fontSize="small" /> : <LikeIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            {likeCount > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {likeCount}
                                </Typography>
                            )}

                            <Button 
                                size="small" 
                                startIcon={<ReplyIcon fontSize="small" />}
                                onClick={() => setReplyTo(comment.id)}
                                sx={{ ml: 1 }}
                            >
                                Reply
                            </Button>
                        </Box>

                        {/* Show reply box if this comment is being replied to */}
                        {replyTo === comment.id && (
                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24 }}>U</Avatar>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Reply to ${comment.employeeName}...`}
                                    value={newComment}
                                    onChange={handleInputChange}
                                    inputRef={inputRef}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <Button size="small" onClick={handleSubmit} disabled={!newComment.trim()}>
                                    Reply
                                </Button>
                                <Button size="small" onClick={() => { setReplyTo(null); setNewComment(""); }}>
                                    Cancel
                                </Button>
                            </Box>
                        )}

                        {/* Render nested replies */}
                        {comment.replies && comment.replies.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                                {comment.replies.map(reply => renderComment(reply, depth + 1))}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <Box>
            {/* Add Comment */}
            {replyTo === null && (
                <Box sx={{ display: "flex", gap: 2, mb: 3, position: "relative" }}>
                    <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
                    <Box sx={{ flex: 1 }}>
                        <TextField
                            fullWidth
                            placeholder="Add a comment (use @ to mention someone)"
                            value={newComment}
                            onChange={handleInputChange}
                            size="small"
                            inputRef={inputRef}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        
                        {/* Mention dropdown */}
                        {showMentions && filteredMembers.length > 0 && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: "100%",
                                    left: 48,
                                    right: 0,
                                    mt: 0.5,
                                    bgcolor: "background.paper",
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 1,
                                    maxHeight: 200,
                                    overflow: "auto",
                                    zIndex: 1000,
                                    boxShadow: 2,
                                }}
                            >
                                {filteredMembers.slice(0, 5).map((member) => (
                                    <Box
                                        key={member.id}
                                        sx={{
                                            p: 1,
                                            cursor: "pointer",
                                            "&:hover": { bgcolor: "action.hover" },
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                        onClick={() => handleMentionSelect(member.employeeName)}
                                    >
                                        <Avatar sx={{ width: 24, height: 24 }}>
                                            {member.employeeName.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2">{member.employeeName}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                    <Button 
                        variant="contained" 
                        onClick={handleSubmit} 
                        disabled={!newComment.trim()}
                    >
                        Comment
                    </Button>
                </Box>
            )}

            {/* Comments List */}
            {rootComments.map((comment) => renderComment(comment))}

            {comments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    No comments yet
                </Typography>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>Edit</MenuItem>
                <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCancelDelete}>
                <DialogTitle>Delete Comment</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this comment? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
