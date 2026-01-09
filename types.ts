
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface OfficeConfig {
  name: string;
  location: GeoLocation;
  address: string;
  radius: number; // in meters
}

export interface AttendanceRecord {
  id: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  location: GeoLocation;
  isAuto: boolean;
}

export interface UserState {
  isConfigured: boolean;
  office: OfficeConfig | null;
  history: AttendanceRecord[];
}

export interface AIResponse {
  text: string;
  groundingUrls?: { title: string; uri: string }[];
}
