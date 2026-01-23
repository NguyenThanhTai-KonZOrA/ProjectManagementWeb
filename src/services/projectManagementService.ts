import axios from "axios";
import type { ApiEnvelope } from "../type/commonType";
import { showSessionExpiredNotification } from "../utils/showSessionExpiredNotification";
import type { AddProjectMembersRequest, CreateProjectRequest, ProjectDetailsResponse, ProjectResponse, ProjectSummaryResponse, UpdateProjectRequest } from "../projectManagementTypes/projectType";
import type { CreateOrUpdateSubTaskRequest, CreateTaskRequest, TaskDetailResponse, TaskResponse } from "../projectManagementTypes/taskType";
import type { ProjectCategoryCreateOrUpdateRequest, ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
import type { CommentReactionRequest, CommentResponse, CreateCommentRequest } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectOverviewDashboardResponse } from "../projectManagementTypes/projectDashboardType";
import {
    useMockData,
    mockProjectService,
    mockTaskService,
    mockCategoryService,
    mockCommentService,
    mockActivityLogService,
    mockDashboardService,
} from "./mockProjectManagementService";
import type { ProjectPriorityResponse } from "../projectManagementTypes/projectPriorityType";
import type { ProjectStatusResponse } from "../projectManagementTypes/projectStatusType";
import type { MemberByEmployeeResponse } from "../projectManagementTypes/projectMember";
import type { Update } from "vite/types/hmrPayload.js";

const API_BASE = (window as any)._env_?.API_BASE;
const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" }
});

// Add token to requests automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses - redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only redirect if this is not a login request or token validation
            const isLoginRequest = error.config?.url?.includes('/api/auth/login');
            const isTokenValidation = error.config?.headers?.['X-Token-Validation'] === 'true';

            if (!isLoginRequest && !isTokenValidation) {
                console.log('🔒 Received 401 Unauthorized - Token is invalid or expired');

                // Clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userRoles');

                // Trigger logout event for other tabs
                localStorage.setItem('logout-event', Date.now().toString());

                // Show user-friendly message
                showSessionExpiredNotification();
                console.log('🚪 Redirecting to login page...');

                // Redirect to login
                // Delay redirect to show notification
                setTimeout(() => {
                    window.location.href = '/login';
                }, 5000);
            }
        }

        // Check if it's a network error
        if (!error.response && error.code === 'ERR_NETWORK') {
            console.error('Network error detected:', error.message);
            // Dispatch event to update network status
            window.dispatchEvent(new CustomEvent('network-error', { detail: error }));
        }

        return Promise.reject(error);
    }
);

function unwrapApiEnvelope<T>(response: { data: ApiEnvelope<T> }): T {
    if (!response.data.success) {
        throw new Error("API call failed");
    }
    return response.data.data;
};

