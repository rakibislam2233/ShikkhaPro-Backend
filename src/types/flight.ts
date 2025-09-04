import { IFlightData } from '../models/flight/flight.interface';
import { IDisruptionDetails } from './../models/compensation/compensation.interface';

export interface IVerifyFlightPayload {
  flights: IFlightData[];
  disruptionDetails?: IDisruptionDetails;
  isDirectFlight?: boolean;
}

// FlightAware AeroAPI specific types
export interface IFlightAwareConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  cacheExpiry: number; // in hours
}

export interface IFlightAwareError {
  code: string;
  message: string;
  details?: any;
}

// FlightAware API Response wrapper
export interface IFlightAwareResponse<T> {
  data: T;
  num_pages?: number;
  links?: {
    next?: string;
    previous?: string;
  };
}

// Flight search and tracking types
export interface IFlightSearchQuery {
  ident?: string; // Flight identifier (e.g., "UAL123")
  start?: string; // ISO 8601 datetime
  end?: string; // ISO 8601 datetime
  max_pages?: number;
  cursor?: string;
}

export interface IFlightScheduleQuery {
  ident: string; // Flight identifier
  start?: string; // ISO 8601 date
  end?: string; // ISO 8601 date
  max_pages?: number;
  cursor?: string;
}

export interface IAirportQuery {
  code?: string; // ICAO or IATA code
  type?: 'iata' | 'icao';
  max_pages?: number;
  cursor?: string;
}

export interface IAirlineQuery {
  icao?: string; // ICAO code
  iata?: string; // IATA code
  max_pages?: number;
  cursor?: string;
}