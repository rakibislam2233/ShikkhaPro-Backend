import mongoose, { Schema } from 'mongoose';
import { IActivityLogStatus, IActivityLog } from './activityLog.interface';

const activityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  method: { type: String, required: true },
  endpoint: { type: String, required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(IActivityLogStatus),
    required: true,
  },
  details: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// Indexes
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, status: 1, timestamp: -1 });
activityLogSchema.index({ ip: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);
