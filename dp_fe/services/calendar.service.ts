import { axiosInstance } from '@/lib/axios';

export interface OrganizationCalendarEntry {
  id?: string;
  _id?: string;
  date: string | Date;
  type: 'Normal' | 'Sunday' | 'PublicHoliday' | 'OrganizationalHoliday' | 'SpecialEvent' | 'SpecialDay' | 'Competition';
  label: string;
  source?: 'organization' | 'event' | 'exam' | 'competition';
  startTime?: string;
  endTime?: string;
  metadata?: any;
}

export const calendarService = {
  async getCalendarRange(startDate?: string, endDate?: string): Promise<OrganizationCalendarEntry[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axiosInstance.get(`/organization-calendar?${params.toString()}`);
    return response.data.data;
  },

  async upsertDayConfig(data: OrganizationCalendarEntry): Promise<OrganizationCalendarEntry> {
    const response = await axiosInstance.post('/organization-calendar', data);
    return response.data.data;
  },

  async deleteDayConfig(date: string): Promise<{ deleted: boolean }> {
    const response = await axiosInstance.delete(`/organization-calendar?date=${date}`);
    return response.data.data;
  },
};
