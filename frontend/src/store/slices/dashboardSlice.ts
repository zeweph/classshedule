/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TodaySchedule {
  id: number;
  course_name: string;
  course_code: string;
  start_time: string;
  end_time: string;
  room: string;
  day_of_week: string;
  instructor_name: string;
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  category: string;
}

interface DashboardState {
  todaySchedules: TodaySchedule[];
  announcements: Announcement[];
  scheduleLoading: boolean;
  announcementsLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  todaySchedules: [],
  announcements: [],
  scheduleLoading: false,
  announcementsLoading: false,
  error: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Async thunks
export const fetchTodaySchedule = createAsyncThunk(
  'dashboard/fetchTodaySchedule',
  async () => {
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const response = await fetch(`${API_URL}/api/schedules/today/${today}`);
      
      if (!response.ok) throw new Error('Failed to fetch today\'s schedule');
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Return mock data for development
      const mockData: TodaySchedule[] = [
        {
          id: 1,
          course_name: "Mathematics 101",
          course_code: "MATH101",
          start_time: "09:00",
          end_time: "10:30",
          room: "Room 101",
          day_of_week: "monday",
          instructor_name: "Dr. Smith"
        },
        {
          id: 2,
          course_name: "Physics 201",
          course_code: "PHY201",
          start_time: "11:00",
          end_time: "12:30",
          room: "Room 202",
          day_of_week: "monday",
          instructor_name: "Dr. Johnson"
        }
      ];
      return mockData;
    }
  }
);

export const fetchAnnouncements = createAsyncThunk(
  'dashboard/fetchAnnouncements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/announcements`);
      
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      return data;
    } catch (error: any) {
      // Return mock data for development
      const mockData: Announcement[] = [
        {
          id: 1,
          title: "Important: Faculty Meeting",
          message: "There will be a faculty meeting this Friday at 3 PM in the main auditorium.",
          created_at: "2024-01-15T10:00:00Z",
          priority: "high",
          is_read: false,
          category: "general"
        },
        {
          id: 2,
          title: "New Course Materials Available",
          message: "Course materials for the spring semester are now available on the portal.",
          created_at: "2024-01-14T14:30:00Z",
          priority: "medium",
          is_read: false,
          category: "academic"
        }
      ];
      return mockData;
    }
  }
);

export const markAnnouncementAsRead = createAsyncThunk(
  'dashboard/markAnnouncementAsRead',
  async (announcementId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/announcements/${announcementId}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error('Failed to mark announcement as read');
      return announcementId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshDashboardData = createAsyncThunk(
  'dashboard/refreshDashboardData',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchTodaySchedule()),
      dispatch(fetchAnnouncements())
    ]);
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addAnnouncement: (state, action: PayloadAction<Announcement>) => {
      state.announcements.unshift(action.payload);
    },
    removeAnnouncement: (state, action: PayloadAction<number>) => {
      state.announcements = state.announcements.filter(ann => ann.id !== action.payload);
    },
    clearTodaySchedules: (state) => {
      state.todaySchedules = [];
    },
    clearAnnouncements: (state) => {
      state.announcements = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today's schedule
      .addCase(fetchTodaySchedule.pending, (state) => {
        state.scheduleLoading = true;
        state.error = null;
      })
      .addCase(fetchTodaySchedule.fulfilled, (state, action) => {
        state.scheduleLoading = false;
        state.todaySchedules = action.payload;
      })
      .addCase(fetchTodaySchedule.rejected, (state, action) => {
        state.scheduleLoading = false;
        state.error = action.payload as string;
      })
      // Fetch announcements
      .addCase(fetchAnnouncements.pending, (state) => {
        state.announcementsLoading = true;
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcementsLoading = false;
        state.announcements = action.payload;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.announcementsLoading = false;
        state.error = action.payload as string;
      })
      // Mark announcement as read
      .addCase(markAnnouncementAsRead.fulfilled, (state, action) => {
        const announcement = state.announcements.find(ann => ann.id === action.payload);
        if (announcement) {
          announcement.is_read = true;
        }
      });
  },
});

export const {
  clearError,
  addAnnouncement,
  removeAnnouncement,
  clearTodaySchedules,
  clearAnnouncements,
} = dashboardSlice.actions;

// Selectors
export const selectTodaySchedules = (state: { dashboard: DashboardState }) => 
  state.dashboard.todaySchedules;

export const selectAnnouncements = (state: { dashboard: DashboardState }) => 
  state.dashboard.announcements;

export const selectUnreadAnnouncements = (state: { dashboard: DashboardState }) => 
  state.dashboard.announcements.filter(ann => !ann.is_read);

export const selectScheduleLoading = (state: { dashboard: DashboardState }) => 
  state.dashboard.scheduleLoading;

export const selectAnnouncementsLoading = (state: { dashboard: DashboardState }) => 
  state.dashboard.announcementsLoading;

export const selectDashboardError = (state: { dashboard: DashboardState }) => 
  state.dashboard.error;

export const selectDashboardLoading = (state: { dashboard: DashboardState }) => 
  state.dashboard.scheduleLoading || state.dashboard.announcementsLoading;

export default dashboardSlice.reducer;