import type { ProjectResponse } from "../../src/projectManagementTypes/projectType";
import type { ProjectCategoryResponse } from "../../src/projectManagementTypes/projectCategoryType";
import type { ProjectOverviewDashboardResponse } from "../../src/projectManagementTypes/projectDashboardType";
import type { TaskResponse } from "../../src/projectManagementTypes/taskType";
import type { CommentResponse } from "../../src/projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../../src/projectManagementTypes/projectActivityLogType";

// Mock Project Categories
export const mockProjectCategories: ProjectCategoryResponse[] = [
    {
        id: 1,
        name: "web-application",
        displayName: "Web Application",
        description: "Web-based applications and platforms",
        icon: "web",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
        displayOrder: 1,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        projectCount: 5,
    },
    {
        id: 2,
        name: "mobile-app",
        displayName: "Mobile Application",
        description: "iOS and Android mobile applications",
        icon: "mobile",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2706/2706962.png",
        displayOrder: 2,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        projectCount: 3,
    },
    {
        id: 3,
        name: "desktop-app",
        displayName: "Desktop Application",
        description: "Desktop software applications",
        icon: "desktop",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
        displayOrder: 3,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        projectCount: 2,
    },
    {
        id: 4,
        name: "api-service",
        displayName: "API Service",
        description: "Backend API and microservices",
        icon: "api",
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2920/2920349.png",
        displayOrder: 4,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        projectCount: 4,
    },
];

