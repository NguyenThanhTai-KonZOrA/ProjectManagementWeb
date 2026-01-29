// import {
//     mockProjects,
//     mockProjectCategories,
//     mockDashboardData,
//     mockTasks,
//     mockComments,
//     mockActivityLogs,
//     delay,
//     useMockData
// } from "../../public/Mockup/mockup_data";
// import type { CreateProjectRequest, ProjectResponse } from "../projectManagementTypes/projectType";
// import type { CreateTaskRequest, TaskResponse } from "../projectManagementTypes/taskType";
// import type { ProjectCategoryCreateOrUpdateRequest, ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
// import type { CommentResponse, CreateCommentRequest } from "../projectManagementTypes/projectCommentsType";
// import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
// import type { ProjectOverviewDashboardResponse } from "../projectManagementTypes/projectDashboardType";

// // Mock delay time (in milliseconds) to simulate API calls
// const MOCK_DELAY = 500;

// // In-memory storage for mock data (simulates database)
// let projectsData: ProjectResponse[] = [...mockProjects];
// let categoriesData: ProjectCategoryResponse[] = [...mockProjectCategories];
// let tasksData: TaskResponse[] = [...mockTasks];
// let commentsData: CommentResponse[] = [...mockComments];
// let activityLogsData: ProjectActivityLog[] = [...mockActivityLogs];

// // Helper to generate new ID
// const getNextId = (items: any[]): number => {
//     return items.length > 0 ? Math.max(...items.map(item => parseInt(item.id?.toString() || "0"))) + 1 : 1;
// };

// // Mock Project Management Service
// export const mockProjectService = {
//     createProject: async (request: CreateProjectRequest): Promise<ProjectResponse> => {
//         await delay(MOCK_DELAY);

//         const newProject: ProjectResponse = {
//             id: getNextId(projectsData).toString(),
//             projectName: request.projectName,
//             projectCode: `PRJ-${String(getNextId(projectsData)).padStart(3, '0')}`,
//             priority: request.priority,
//             comments: [],
//             projectMembers: [],
//             totalTasks: 0,
//             totalTaskCompleted: 0,
//             projectTimeLine: calculateTimeline(request.startDate, request.endDate),
//             projectType: request.projectType,
//             description: "" + request.description,
//             projectTypeName: request.projectType === 1 ? "Internal" : "Client",
//             statusId: 1,
//             statusName: "Active",
//             endDate: request.endDate,
//             startDate: request.startDate,
//             projectCategoryId: 0,
//             projectCategoryName: request.projectCategory,

//         };

//         projectsData.push(newProject);

//         // Add activity log
//         activityLogsData.push({
//             id: getNextId(activityLogsData),
//             memberAction: "Current User",
//             actionType: "Created",
//             entityId: parseInt(newProject.id),
//             details: `Created new project: ${newProject.projectName}`,
//             timeStamp: new Date().toISOString(),
//         });

//         return newProject;
//     },

//     updateProject: async (id: number, request: CreateProjectRequest): Promise<ProjectResponse> => {
//         await delay(MOCK_DELAY);

//         const index = projectsData.findIndex(p => parseInt(p.id) === id);
//         if (index === -1) {
//             throw new Error("Project not found");
//         }

//         const updatedProject: ProjectResponse = {
//             ...projectsData[index],
//             projectName: request.projectName,
//             priority: request.priority,
//             projectMembers: [],
//             projectTimeLine: calculateTimeline(request.startDate, request.endDate),
//             projectType: request.projectType,
//             comments: [...projectsData[index].comments],
//             description: "" + request.description,
//             statusId: projectsData[index].statusId,
//             statusName: projectsData[index].statusName,
//         };

//         projectsData[index] = updatedProject;

//         // Add activity log
//         activityLogsData.push({
//             id: getNextId(activityLogsData),
//             memberAction: "Current User",
//             actionType: "Updated",
//             entityId: id,
//             details: `Updated project: ${updatedProject.projectName}`,
//             timeStamp: new Date().toISOString(),
//         });