export const projectManagementService = {
    getProjectsSummary: async (): Promise<ProjectSummaryResponse[]> => {
        const response = await api.get('/api/project/summary');
        return unwrapApiEnvelope(response);
    },

    createProject: async (request: CreateProjectRequest): Promise<ProjectResponse> => {
        if (useMockData()) return mockProjectService.createProject(request);
        const response = await api.post('/api/project/create', request);
        return unwrapApiEnvelope(response);
    },

    updateProject: async (id: number, request: CreateProjectRequest): Promise<ProjectResponse> => {
        if (useMockData()) return mockProjectService.updateProject(id, request);
        const response = await api.post(`/api/project/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteProject: async (id: number): Promise<void> => {
        if (useMockData()) return mockProjectService.deleteProject(id);
        const response = await api.post(`/api/project/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getProjectById: async (id: number): Promise<ProjectDetailsResponse> => {
        const response = await api.get(`/api/project/detail/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllProjects: async (): Promise<ProjectResponse[]> => {
        if (useMockData()) return mockProjectService.getAllProjects();
        const response = await api.get(`/api/project/all`);
        return unwrapApiEnvelope(response);
    },

    // Request same UploadAttachmentsProjectRequest model
    uploadAttachmentsProject: async (_: number, formData: FormData): Promise<boolean> => {
        const response = await api.post(`/api/project/upload/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return unwrapApiEnvelope(response);
    },

    addProjectMembers: async (request: AddProjectMembersRequest): Promise<void> => {
        const response = await api.post(`/api/project/add/members`, request);
        return unwrapApiEnvelope(response);
    }
};

export const taskManagementService = {
    // Request same CreateTaskRequest model
    createTask: async (formData: FormData): Promise<TaskResponse> => {
        // if (useMockData()) return mockTaskService.createTask(formData);
        const response = await api.post('/api/task/create', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return unwrapApiEnvelope(response);
    },

    // Request same CreateTaskRequest model
    updateTask: async (id: number, formData: FormData): Promise<TaskResponse> => {
        // if (useMockData()) return mockTaskService.updateTask(id, formData);
        const response = await api.post(`/api/task/update/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return unwrapApiEnvelope(response);
    },

    // Request same UploadAttachmentsTaskRequest model
    uploadAttachmentsTask: async (_: number, formData: FormData): Promise<boolean> => {
        const response = await api.post(`/api/task/upload/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return unwrapApiEnvelope(response);
    },

    deleteTask: async (id: number): Promise<void> => {
        if (useMockData()) return mockTaskService.deleteTask(id);
        const response = await api.post(`/api/task/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getTaskById: async (id: number): Promise<TaskDetailResponse> => {
        const response = await api.get(`/api/task/detail/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllTasks: async (): Promise<TaskResponse[]> => {
        if (useMockData()) return mockTaskService.getAllTasks();
        const response = await api.get(`/api/task/all`);
        return unwrapApiEnvelope(response);
    },

    getAllTasksOfProject: async (projectId: number): Promise<TaskResponse[]> => {
        if (useMockData()) return mockTaskService.getAllTasksOfProject(projectId);
        const response = await api.get(`/api/task/project/${projectId}`);
        return unwrapApiEnvelope(response);
    },

    // Request same CreateOrUpdateSubTaskRequest model
    createOrUpdateSubTask: async (formData: FormData): Promise<TaskResponse> => {
        if (useMockData()) return mockTaskService.createOrUpdateSubTask(formData);
        const response = await api.post('/api/task/create/subtask', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return unwrapApiEnvelope(response);
    },

    deleteSubTask: async (id: number): Promise<void> => {
        if (useMockData()) return mockTaskService.deleteSubTask(id);
        const response = await api.post(`/api/task/subtask/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    approveTask: async (taskId: number, reason: string = ""): Promise<void> => {
        if (useMockData()) return mockTaskService.approveTask(taskId, reason);
        const response = await api.post('/api/task/approve', { taskId, actionType: "Approve", reason });
        return unwrapApiEnvelope(response);
    },

    rejectTask: async (taskId: number, reason: string = ""): Promise<void> => {
        if (useMockData()) return mockTaskService.rejectTask(taskId, reason);
        const response = await api.post('/api/task/reject', { taskId, actionType: "Reject", reason });
        return unwrapApiEnvelope(response);
    },

    changeTaskStatus: async (request: { taskId: number; newStatusId: string; }): Promise<void> => {
        const response = await api.post('/api/task/change-status', request);
        return unwrapApiEnvelope(response);
    },

    changeTaskPriority: async (request: { taskId: number; newPriorityId: number; }): Promise<void> => {
        const response = await api.post('/api/task/change-priority', request);
        return unwrapApiEnvelope(response);
    }
};

export const projectCategoryService = {
    createCategory: async (request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
        if (useMockData()) return mockCategoryService.createCategory(request);
        const response = await api.post('/api/Category/create', request);
        return unwrapApiEnvelope(response);
    },

    updateCategory: async (id: number, request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
        if (useMockData()) return mockCategoryService.updateCategory(id, request);
        const response = await api.post(`/api/Category/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteCategory: async (id: number): Promise<void> => {
        if (useMockData()) return mockCategoryService.deleteCategory(id);
        const response = await api.post(`/api/Category/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getCategoryById: async (id: number): Promise<ProjectCategoryResponse> => {
        if (useMockData()) return mockCategoryService.getCategoryById(id);
        const response = await api.get(`/api/Category/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllCategories: async (): Promise<ProjectCategoryResponse[]> => {
        if (useMockData()) return mockCategoryService.getAllCategories();
        const response = await api.get(`/api/Category/all`);
        return unwrapApiEnvelope(response);
    }
};

export const commentService = {
    createComment: async (request: CreateCommentRequest): Promise<CommentResponse> => {
        if (useMockData()) return mockCommentService.createComment(request);
        const response = await api.post('/api/Comment/create', request);
        return unwrapApiEnvelope(response);
    },

    updateComment: async (id: number, request: CreateCommentRequest): Promise<CommentResponse> => {
        if (useMockData()) return mockCommentService.updateComment(id, request);
        const response = await api.post(`/api/Comment/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteComment: async (id: number): Promise<void> => {
        if (useMockData()) return mockCommentService.deleteComment(id);
        const response = await api.post(`/api/Comment/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getCommentById: async (id: number): Promise<CommentResponse> => {
        if (useMockData()) return mockCommentService.getCommentById(id);
        const response = await api.get(`/api/Comment/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllComments: async (): Promise<CommentResponse[]> => {
        if (useMockData()) return mockCommentService.getAllComments();
        const response = await api.get(`/api/Comment/all`);
        return unwrapApiEnvelope(response);
    },

    getAllCommentsOfTask: async (taskId: number): Promise<CommentResponse[]> => {
        if (useMockData()) return mockCommentService.getAllCommentsOfTask(taskId);
        const response = await api.get(`/api/Comment/task/${taskId}`);
        return unwrapApiEnvelope(response);
    },

    getAllCommentsOfProject: async (projectId: number): Promise<CommentResponse[]> => {
        if (useMockData()) return mockCommentService.getAllCommentsOfProject(projectId);
        const response = await api.get(`/api/Comment/project/${projectId}`);
        return unwrapApiEnvelope(response);
    },

    createReaction: async (request: CommentReactionRequest): Promise<CommentResponse> => {
        const response = await api.post('/api/Comment/create/reaction', request);
        return unwrapApiEnvelope(response);
    },

    deleteReaction: async (commentId: number): Promise<void> => {
        const response = await api.post(`/api/Comment/delete/reaction/${commentId}`);
        return unwrapApiEnvelope(response);
    }
};

export const projectActivityLogService = {
    getAllLogs: async (): Promise<ProjectActivityLog[]> => {
        if (useMockData()) return mockActivityLogService.getAllLogs();
        const response = await api.get(`/api/ActivityLog/all`);
        return unwrapApiEnvelope(response);
    },

    getAllLogsOfProject: async (projectId: number): Promise<ProjectActivityLog[]> => {
        if (useMockData()) return mockActivityLogService.getAllLogsOfProject(projectId);
        const response = await api.get(`/api/ActivityLog/project/${projectId}`);
        return unwrapApiEnvelope(response);
    },

    getAllLogsOfTask: async (taskId: number): Promise<ProjectActivityLog[]> => {
        if (useMockData()) return mockActivityLogService.getAllLogsOfTask(taskId);
        const response = await api.get(`/api/ActivityLog/task/${taskId}`);
        return unwrapApiEnvelope(response);
    }
};

export const projectDashboardService = {
    getProjectOverview: async (): Promise<ProjectOverviewDashboardResponse> => {
        if (useMockData()) return mockDashboardService.getProjectOverview();
        const response = await api.get(`/api/ProjectDashboard/overview`);
        return unwrapApiEnvelope(response);
    }
};

export const projectStatusService = {
    getAllStatuses: async (): Promise<ProjectStatusResponse[]> => {
        const response = await api.get(`/api/Status/all/statuses`);
        return unwrapApiEnvelope(response);
    }
};

export const projectPriorityService = {
    getAllPriorities: async (): Promise<ProjectPriorityResponse[]> => {
        const response = await api.get(`/api/Priority/all/priorities`);
        return unwrapApiEnvelope(response);
    }
};

export const projectMemberService = {
    getAllMembers: async (): Promise<MemberByEmployeeResponse[]> => {
        const response = await api.get(`/api/ProjectMember/all`);
        return unwrapApiEnvelope(response);
    },

    getMemberOfProject: async (projectId: number): Promise<MemberByEmployeeResponse[]> => {
        const response = await api.get(`/api/ProjectMember/project/${projectId}`);
        return unwrapApiEnvelope(response);
    }
};