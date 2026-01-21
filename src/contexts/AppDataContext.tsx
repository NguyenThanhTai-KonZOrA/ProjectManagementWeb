import React, { createContext, useContext, useState, useEffect } from "react";
import {
    projectManagementService,
    projectMemberService,
    projectPriorityService,
    projectStatusService,
} from "../services/projectManagementService";
import type { ProjectSummaryResponse } from "../projectManagementTypes/projectType";
import type { MemberByEmployeeResponse } from "../projectManagementTypes/projectMember";
import type { ProjectPriorityResponse } from "../projectManagementTypes/projectPriorityType";
import type { ProjectStatusResponse } from "../projectManagementTypes/projectStatusType";

interface AppDataContextType {
    projectsSummary: ProjectSummaryResponse[];
    members: MemberByEmployeeResponse[];
    priorities: ProjectPriorityResponse[];
    statuses: ProjectStatusResponse[];
    isLoading: boolean;
    error: string | null;
    reloadData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projectsSummary, setProjectsSummary] = useState<ProjectSummaryResponse[]>([]);
    const [members, setMembers] = useState<MemberByEmployeeResponse[]>([]);
    const [priorities, setPriorities] = useState<ProjectPriorityResponse[]>([]);
    const [statuses, setStatuses] = useState<ProjectStatusResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load all data in parallel
            const [projectsData, membersData, prioritiesData, statusesData] = await Promise.all([
                projectManagementService.getProjectsSummary(),
                projectMemberService.getAllMembers(),
                projectPriorityService.getAllPriorities(),
                projectStatusService.getAllStatuses(),
            ]);

            setProjectsSummary(projectsData);
            setMembers(membersData);
            setPriorities(prioritiesData);
            setStatuses(statusesData);
        } catch (err: any) {
            console.error("Error loading app data:", err);
            setError(err?.response?.data?.message || "Failed to load application data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only load data if user is authenticated
        const token = localStorage.getItem("token");
        if (token) {
            loadData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const reloadData = async () => {
        await loadData();
    };

    return (
        <AppDataContext.Provider
            value={{
                projectsSummary,
                members,
                priorities,
                statuses,
                isLoading,
                error,
                reloadData,
            }}
        >
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (context === undefined) {
        throw new Error("useAppData must be used within an AppDataProvider");
    }
    return context;
};
