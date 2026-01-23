export interface ProjectAttachmentsResponse {
    id: number;
    projectId: number;
    fileName: string;
    fileExtension: string;
    fileSize: number;
    fileUrl: string;
    createdAt: string;
    createdBy: string;
}