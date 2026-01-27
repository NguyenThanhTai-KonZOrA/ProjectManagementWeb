import type { ProjectMemberResponse } from "./projectMember";
import type { TaskAttachmentsResponse } from "./taskAttachmentsType";

export const TaskType = [
    { value: 1, label: "Development" },
    { value: 2, label: "Bug" },
    { value: 3, label: "Feature" },
    { value: 4, label: "Testing" },
    { value: 5, label: "Documentation" },
    { value: 6, label: "Task" },
]

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
    taskId: number;
    projectId: number;
    projectType: number;
    projectTypeName: string;
    taskType: string;
    taskTitle: string;
    taskCode: string;
    description: string;
    assignees: ProjectMemberResponse[];
    attachments: TaskAttachmentsResponse[];
    dueDate: string;
    startDate: string;
    priority: number;
    priorityName: string;
    priorityColor: string;
    createdAt: string;
    updatedAt: string;
    statusName: string;
    statusColor: string;
    statusId: number;
}

export interface TaskDetailResponse {
    taskId: number;
    projectId: number;
    taskType: string;
    taskTitle: string;
    taskCode: string;
    description: string;
    assignees: ProjectMemberResponse[];
    attachments: TaskAttachmentsResponse[];
    dueDate: string;
    startDate: string;
    priority: number;
    priorityName: string;
    statusName: string;
    statusColor: string;
    statusId: number;
    priorityColor: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    subTasks: SubTaskResponse[];
    bugTasks: BugTaskResponse[];
    parentTaskId: number;
    isApproved?: boolean;
    isRejected?: boolean;
}

export interface SubTaskResponse {
    subTaskId: number;
    projectId: number;
    parentId: number;
    taskType: string;
    taskTitle: string;
    taskCode: string;
    description: string;
    assignees: ProjectMemberResponse[];
    attachments: TaskAttachmentsResponse[];
    dueDate: string;
    startDate: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    assignee: string;
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

export interface CreateOrUpdateBugTaskRequest {
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

export interface UploadAttachmentsTaskRequest {
    taskId: number;
    attachments: File[];
}

export interface BugTaskResponse {
    subTaskId: number;
    projectId: number;
    parentId: number;
    taskType: string;
    taskTitle: string;
    taskCode: string;
    description: string;
    assignees: ProjectMemberResponse[];
    attachments: TaskAttachmentsResponse[];
    dueDate: string;
    startDate: string;
    priority: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    assignee: string;
}