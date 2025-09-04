import mongoose from 'mongoose';

export interface IActivityLog {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  method: string;
  endpoint: string;
  ip: string;
  userAgent: string;
  status: IActivityLogStatus;
  details: any;
  timestamp: Date;
}

export enum IActivityLogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
}
