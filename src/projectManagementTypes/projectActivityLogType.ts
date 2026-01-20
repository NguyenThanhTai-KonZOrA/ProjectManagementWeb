export interface ProjectActivityLog {
    id: number;
    memberAction: string;
    actionType: string;
    entityId: number;
    details: string;
    timestamp: Date;
}