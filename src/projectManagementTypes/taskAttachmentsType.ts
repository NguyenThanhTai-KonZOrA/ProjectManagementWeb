export interface TaskAttachmentsResponse {
    id: number;
    taskId: number;
    fileName: string;
    fileExtension: string;
    fileSize: number;
    fileUrl: string;
    createdAt: string;
    createdBy: string;
}