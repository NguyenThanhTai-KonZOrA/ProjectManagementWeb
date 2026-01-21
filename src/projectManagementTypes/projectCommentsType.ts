export interface CreateCommentRequest {
    projectId?: number;
    taskId?: number;
    description: string;
}

export interface CommentResponse {
    id: number;
    projectId: number;
    taskId: number;
    memberId: number;
    memberName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}