// Mock Projects
export const mockProjects: ProjectResponse[] = [
    {
        id: "1",
        projectName: "Patron Responsible Gaming Alert",
        projectCode: "PRGA-001",
        priority: 2,
        comments: ["comment-1", "comment-2"],
        projectMembers: [
            { memberId: "1", memberName: "John Doe", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: "2", memberName: "Jane Smith", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: "3", memberName: "Mike Johnson", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: "4", memberName: "Sarah Williams", memberImage: "https://i.pravatar.cc/150?img=4" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 3,
        projectTimeLine: "1 Month",
        projectType: "Gaming",
        projectCategory: "web-application",
    },
    {
        id: "2",
        projectName: "Task Management System",
        projectCode: "TMS-002",
        priority: 1,
        comments: ["comment-3"],
        projectMembers: [
            { memberId: "1", memberName: "John Doe", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: "2", memberName: "Jane Smith", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: "5", memberName: "David Brown", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: "6", memberName: "Emily Davis", memberImage: "https://i.pravatar.cc/150?img=6" },
            { memberId: "7", memberName: "Chris Wilson", memberImage: "https://i.pravatar.cc/150?img=7" },
            { memberId: "8", memberName: "Lisa Anderson", memberImage: "https://i.pravatar.cc/150?img=8" },
            { memberId: "9", memberName: "Tom Martin", memberImage: "https://i.pravatar.cc/150?img=9" },
            { memberId: "10", memberName: "Amy Garcia", memberImage: "https://i.pravatar.cc/150?img=10" },
        ],
        totalTasks: 30,
        totalTaskCompleted: 30,
        projectTimeLine: "3 Months",
        projectType: "Non-gaming",
        projectCategory: "web-application",
    },
    {
        id: "3",
        projectName: "Ho Tram Rewards Non Gaming",
        projectCode: "HTRNG-003",
        priority: 3,
        comments: ["comment-4", "comment-5"],
        projectMembers: [
            { memberId: "1", memberName: "John Doe", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: "3", memberName: "Mike Johnson", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: "5", memberName: "David Brown", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: "7", memberName: "Chris Wilson", memberImage: "https://i.pravatar.cc/150?img=7" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 2,
        projectTimeLine: "1 Month",
        projectType: "Gaming",
        projectCategory: "mobile-app",
    },
    {
        id: "4",
        projectName: "Patron Responsible Gaming Alert Mobile",
        projectCode: "PRGAM-004",
        priority: 1,
        comments: [],
        projectMembers: [
            { memberId: "2", memberName: "Jane Smith", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: "4", memberName: "Sarah Williams", memberImage: "https://i.pravatar.cc/150?img=4" },
            { memberId: "6", memberName: "Emily Davis", memberImage: "https://i.pravatar.cc/150?img=6" },
            { memberId: "8", memberName: "Lisa Anderson", memberImage: "https://i.pravatar.cc/150?img=8" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 2,
        projectTimeLine: "1 Month",
        projectType: "Non-gaming",
        projectCategory: "mobile-app",
    },
    {
        id: "5",
        projectName: "Task Management System v2",
        projectCode: "TMS2-005",
        priority: 1,
        comments: ["comment-6"],
        projectMembers: [
            { memberId: "1", memberName: "John Doe", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: "2", memberName: "Jane Smith", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: "3", memberName: "Mike Johnson", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: "4", memberName: "Sarah Williams", memberImage: "https://i.pravatar.cc/150?img=4" },
            { memberId: "5", memberName: "David Brown", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: "6", memberName: "Emily Davis", memberImage: "https://i.pravatar.cc/150?img=6" },
            { memberId: "7", memberName: "Chris Wilson", memberImage: "https://i.pravatar.cc/150?img=7" },
            { memberId: "8", memberName: "Lisa Anderson", memberImage: "https://i.pravatar.cc/150?img=8" },
        ],
        totalTasks: 30,
        totalTaskCompleted: 0,
        projectTimeLine: "3 Months",
        projectType: "Non-gaming",
        projectCategory: "web-application",
    },
    {
        id: "6",
        projectName: "Ho Tram Rewards Gaming Edition",
        projectCode: "HTRGE-006",
        priority: 2,
        comments: ["comment-7", "comment-8", "comment-9"],
        projectMembers: [
            { memberId: "3", memberName: "Mike Johnson", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: "5", memberName: "David Brown", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: "7", memberName: "Chris Wilson", memberImage: "https://i.pravatar.cc/150?img=7" },
            { memberId: "9", memberName: "Tom Martin", memberImage: "https://i.pravatar.cc/150?img=9" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 2,
        projectTimeLine: "1 Month",
        projectType: "Gaming",
        projectCategory: "desktop-app",
    },
];

// Mock Tasks
export const mockTasks: TaskResponse[] = [
    {
        id: 1,
        projectId: 1,
        taskType: "Development",
        taskTitle: "Design UI/UX",
        taskCode: "TASK-001",
        description: "Create mockups and wireframes for the application",
        assignees: [
            { memberId: "1", memberName: "John Doe", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: "2", memberName: "Jane Smith", memberImage: "https://i.pravatar.cc/150?img=2" },
        ],
        attachments: [],
        dueDate: "2025-12-15T00:00:00Z",
        startDate: "2025-12-01T00:00:00Z",
        priority: 2,
        createdAt: "2025-12-01T00:00:00Z",
        updatedAt: "2025-12-14T00:00:00Z",
    },
    {
        id: 2,
        projectId: 1,
        taskType: "Development",
        taskTitle: "Implement Frontend",
        taskCode: "TASK-002",
        description: "Build React components and integrate with backend",
        assignees: [
            { memberId: "3", memberName: "Mike Johnson", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: "4", memberName: "Sarah Williams", memberImage: "https://i.pravatar.cc/150?img=4" },
        ],
        attachments: [],
        dueDate: "2026-01-15T00:00:00Z",
        startDate: "2025-12-15T00:00:00Z",
        priority: 2,
        createdAt: "2025-12-15T00:00:00Z",
        updatedAt: "2026-01-10T00:00:00Z",
    },
];

// Mock Comments
export const mockComments: CommentResponse[] = [
    {
        id: 1,
        projectId: 1,
        taskId: 1,
        memberId: 1,
        memberName: "John Doe",
        content: "Great progress on the UI design!",
        createdAt: "2025-12-10T10:00:00Z",
        updatedAt: "2025-12-10T10:00:00Z",
    },
    {
        id: 2,
        projectId: 1,
        taskId: 1,
        memberId: 2,
        memberName: "Jane Smith",
        content: "Need to review the color scheme",
        createdAt: "2025-12-12T14:30:00Z",
        updatedAt: "2025-12-12T14:30:00Z",
    },
];

// Mock Activity Logs
export const mockActivityLogs: ProjectActivityLog[] = [
    {
        id: 1,
        memberAction: "John Doe",
        actionType: "Created",
        entityId: 1,
        details: "Created new project: Patron Responsible Gaming Alert",
        timestamp: new Date("2025-12-01T09:00:00Z"),
    },
    {
        id: 2,
        memberAction: "Jane Smith",
        actionType: "Updated",
        entityId: 1,
        details: "Updated task: Design UI/UX to Completed",
        timestamp: new Date("2025-12-14T16:30:00Z"),
    },
    {
        id: 3,
        memberAction: "Mike Johnson",
        actionType: "Created",
        entityId: 2,
        details: "Created new task: Implement Frontend",
        timestamp: new Date("2025-12-15T10:00:00Z"),
    },
    {
        id: 4,
        memberAction: "Sarah Williams",
        actionType: "Updated",
        entityId: 2,
        details: "Updated project: Task Management System",
        timestamp: new Date("2025-12-20T11:15:00Z"),
    },
    {
        id: 5,
        memberAction: "David Brown",
        actionType: "Completed",
        entityId: 2,
        details: "Completed all tasks for Task Management System",
        timestamp: new Date("2026-01-05T14:00:00Z"),
    },
    {
        id: 6,
        memberAction: "Emily Davis",
        actionType: "Created",
        entityId: 3,
        details: "Created new project: Ho Tram Rewards Non Gaming",
        timestamp: new Date("2026-01-10T09:30:00Z"),
    },
    {
        id: 7,
        memberAction: "Chris Wilson",
        actionType: "Updated",
        entityId: 3,
        details: "Added 4 team members to Ho Tram Rewards",
        timestamp: new Date("2026-01-12T10:45:00Z"),
    },
    {
        id: 8,
        memberAction: "Lisa Anderson",
        actionType: "Created",
        entityId: 4,
        details: "Created mobile version: PRGAM-004",
        timestamp: new Date("2026-01-15T08:00:00Z"),
    },
    {
        id: 9,
        memberAction: "Tom Martin",
        actionType: "Updated",
        entityId: 5,
        details: "Updated TMS v2 project timeline",
        timestamp: new Date("2026-01-18T13:20:00Z"),
    },
    {
        id: 10,
        memberAction: "Amy Garcia",
        actionType: "Created",
        entityId: 6,
        details: "Created Ho Tram Rewards Gaming Edition",
        timestamp: new Date("2026-01-19T15:00:00Z"),
    },
];

// Mock Dashboard Data
export const mockDashboardData: ProjectOverviewDashboardResponse = {
    totalProjects: 6,
    totalCompletedTasks: 37,
    totalPendingTasks: 53,
    totalIssues: 8,
    recentActivities: mockActivityLogs,
    projectOverTimeline: [
        {
            date: "2026-01-13",
            completedTasks: 5,
            pendingTasks: 8,
            issues: 1,
        },
        {
            date: "2026-01-14",
            completedTasks: 7,
            pendingTasks: 10,
            issues: 2,
        },
        {
            date: "2026-01-15",
            completedTasks: 10,
            pendingTasks: 12,
            issues: 1,
        },
        {
            date: "2026-01-16",
            completedTasks: 12,
            pendingTasks: 15,
            issues: 3,
        },
        {
            date: "2026-01-17",
            completedTasks: 15,
            pendingTasks: 18,
            issues: 2,
        },
        {
            date: "2026-01-18",
            completedTasks: 20,
            pendingTasks: 20,
            issues: 3,
        },
        {
            date: "2026-01-19",
            completedTasks: 25,
            pendingTasks: 22,
            issues: 4,
        },
        {
            date: "2026-01-20",
            completedTasks: 37,
            pendingTasks: 53,
            issues: 8,
        },
    ],
};

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if mock data should be used
export const useMockData = (): boolean => {
    return (window as any)._env_?.USE_MOCK_DATA === true;
};
