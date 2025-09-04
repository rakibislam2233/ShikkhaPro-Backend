import { IActivityLogStatus } from './activityLog.interface';
import { ActivityLog } from './activityLog.model';

// Log activity
const logActivity = async (data: {
  userId?: string;
  action: string;
  resource: string;
  method: string;
  endpoint: string;
  ip: string;
  userAgent: string;
  status: IActivityLogStatus;
  details?: any;
}): Promise<void> => {
  await ActivityLog.create({
    userId: data.userId,
    action: data.action,
    resource: data.resource,
    method: data.method,
    endpoint: data.endpoint,
    ip: data.ip,
    userAgent: data.userAgent,
    status: data.status,
    details: data.details,
    timestamp: new Date(),
  });
};

export const ActivityLogService = {
  logActivity,
};
