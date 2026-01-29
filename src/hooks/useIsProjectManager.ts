import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../constants/roles';

/**
 * Custom hook to check if the current user is a Project Manager
 * @returns {boolean} - true if user has Project Manager or Admin role
 */
export function useIsProjectManager(): boolean {
    const { roles } = useAuth();

    return useMemo(() => {
        if (!roles || roles.length === 0) {
            return false;
        }

        // Admin and Project Manager have project management rights
        return roles.includes(UserRole.PROJECT_MANAGER); //roles.includes(UserRole.ADMIN) || 

    }, [roles]);
}

/**
 * Custom hook to check if user has a specific role
 * @param {string} roleName - The role name to check
 * @returns {boolean} - true if user has the specified role
 */
export function useHasRole(roleName: string): boolean {
    const { roles } = useAuth();

    return useMemo(() => {
        if (!roles || roles.length === 0) {
            return false;
        }

        return roles.includes(roleName);
    }, [roles, roleName]);
}
