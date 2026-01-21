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
    projectCategory: string;
    description: string;
}
