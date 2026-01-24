import type { ProjectAttachmentsResponse } from "./projectAttachmentsResponse";
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
    projectCategoryId: number;
    projectCategoryName: string;
    description: string;
    statusId: number;
    statusName: string;
    startDate: string;
    endDate: string;
}

export interface ProjectDetailsResponse {
    id: string;
    projectName: string;
    projectCode: string;
    priorityId: number;
    priorityName: string;
    comments: string[];
    projectMembers: ProjectMemberResponse[];
    attachments: ProjectAttachmentsResponse[];
    totalTasks: number;
    totalTaskCompleted: number;
    projectTimeLine: string;
    projectType: number;
    projectTypeName: string;
    projectCategoryId: number;
    projectCategoryName: string;
    description: string;
    statusId: number;
    statusName: string;
    gitHubRepositoryName: string;
    gitHubUrl: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
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