//         return updatedProject;
//     },

//     deleteProject: async (id: number): Promise<void> => {
//         await delay(MOCK_DELAY);

//         const index = projectsData.findIndex(p => parseInt(p.id) === id);
//         if (index === -1) {
//             throw new Error("Project not found");
//         }

//         const project = projectsData[index];
//         projectsData = projectsData.filter(p => parseInt(p.id) !== id);

//         // Add activity log
//         activityLogsData.push({
//             id: getNextId(activityLogsData),
//             memberAction: "Current User",
//             actionType: "Deleted",
//             entityId: id,
//             details: `Deleted project: ${project.projectName}`,
//             timeStamp: new Date().toISOString(),
//         });
//     },

//     getProjectById: async (id: number): Promise<ProjectResponse> => {
//         await delay(MOCK_DELAY);

//         const project = projectsData.find(p => parseInt(p.id) === id);
//         if (!project) {
//             throw new Error("Project not found");
//         }
//         return project;
//     },

//     getAllProjects: async (): Promise<ProjectResponse[]> => {
//         await delay(MOCK_DELAY);
//         return [...projectsData];
//     },
// };

// // Mock Task Management Service
// export const mockTaskService = {
//     createTask: async (request: CreateTaskRequest): Promise<TaskResponse> => {
//         await delay(MOCK_DELAY);

//         const newTask: TaskResponse = {
//             taskId: getNextId(tasksData),
//             projectId: request.projectId,
//             taskType: request.taskType,
//             taskTitle: request.taskTitle,
//             taskCode: `TASK-${String(getNextId(tasksData)).padStart(3, '0')}`,
//             description: request.description,
//             attachments: [],
//             dueDate: request.dueDate,
//             startDate: request.startDate,
//             priority: request.priority,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//             statusId: 1,
//             statusName: "Open",
//             priorityColor: '',
//             priorityName: '',
//             statusColor: '',
//             projectType: 0,
//             projectTypeName: "Client",
//             assignees: []
//         };

//         tasksData.push(newTask);

//         // Update project task count
//         const projectIndex = projectsData.findIndex(p => parseInt(p.id) === request.projectId);
//         if (projectIndex !== -1) {
//             projectsData[projectIndex].totalTasks += 1;
//         }

//         return newTask;
//     },

//     updateTask: async (id: number, request: CreateTaskRequest): Promise<TaskResponse> => {
//         await delay(MOCK_DELAY);

//         const index = tasksData.findIndex(t => t.taskId === id);
//         if (index === -1) {
//             throw new Error("Task not found");
//         }

//         const updatedTask: TaskResponse = {
//             ...tasksData[index],
//             taskType: request.taskType,
//             taskTitle: request.taskTitle,
//             description: request.description,

//             dueDate: request.dueDate,
//             startDate: request.startDate,
//             priority: request.priority,
//             updatedAt: new Date().toISOString(),
//         };

//         tasksData[index] = updatedTask;
//         return updatedTask;
//     },

//     deleteTask: async (id: number): Promise<void> => {
//         await delay(MOCK_DELAY);

//         const task = tasksData.find(t => t.taskId === id);
//         if (!task) {
//             throw new Error("Task not found");
//         }

//         tasksData = tasksData.filter(t => t.taskId !== id);

//         // Update project task count
//         const projectIndex = projectsData.findIndex(p => parseInt(p.id) === task.projectId);
//         if (projectIndex !== -1) {
//             projectsData[projectIndex].totalTasks = Math.max(0, projectsData[projectIndex].totalTasks - 1);
//         }
//     },

//     getTaskById: async (id: number): Promise<TaskResponse> => {
//         await delay(MOCK_DELAY);

//         const task = tasksData.find(t => t.taskId === id);
//         if (!task) {
//             throw new Error("Task not found");
//         }
//         return task;
//     },

//     getAllTasks: async (): Promise<TaskResponse[]> => {
//         await delay(MOCK_DELAY);
//         return [...tasksData];
//     },

