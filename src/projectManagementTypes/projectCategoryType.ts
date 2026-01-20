export interface ProjectCategoryCreateOrUpdateRequest {
    name: string;
    displayName: string;
    description?: string;
    icon: string;
    iconUrl: string;
    displayOrder: number;
}

export interface ProjectCategoryResponse {
    id: number;
    name: string;
    displayName: string;
    description?: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    projectCount: number;
    iconUrl: string;
}