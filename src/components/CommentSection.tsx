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
} from "@mui/material";
import {
    FavoriteBorder as HeartIcon,
    Favorite as HeartFilledIcon,
    ThumbUpAltOutlined as LikeIcon,
    ThumbUpAlt as LikeFilledIcon,
    MoreVert as MoreVertIcon,
    Reply as ReplyIcon,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import type { CommentResponse } from "../projectManagementTypes/projectCommentsType";
import { FormatUtcTime } from "../utils/formatUtcTime";
import { useAppData } from "../contexts/AppDataContext";

interface Reaction {
    type: "heart" | "like";
    memberIds: number[];
}

interface CommentWithReactions extends CommentResponse {
    reactions?: Reaction[];
    replies?: CommentWithReactions[];
}

interface CommentSectionProps {
    comments: CommentResponse[];
    onAddComment: (description: string, parentCommentId?: number) => Promise<void>;
    currentUserId?: number;
}

export default function CommentSection({ comments, onAddComment, currentUserId }: CommentSectionProps) {
    const { members } = useAppData();
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

    // State for reactions (in real app, this should come from API)
    const [commentReactions, setCommentReactions] = useState<Map<number, Reaction[]>>(new Map());

    // Convert flat comments to nested structure
    const buildCommentTree = (comments: CommentResponse[]): CommentWithReactions[] => {
        const commentMap = new Map<number, CommentWithReactions>();
        const rootComments: CommentWithReactions[] = [];

        // Initialize all comments
        comments.forEach(comment => {
            commentMap.set(comment.id, {
                ...comment,
                reactions: commentReactions.get(comment.id) || [],
                replies: []
            });
        });

        // Build tree structure
        comments.forEach(comment => {
            const commentNode = commentMap.get(comment.id);
            if (!commentNode) return;

            // For now, we'll treat all as root comments since parentCommentId isn't in the type
            // In a real implementation, you'd use parentCommentId from the API
            rootComments.push(commentNode);
        });

        return rootComments;
    };

    const nestedComments = buildCommentTree(comments);

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

    const handleReaction = (commentId: number, reactionType: "heart" | "like") => {
        setCommentReactions(prev => {
            const newMap = new Map(prev);
            const reactions = newMap.get(commentId) || [];
            
            const existingReaction = reactions.find(r => r.type === reactionType);
            
            if (existingReaction) {
                const userIndex = existingReaction.memberIds.indexOf(currentUserId || 0);
                if (userIndex > -1) {
                    // Remove reaction
                    existingReaction.memberIds.splice(userIndex, 1);
                    if (existingReaction.memberIds.length === 0) {
                        newMap.set(commentId, reactions.filter(r => r.type !== reactionType));
                    }
                } else {
                    // Add reaction
                    existingReaction.memberIds.push(currentUserId || 0);
                }
            } else {
                // Create new reaction
                reactions.push({
                    type: reactionType,
                    memberIds: [currentUserId || 0]
                });
                newMap.set(commentId, reactions);
            }
            
            return newMap;
        });
    };

    const hasUserReacted = (commentId: number, reactionType: "heart" | "like"): boolean => {
        const reactions = commentReactions.get(commentId) || [];
        const reaction = reactions.find(r => r.type === reactionType);
        return reaction?.memberIds.includes(currentUserId || 0) || false;
    };

    const getReactionCount = (commentId: number, reactionType: "heart" | "like"): number => {
        const reactions = commentReactions.get(commentId) || [];
        const reaction = reactions.find(r => r.type === reactionType);
        return reaction?.memberIds.length || 0;
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        await onAddComment(newComment, replyTo || undefined);
        setNewComment("");
        setReplyTo(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
        setAnchorEl(event.currentTarget);
        setSelectedCommentId(commentId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedCommentId(null);
    };

    const renderComment = (comment: CommentWithReactions, depth: number = 0) => {
        const heartCount = getReactionCount(comment.id, "heart");
        const likeCount = getReactionCount(comment.id, "like");
        const hasHeart = hasUserReacted(comment.id, "heart");
        const hasLike = hasUserReacted(comment.id, "like");

        return (
            <Box key={comment.id} sx={{ ml: depth * 4 }}>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.memberName.charAt(0).toUpperCase()}
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
                                <Typography variant="body2" fontWeight={600} color="primary">
                                    {comment.memberName}
                                </Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuOpen(e, comment.id)}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                {FormatUtcTime.getTimeVietnamAgoUTC(comment.createdAt)}
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                {comment.description}
                            </Typography>
                        </Box>

                        {/* Reaction buttons and counts */}
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                            <Tooltip title={hasHeart ? "Remove heart" : "React with heart"}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleReaction(comment.id, "heart")}
                                    color={hasHeart ? "error" : "default"}
                                >
                                    {hasHeart ? <HeartFilledIcon fontSize="small" /> : <HeartIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            {heartCount > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    {heartCount}
                                </Typography>
                            )}

                            <Tooltip title={hasLike ? "Remove like" : "React with like"}>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleReaction(comment.id, "like")}
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
                                    placeholder={`Reply to ${comment.memberName}...`}
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
                                <Button size="small" onClick={handleSubmit}>
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
            {nestedComments.map((comment) => renderComment(comment))}

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
                <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
                <MenuItem onClick={handleMenuClose}>Report</MenuItem>
            </Menu>
        </Box>
    );
}
