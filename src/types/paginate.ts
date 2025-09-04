export interface IPaginateOptions {
  limit?: number;
  page?: number;
  sortBy?: string;
  select?: string;
  populate?: any; 
  sortOrder?: number;
}

export interface IPaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
