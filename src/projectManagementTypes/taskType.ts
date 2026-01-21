import type { ProjectMemberResponse } from "./projectMember";

export interface CreateTaskRequest {
    projectId: number;
    taskType: string;
    taskTitle: string;
    description: string;
    assignees: number[];
    attachments: File[];
    dueDate: string;
    startDate: string;
    priority: number;
}


export interface TaskResponse {
    id: number;
    projectId: number;
    taskType: string;
    taskTitle: string;
    taskCode: string;
    description: string;
    assignees: ProjectMemberResponse[];
    attachments: File[];
    dueDate: string;
    startDate: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
}

export interface ActionTaskStatusRequest {
    taskId: number;
    actionType: string; // Approve / Reject
    reason: string;
}

export interface CreateOrUpdateSubTaskRequest {
    subTaskId?: number;
    projectId: number;
    parentId: number;
    taskType: string;
    taskTitle: string;
    description: string;
    assignees: number[];
    attachments: File[];
    dueDate: string;
    startDate: string;
    priority: number;
}

export interface ChangeTaskStatusRequest {
    taskId: number;
    newStatusId: string;
}

export interface ChangePriorityRequest {
    taskId: number;
    newPriorityId: number;
}