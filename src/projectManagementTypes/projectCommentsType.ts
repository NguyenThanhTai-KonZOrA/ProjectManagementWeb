export interface CreateCommentRequest {
    projectId?: number;
    taskId?: number;
    content: string;
}

export interface CommentResponse {
    id: number;
    projectId: number;
    taskId: number;
    memberId: number;
    memberName: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}