//     getAllTasksOfProject: async (projectId: number): Promise<TaskResponse[]> => {
//         await delay(MOCK_DELAY);
//         return tasksData.filter(t => t.projectId === projectId);
//     },

//     createOrUpdateSubTask: async (request: any): Promise<TaskResponse> => {
//         await delay(MOCK_DELAY);
//         // Simplified - treat as regular task
//         if (request.subTaskId) {
//             return mockTaskService.updateTask(request.subTaskId, request);
//         }
//         return mockTaskService.createTask(request);
//     },

//     deleteSubTask: async (id: number): Promise<void> => {
//         return mockTaskService.deleteTask(id);
//     },

//     approveTask: async (taskId: number, reason: string = ""): Promise<void> => {
//         await delay(MOCK_DELAY);
//         console.log(`Task ${taskId} approved. Reason: ${reason}`);

//         // Add activity log
//         activityLogsData.push({
//             id: getNextId(activityLogsData),
//             memberAction: "Current User",
//             actionType: "Approved",
//             entityId: taskId,
//             details: `Task approved${reason ? `: ${reason}` : ""}`,
//             timeStamp: new Date().toISOString(),
//         });
//     },

//     rejectTask: async (taskId: number, reason: string = ""): Promise<void> => {
//         await delay(MOCK_DELAY);
//         console.log(`Task ${taskId} rejected. Reason: ${reason}`);

//         // Add activity log
//         activityLogsData.push({
//             id: getNextId(activityLogsData),
//             memberAction: "Current User",
//             actionType: "Rejected",
//             entityId: taskId,
//             details: `Task rejected${reason ? `: ${reason}` : ""}`,
//             timeStamp: new Date().toISOString(),
//         });
//     },
// };

// // Mock Project Category Service
// export const mockCategoryService = {
//     createCategory: async (request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
//         await delay(MOCK_DELAY);

//         const newCategory: ProjectCategoryResponse = {
//             id: getNextId(categoriesData),
//             name: request.name,
//             displayName: request.displayName,
//             description: request.description,
//             icon: request.icon,
//             iconUrl: request.iconUrl,
//             displayOrder: request.displayOrder,
//             isActive: true,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//             projectCount: 0,
//         };

//         categoriesData.push(newCategory);
//         return newCategory;
//     },

//     updateCategory: async (id: number, request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
//         await delay(MOCK_DELAY);

//         const index = categoriesData.findIndex(c => c.id === id);
//         if (index === -1) {
//             throw new Error("Category not found");
//         }

//         const updatedCategory: ProjectCategoryResponse = {
//             ...categoriesData[index],
//             name: request.name,
//             displayName: request.displayName,
//             description: request.description,
//             icon: request.icon,
//             iconUrl: request.iconUrl,
//             displayOrder: request.displayOrder,
//             updatedAt: new Date().toISOString(),
//         };

//         categoriesData[index] = updatedCategory;
//         return updatedCategory;
//     },

//     deleteCategory: async (id: number): Promise<void> => {
//         await delay(MOCK_DELAY);

//         const index = categoriesData.findIndex(c => c.id === id);
//         if (index === -1) {
//             throw new Error("Category not found");
//         }

//         categoriesData = categoriesData.filter(c => c.id !== id);
//     },

//     getCategoryById: async (id: number): Promise<ProjectCategoryResponse> => {
//         await delay(MOCK_DELAY);

//         const category = categoriesData.find(c => c.id === id);
//         if (!category) {
//             throw new Error("Category not found");
//         }
//         return category;
//     },

//     getAllCategories: async (): Promise<ProjectCategoryResponse[]> => {
//         await delay(MOCK_DELAY);
//         return [...categoriesData];
//     },
// };

// // Mock Comment Service
// export const mockCommentService = {
//     createComment: async (request: CreateCommentRequest): Promise<CommentResponse> => {
//         await delay(MOCK_DELAY);

