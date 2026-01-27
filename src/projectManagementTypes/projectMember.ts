import type { NotificationSummaryResponse } from "./projectNotificationType";

export interface ProjectMemberResponse {
    memberId: number;
    memberName: string;
    memberImage: string;
}

export interface MemberByEmployeeResponse {
    id: number;
    employeeCode: string;
    employeeName: string;
    windowAccount: string;
}

export interface SummaryProfileEmployeeResponse {
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    employeePosition: string;
    employeeRoles: string[];
    projects: ProjectProfileData[];
    tasks: TaskProfileData[];
    notifications: NotificationSummaryResponse;
}

export interface ProjectProfileData {
    projectId: number;
    projectName: string;
    projectDescription: string;
    statusName: string;
    priorityName: string;
    startDate: string;
    endDate: string;
    totalTasks: number;
    completedTasks: number;
}

export interface TaskProfileData {
    taskId: number;
    taskCode: string;
    taskTitle: string;
    statusName: string;
    statusColor: string;
    priorityName: string;
    priorityColor: string;
    dueDate: string;
    startDate: string;
    isOverDue: boolean;
    daysUntilDue: number;
    createdAt: string;
    updatedAt: string;
}
