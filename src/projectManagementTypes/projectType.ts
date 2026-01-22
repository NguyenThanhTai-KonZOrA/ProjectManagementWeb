import type { ProjectMemberResponse } from "./projectMember";

export interface CreateProjectRequest {
    projectName: string;
    projectType: number;
    startDate: string;
    endDate: string;
    projectMembers: number[];
    priority: number;
    projectCategory: string;
    description: string;
}

export interface UpdateProjectRequest {
    projectId: number;
    projectName: string;
    projectType: number;
    startDate: string;
    endDate: string;
    projectMembers: number[];
    priority: number;
    projectCategory: string;
    description: string;
}

export interface ProjectResponse {
    id: string;
    projectName: string;
    projectCode: string;
    priority: number;
    comments: string[];
    projectMembers: ProjectMemberResponse[];
    totalTasks: number;
    totalTaskCompleted: number;
    projectTimeLine: string;
    projectType: number;
    projectTypeName: string;
    projectCategory: string;
    description: string;
    statusId: number;
    statusName: string;
}

export interface ProjectDetailsResponse {
    id: string;
    projectName: string;
    projectCode: string;
    priority: number;
    comments: string[];
    projectMembers: ProjectMemberResponse[];
    totalTasks: number;
    totalTaskCompleted: number;
    projectTimeLine: string;
    projectType: number;
    projectTypeName: string;
    projectCategory: string;
    description: string;
    statusId: number;
    statusName: string;
    gitHubRepositoryName: string;
    gitHubUrl: string;
}

export interface ProjectSummaryResponse {
    id: string;
    projectName: string;
    projectCode: string;
}

export interface ChangeProjectStatusRequest {
    projectId: number;
    newStatusId: string;
}

export interface ChangeProjectPriorityRequest {
    projectId: number;
    newPriorityId: number;
}

export interface UploadAttachmentsProjectRequest {
    projectId: number;
    attachments: File[];
}

export interface AddProjectMembersRequest {
    projectId: number;
    memberIds: number[];
}