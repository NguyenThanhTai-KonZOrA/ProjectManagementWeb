export interface TaskReportFilterRequest {
    projectId?: number;
    employeeId?: number;
    fromDate?: Date;
    toDate?: Date;
    periodType?: number
}

export interface TaskReportFilterResponse {
    id: number;
    taskId: number;
    taskCode: string;
    taskTitle: string;
    employeeId: number;
    employeeName: string;
    fromStatus: string;
    toStatus: string;
    changedAt: string;
    projectId?: number;
    workDuration?: string;
    completedAt?: string;
    isOverdue?: boolean;
    dueDate?: string;
    periodType?: number;
}

export const periodTypeOptions = [
    { value: 1, label: "Daily" },
    { value: 2, label: "Weekly" },
    { value: 3, label: "Monthly" },
    { value: 4, label: "Quarterly" }
];
