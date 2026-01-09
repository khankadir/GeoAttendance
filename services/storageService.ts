
import { UserState, AttendanceRecord, OfficeConfig } from '../types';
import { DB_KEY } from '../constants';

const initialState: UserState = {
  isConfigured: false,
  office: null,
  history: []
};

export const storageService = {
  getData: (): UserState => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : initialState;
  },

  saveOffice: (office: OfficeConfig): void => {
    const data = storageService.getData();
    data.office = office;
    data.isConfigured = true;
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  addRecord: (record: AttendanceRecord): void => {
    const data = storageService.getData();
    data.history.unshift(record);
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  clearData: (): void => {
    localStorage.removeItem(DB_KEY);
  }
};
