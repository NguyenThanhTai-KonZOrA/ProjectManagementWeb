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
        id: "10",
        projectName: "Patron Responsible Gaming Alert",
        projectCode: "PRGAM-004",
        priority: 1,
        comments: [],
        projectMembers: [
            { memberId: 2, memberName: "Duy.Le", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: 4, memberName: "Phuong.Cao", memberImage: "https://i.pravatar.cc/150?img=4" },
            { memberId: 6, memberName: "HaTT.Nguyen", memberImage: "https://i.pravatar.cc/150?img=6" },
            { memberId: 8, memberName: "TaiThanh.Nguyen", memberImage: "https://i.pravatar.cc/150?img=8" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 2,
        projectTimeLine: "1 Month",
        projectType: 2,
        projectCategoryName: "mobile-app",
        description: "A project focused on enhancing the gaming experience at Ho Tram.",
        projectTypeName: "Client",
        statusId: 1,
        statusName: "Active",
        endDate: "2025-12-31T00:00:00Z",
        startDate: "2025-12-01T00:00:00Z",
        projectCategoryId: 2,
    },
    {
        id: "11",
        projectName: "Task Management System v2",
        projectCode: "TMS2-005",
        priority: 1,
        comments: ["comment-6"],
        projectMembers: [
            { memberId: 1, memberName: "TaiThanh.Nguyen", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: 2, memberName: "Duy.Le", memberImage: "https://i.pravatar.cc/150?img=2" },
            { memberId: 3, memberName: "Nghia.Tran", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: 4, memberName: "Phuong.Cao", memberImage: "https://i.pravatar.cc/150?img=4" },
            { memberId: 5, memberName: "MaiT.Ngo", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: 6, memberName: "HaTT.Nguyen", memberImage: "https://i.pravatar.cc/150?img=6" },
            { memberId: 7, memberName: "Vuong.Nguyen", memberImage: "https://i.pravatar.cc/150?img=7" },
            { memberId: 8, memberName: "TaiThanh.Nguyen", memberImage: "https://i.pravatar.cc/150?img=8" },
        ],
        totalTasks: 30,
        totalTaskCompleted: 0,
        projectTimeLine: "3 Months",
        projectType: 2,
        description: "A project focused on enhancing the gaming experience at Ho Tram.",
        projectTypeName: "Client",
        statusId: 1,
        statusName: "Active",
        projectCategoryName: "web-application",
        endDate: "2025-12-31T00:00:00Z",
        startDate: "2025-12-01T00:00:00Z",
        projectCategoryId: 3,
    },
    {
        id: "12",
        projectName: "Ho Tram Rewards Gaming Edition",
        projectCode: "HTRGE-006",
        priority: 2,
        comments: ["comment-7", "comment-8", "comment-9"],
        projectMembers: [
            { memberId: 3, memberName: "Nghia.Tran", memberImage: "https://i.pravatar.cc/150?img=3" },
            { memberId: 5, memberName: "MaiT.Ngo", memberImage: "https://i.pravatar.cc/150?img=5" },
            { memberId: 7, memberName: "Vuong.Nguyen", memberImage: "https://i.pravatar.cc/150?img=7" },
            { memberId: 9, memberName: "LoiC.Huynh", memberImage: "https://i.pravatar.cc/150?img=9" },
        ],
        totalTasks: 10,
        totalTaskCompleted: 2,
        projectTimeLine: "1 Month",
        projectType: 1,
        projectCategoryName: "desktop-app",
        description: "A project focused on enhancing the gaming experience at Ho Tram.",
        projectTypeName: "Internal",
        statusId: 1,
        statusName: "Active",
        endDate: "2025-12-31T00:00:00Z",
        startDate: "2025-12-01T00:00:00Z",
        projectCategoryId: 3,
    },
];

// Mock Tasks
export const mockTasks: TaskResponse[] = [
    {
        taskId: 1,
        projectId: 1,
        taskType: "Development",
        taskTitle: "Design UI/UX",
        taskCode: "TASK-001",
        description: "Create mockups and wireframes for the application",
        assignees: [
            { memberId: 1, memberName: "TaiThanh.Nguyen", memberImage: "https://i.pravatar.cc/150?img=1" },
            { memberId: 2, memberName: "Duy.Le", memberImage: "https://i.pravatar.cc/150?img=2" },
        ],
        attachments: [],
        dueDate: "2025-12-15T00:00:00Z",
        startDate: "2025-12-01T00:00:00Z",
        priority: 2,
        createdAt: "2025-12-01T00:00:00Z",
        updatedAt: "2025-12-14T00:00:00Z",
        statusId: 2,
        statusName: "In Progress",
        priorityColor: '',
        priorityName: '',
        statusColor: '',
        projectType: 2,
        projectTypeName: "Client"
    },

];

// Mock Comments
export const mockComments: CommentResponse[] = [
    {
        id: 1,
        projectId: 1,
        taskId: 1,
        employeeId: 1,
        employeeName: "TaiThanh.Nguyen",
        description: "Great progress on the UI design!",
        createdAt: "2025-12-10T10:00:00Z",
        updatedAt: "2025-12-10T10:00:00Z",
        reactions: [],
        replies: [],
        parentCommentId: 0,
        totalReactions: 0,
        currentUserReaction: 0,
        editedAt: 'null',
        heartCount: 0,
        isEdited: false,
        likeCount: 0,
        loveCount: 0,

    },
];

// Mock Activity Logs
export const mockActivityLogs: ProjectActivityLog[] = [
    {
        id: 1,
        memberAction: "TaiThanh.Nguyen",
        actionType: "Created",
        entityId: 1,
        details: "Created new project: Patron Responsible Gaming Alert",
        timeStamp: "2025-12-01T09:00:00Z",
    },
    {
        id: 2,
        memberAction: "Duy.Le",
        actionType: "Updated",
        entityId: 1,
        details: "Updated task: Design UI/UX to Completed",
        timeStamp: "2025-12-14T16:30:00Z",
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
            projectId: 1,
            projectName: "Patron Responsible Gaming Alert",
            date: "2026-01-13",
            completedTasks: 5,
            pendingTasks: 8,
            issues: 1,
            dueDate: "2026-01-20",
        },
    ],
};

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if mock data should be used
export const useMockData = (): boolean => {
    return (window as any)._env_?.USE_MOCK_DATA === true;
};
