export interface CreateCommentRequest {
    projectId?: number;
    taskId?: number;
    parentCommentId?: number;
    description: string;
}

export interface CommentResponse {
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
    currentUserReaction: number; // Like = 0, Love = 1
    replies: CommentResponse[];
    reactions: CommentReactionResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface CommentReactionResponse {
    id: number;
    employeeId: number;
    employeeName: string;
    reactionType: number; // Like = 0, Love = 1
    createdAt: string;
}

export interface CommentReactionRequest {
    commentId: number;
    reactionType: number; // Like = 0, Love = 1
}