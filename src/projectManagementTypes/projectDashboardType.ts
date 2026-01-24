import type { ProjectActivityLog } from "./projectActivityLogType";

export interface ProjectOverviewDashboardResponse {
    totalProjects: number;
    totalCompletedTasks: number;
    totalPendingTasks: number;
    totalIssues: number;
    recentActivities: ProjectActivityLog[];
    projectOverTimeline: TimelineDataPoint[];
}

export interface TimelineDataPoint {
    date: string;
    dueDate: string;
    completedTasks: number;
    projectId: number;
    projectName: string;
    pendingTasks: number;
    issues: number;
}