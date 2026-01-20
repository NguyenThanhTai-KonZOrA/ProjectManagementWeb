import axios from "axios";
import type { ApiEnvelope } from "../type/commonType";
import { showSessionExpiredNotification } from "../utils/showSessionExpiredNotification";
import type { CreateProjectRequest, ProjectResponse } from "../projectManagementTypes/projectType";
import type { CreateOrUpdateSubTaskRequest, CreateTaskRequest, TaskResponse } from "../projectManagementTypes/taskType";
import type { CategoryResponse } from "../type/categoryType";
import type { ProjectCategoryCreateOrUpdateRequest, ProjectCategoryResponse } from "../projectManagementTypes/projectCategoryType";
import type { CommentResponse, CreateCommentRequest } from "../projectManagementTypes/projectCommentsType";
import type { ProjectActivityLog } from "../projectManagementTypes/projectActivityLogType";
import type { ProjectOverviewDashboardResponse } from "../projectManagementTypes/projectDashboardType";

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
    createProject: async (request: CreateProjectRequest): Promise<ProjectResponse> => {
        const response = await api.post('/api/ProjectManagement/create', request);
        return unwrapApiEnvelope(response);
    },

    updateProject: async (id: number, request: CreateProjectRequest): Promise<ProjectResponse> => {
        const response = await api.post(`/api/ProjectManagement/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteProject: async (id: number): Promise<void> => {
        const response = await api.post(`/api/ProjectManagement/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getProjectById: async (id: number): Promise<ProjectResponse> => {
        const response = await api.get(`/api/ProjectManagement/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllProjects: async (): Promise<ProjectResponse[]> => {
        const response = await api.get(`/api/ProjectManagement/all`);
        return unwrapApiEnvelope(response);
    }
};

export const taskManagementService = {
    createTask: async (request: CreateTaskRequest): Promise<TaskResponse> => {
        const response = await api.post('/api/TaskManagement/create', request);
        return unwrapApiEnvelope(response);
    },

    updateTask: async (id: number, request: CreateTaskRequest): Promise<TaskResponse> => {
        const response = await api.post(`/api/TaskManagement/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteTask: async (id: number): Promise<void> => {
        const response = await api.post(`/api/TaskManagement/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getTaskById: async (id: number): Promise<TaskResponse> => {
        const response = await api.get(`/api/TaskManagement/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllTasks: async (): Promise<TaskResponse[]> => {
        const response = await api.get(`/api/TaskManagement/all`);
        return unwrapApiEnvelope(response);
    },

    getAllTasksOfProject: async (projectId: number): Promise<TaskResponse[]> => {
        const response = await api.get(`/api/TaskManagement/project/${projectId}`);
        return unwrapApiEnvelope(response);
    },

    createOrUpdateSubTask: async (request: CreateOrUpdateSubTaskRequest): Promise<TaskResponse> => {
        const response = await api.post('/api/TaskManagement/subtask', request);
        return unwrapApiEnvelope(response);
    },

    deleteSubTask: async (id: number): Promise<void> => {
        const response = await api.post(`/api/TaskManagement/subtask/delete/${id}`);
        return unwrapApiEnvelope(response);
    }
};

export const projectCategoryService = {
    createCategory: async (request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
        const response = await api.post('/api/ProjectCategory/create', request);
        return unwrapApiEnvelope(response);
    },

    updateCategory: async (id: number, request: ProjectCategoryCreateOrUpdateRequest): Promise<ProjectCategoryResponse> => {
        const response = await api.post(`/api/ProjectCategory/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteCategory: async (id: number): Promise<void> => {
        const response = await api.post(`/api/ProjectCategory/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getCategoryById: async (id: number): Promise<ProjectCategoryResponse> => {
        const response = await api.get(`/api/ProjectCategory/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllCategories: async (): Promise<ProjectCategoryResponse[]> => {
        const response = await api.get(`/api/ProjectCategory/all`);
        return unwrapApiEnvelope(response);
    }
};

export const commentService = {
    createComment: async (request: CreateCommentRequest): Promise<CommentResponse> => {
        const response = await api.post('/api/ProjectComment/create', request);
        return unwrapApiEnvelope(response);
    },

    updateComment: async (id: number, request: CreateCommentRequest): Promise<CommentResponse> => {
        const response = await api.post(`/api/ProjectComment/update/${id}`, request);
        return unwrapApiEnvelope(response);
    },

    deleteComment: async (id: number): Promise<void> => {
        const response = await api.post(`/api/ProjectComment/delete/${id}`);
        return unwrapApiEnvelope(response);
    },

    getCommentById: async (id: number): Promise<CommentResponse> => {
        const response = await api.get(`/api/ProjectComment/${id}`);
        return unwrapApiEnvelope(response);
    },

    getAllComments: async (): Promise<CommentResponse[]> => {
        const response = await api.get(`/api/ProjectComment/all`);
        return unwrapApiEnvelope(response);
    },

    getAllCommentsOfTask: async (taskId: number): Promise<CommentResponse[]> => {
        const response = await api.get(`/api/ProjectComment/task/${taskId}`);
        return unwrapApiEnvelope(response);
    },

    getAllCommentsOfProject: async (projectId: number): Promise<CommentResponse[]> => {
        const response = await api.get(`/api/ProjectComment/project/${projectId}`);
        return unwrapApiEnvelope(response);
    }
};

export const projectActivityLogService = {
    getAllLogs: async (): Promise<ProjectActivityLog[]> => {
        const response = await api.get(`/api/ProjectActivityLog/all`);
        return unwrapApiEnvelope(response);
    },

    getAllLogsOfProject: async (projectId: number): Promise<ProjectActivityLog[]> => {
        const response = await api.get(`/api/ProjectActivityLog/project/${projectId}`);
        return unwrapApiEnvelope(response);
    },

    getAllLogsOfTask: async (taskId: number): Promise<ProjectActivityLog[]> => {
        const response = await api.get(`/api/ProjectActivityLog/task/${taskId}`);
        return unwrapApiEnvelope(response);
    }
};

export const projectDashboardService = {
    getProjectOverview: async (): Promise<ProjectOverviewDashboardResponse> => {
        const response = await api.get(`/api/ProjectDashboard/overview`);
        return unwrapApiEnvelope(response);
    }
};