//         const newComment: CommentResponse = {
//             id: getNextId(commentsData),
//             projectId: request.projectId || 0,
//             taskId: request.taskId || 0,
//             employeeId: 1, // Mock current user ID
//             employeeName: "Current User",
//             description: request.description,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//             currentUserReaction: 1,
//             editedAt: "",
//             heartCount: 0,
//             isEdited: false,
//             likeCount: 0,
//             loveCount: 0,
//             parentCommentId: request.parentCommentId || 0,
//             reactions: [],
//             replies: [],
//             totalReactions: 0,
//         };

//         commentsData.push(newComment);
//         return newComment;
//     },

//     updateComment: async (id: number, request: CreateCommentRequest): Promise<CommentResponse> => {
//         await delay(MOCK_DELAY);

//         const index = commentsData.findIndex(c => c.id === id);
//         if (index === -1) {
//             throw new Error("Comment not found");
//         }

//         const updatedComment: CommentResponse = {
//             ...commentsData[index],
//             description: request.description,
//             updatedAt: new Date().toISOString(),
//         };

//         commentsData[index] = updatedComment;
//         return updatedComment;
//     },

//     deleteComment: async (id: number): Promise<void> => {
//         await delay(MOCK_DELAY);
//         commentsData = commentsData.filter(c => c.id !== id);
//     },

//     getCommentById: async (id: number): Promise<CommentResponse> => {
//         await delay(MOCK_DELAY);

//         const comment = commentsData.find(c => c.id === id);
//         if (!comment) {
//             throw new Error("Comment not found");
//         }
//         return comment;
//     },

//     getAllComments: async (): Promise<CommentResponse[]> => {
//         await delay(MOCK_DELAY);
//         return [...commentsData];
//     },

//     getAllCommentsOfTask: async (taskId: number): Promise<CommentResponse[]> => {
//         await delay(MOCK_DELAY);
//         return commentsData.filter(c => c.taskId === taskId);
//     },

//     getAllCommentsOfProject: async (projectId: number): Promise<CommentResponse[]> => {
//         await delay(MOCK_DELAY);
//         return commentsData.filter(c => c.projectId === projectId);
//     },
// };

// // Mock Activity Log Service
// export const mockActivityLogService = {
//     getAllLogs: async (): Promise<ProjectActivityLog[]> => {
//         await delay(MOCK_DELAY);
//         return [...activityLogsData].sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
//     },

//     getAllLogsOfProject: async (projectId: number): Promise<ProjectActivityLog[]> => {
//         await delay(MOCK_DELAY);
//         return activityLogsData
//             .filter(log => log.entityId === projectId)
//             .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
//     },

//     getAllLogsOfTask: async (taskId: number): Promise<ProjectActivityLog[]> => {
//         await delay(MOCK_DELAY);
//         return activityLogsData
//             .filter(log => log.entityId === taskId)
//             .sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime());
//     },
// };

// // Mock Dashboard Service
// export const mockDashboardService = {
//     getProjectOverview: async (): Promise<ProjectOverviewDashboardResponse> => {
//         await delay(MOCK_DELAY);

//         // Calculate real-time statistics from current data
//         const totalProjects = projectsData.length;
//         const totalCompletedTasks = projectsData.reduce((sum, p) => sum + p.totalTaskCompleted, 0);
//         const totalPendingTasks = projectsData.reduce((sum, p) => sum + (p.totalTasks - p.totalTaskCompleted), 0);
//         const totalIssues = mockDashboardData.totalIssues; // Keep as mock for now

//         return {
//             ...mockDashboardData,
//             totalProjects,
//             totalCompletedTasks,
//             totalPendingTasks,
//             totalIssues,
//             recentActivities: activityLogsData.slice(0, 10).sort((a, b) => new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()),
//         };
//     },
// };

// // Helper function to calculate timeline
// function calculateTimeline(startDate: string, endDate: string): string {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end.getTime() - start.getTime());
//     const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

//     if (diffMonths === 1) {
//         return "1 Month";
//     }
//     return `${diffMonths} Months`;
// }

// // Export helper function
// export { useMockData };
