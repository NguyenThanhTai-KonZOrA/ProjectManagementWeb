export interface NotificationResponse {
    id: number;
    // 1: TaskCreated, 2: TaskAssigned, 3: TaskStatusChanged, 4: TaskPriorityChanged, 5: TaskCompleted, 6: TaskOverdue, 
    // 7: TaskCommentAdded, 8: TaskMentioned, 9: ProjectCreated, 10: ProjectMemberAdded, 11: ProjectStatusChanged, 12: DeadlineReminder, 99: System
    type: number;
    typeName: string;
    title: string;
    message: boolean;
    recipientEmployeeId: string;
    recipientName: string;
    relatedTaskId: string;
    relatedTaskCode: string;
    relatedProjectId: string;
    relatedProjectName: string;
    actionUrl: string;
    isRead: boolean;
    readAt: string;
    priority: number; // 1: Low, 2: Medium, 3: High, 4: Urgent
    createdAt: string;
    timeAgo: string;
}

export interface NotificationSummaryResponse {
    totalUnread: number;
    totalToday: number;
    recentNotifications: NotificationResponse[];
}

export interface MarkNotificationReadRequest {
    notificationIds: number[];
}

export interface NotificationSettingRequest {
    // 1: TaskCreated, 2: TaskAssigned, 3: TaskStatusChanged, 4: TaskPriorityChanged, 5: TaskCompleted, 6: TaskOverdue, 
    // 7: TaskCommentAdded, 8: TaskMentioned, 9: ProjectCreated, 10: ProjectMemberAdded, 11: ProjectStatusChanged, 12: DeadlineReminder, 99: System
    notificationType: number;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
}

export interface NotificationSettingResponse {
    // 1: TaskCreated, 2: TaskAssigned, 3: TaskStatusChanged, 4: TaskPriorityChanged, 5: TaskCompleted, 6: TaskOverdue, 
    // 7: TaskCommentAdded, 8: TaskMentioned, 9: ProjectCreated, 10: ProjectMemberAdded, 11: ProjectStatusChanged, 12: DeadlineReminder, 99: System
    notificationType: number;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export const NotificationType = {
    TaskCreated: 1,
    TaskAssigned: 2,
    TaskStatusChanged: 3,
    TaskPriorityChanged: 4,
    TaskCompleted: 5,
    TaskOverdue: 6,
    TaskCommentAdded: 7,
    TaskMentioned: 8,
    ProjectCreated: 9,
    ProjectMemberAdded: 10,
    ProjectStatusChanged: 11,
    DeadlineReminder: 12,
    System: 99
};

export const NotificationPriority = {
    Low: 1,
    Medium: 2,
    High: 3,
    Urgent: 4
};