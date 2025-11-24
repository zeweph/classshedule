/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface CourseEntry {
  id: string;
  course_id: number;
  room_id: number;
  instructor_id: number;
  startTime: string;
  endTime: string;
  color: string;
}

export interface DaySchedule {
  id: string;
  batch: string;
  semester: string;
  department_id: number | undefined;
  section: string;
  day_of_week: string;
  courses: CourseEntry[];
}

export interface SavedSchedule {
  id: string;
  batch: string;
  semester: string;
  section: string;
  department_id?: number;
  days: DaySchedule[];
  created_at: string;
  status: "draft" | "published";
}

export interface Instructor {
  name: any;
  idNumber: any;
  id: number;
  full_name: string;
  department_id?: number;
}

export interface ExistedCourse {
  course_id: number;
  course_code: string;
  course_name: string;
  department_id?: number;
}

// Enhanced Room interface with hierarchy
export interface Room {
  room_id: number;
  floor_id: number;
  room_number: string;
  room_name?: string;
  room_type: string;
  capacity?: number;
  facilities: string[];
  is_available: boolean;
  floor_number: number;
  floor_name?: string;
  block_id: number;
  block_name: string;
  block_code: string;
  location?: string; // Computed field: "MB - Floor 1 - Room 101"
}

export interface Floor {
  floor_id: number;
  block_id: number;
  floor_number: number;
  floor_name?: string;
  description?: string;
  rooms: Room[];
}

export interface Block {
  [x: string]: ReactNode;
  block_id: number;
  block_name: string;
  block_code: string;
  description?: string;
  floors: Floor[];
}

export interface UserSession {
  loggedIn: boolean;
  user?: {
    id: number;
    full_name: string;
    username: string;
    email: string;
    role: string;
    status: string;
    department_id: number | undefined;
    department_name: string;
  };
}

// New interfaces for BatchSemesterSelector
export interface Schedule {
  id: number;
  day_of_week: string;
  course_name: string;
  course_code: string;
  instructor_name: string;
  room: string;
  start_time: string;
  end_time: string;
  department_id?: number;
  department_name?: string;
  batch: string;
  semester: string;
  section: string;
  block_name?: string;
  block_code?: string;
  floor_number?: number;
  room_number?: string;
  room_type?: string;
  location?: string;
}

export interface Department {
  department_id: number;
  department_name: string;
}

// Today's schedule interface
export interface TodaySchedule {
  id: number;
  course_name: string;
  course_code: string;
  start_time: string;
  end_time: string;
  location: string;
  block_name: string;
  block_code: string;
  floor_number: number;
  floor_name?: string;
  room_number: string;
  room_type: string;
  day_of_week: string;
  instructor_name: string;
  department_name: string;
  batch: string;
  semester: string;
  section: string;
}

interface ScheduleState {
  schedules: SavedSchedule[];
  currentSchedule: {
    batch: string;
    semester: string;
    section: string;
    day: string;
    courses: CourseEntry[];
    days: DaySchedule[];
    department_id?: number;
  };
  instructors: Instructor[];
  courses: ExistedCourse[];
  rooms: Room[];
  blocks: Block[]; // New: Room hierarchy
  session: UserSession | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  
  // New state for BatchSemesterSelector
  batchSchedules: Schedule[];
  departments: Department[];
  deptLoading: boolean;
  selectedFilters: {
    department: string;
    batch: string;
    semester: string;
    section: string;
  };

  // Today's schedule state
  todaySchedules: TodaySchedule[];
  todayLoading: boolean;

  // Room hierarchy state
  roomHierarchy: Block[];
  roomHierarchyLoading: boolean;
}

const initialState: ScheduleState = {
  schedules: [],
  currentSchedule: {
    batch: "",
    semester: "",
    section: "",
    day: "",
    courses: [{
      id: generateId(),
      course_id: 0,
      room_id: 0,
      instructor_id: 0,
      startTime: "08:00",
      endTime: "09:00",
      color: "#3b82f6",
    }],
    days: [],
    department_id: undefined,
  },
  instructors: [],
  courses: [],
  rooms: [],
  blocks: [],
  session: null,
  loading: false,
  error: null,
  submitting: false,
  
  // New initial state for BatchSemesterSelector
  batchSchedules: [],
  departments: [],
  deptLoading: false,
  selectedFilters: {
    department: "",
    batch: "",
    semester: "",
    section: "",
  },

  // Today's schedule initial state
  todaySchedules: [],
  todayLoading: false,

  // Room hierarchy initial state
  roomHierarchy: [],
  roomHierarchyLoading: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Async thunks for existing functionality
export const fetchSchedules = createAsyncThunk(
  'schedule/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/schedules`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstructors = createAsyncThunk(
  'schedule/fetchInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/users/ad_in`);
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourses = createAsyncThunk(
  'schedule/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/courses`);
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Enhanced fetchRooms with hierarchy
export const fetchRooms = createAsyncThunk(
  'schedule/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      
      // Transform rooms to include location information
      const roomsWithLocation = data.map((room: any) => ({
        ...room,
        location: `${room.block_code} - Floor ${room.floor_number} - Room ${room.room_number}`,
      }));
      
      return roomsWithLocation;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// In your scheduleSlice.ts - Add these missing async thunks
export const fetchRoomHierarchy = createAsyncThunk(
  'schedule/fetchRoomHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/schedules/rooms/hierarchy`);
      if (!response.ok) throw new Error('Failed to fetch room hierarchy');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTodaySchedule = createAsyncThunk(
  'schedule/fetchTodaySchedule',
  async (day?: string,) => {
    try {
      const url = day ? `${API_URL}/api/schedules/today?day=${day}` : `${API_URL}/api/schedules/today`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch today\'s schedule');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return (error.message);
    }
  }
);

export const fetchSession = createAsyncThunk(
  'schedule/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveSchedule = createAsyncThunk(
  'schedule/saveSchedule',
  async ({ scheduleData, publish }: { scheduleData: any; publish: boolean }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scheduleData,
          status: publish ? "published" : "draft"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save schedule');
      }
  
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save schedule');
    } 
  }
);

export const updateSchedule = createAsyncThunk(
  'schedule/updateSchedule',
  async ({ scheduleId, scheduleData, publish }: { 
    scheduleId: string; 
    scheduleData: any; 
    publish: boolean 
  }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...scheduleData,
          status: publish ? "published" : "draft"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update schedule');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSchedule = createAsyncThunk(
  'schedule/deleteSchedule',
  async (scheduleId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      return scheduleId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleScheduleStatus = createAsyncThunk(
  'schedule/toggleScheduleStatus',
  async ({ scheduleId, currentStatus }: { 
    scheduleId: string; 
    currentStatus: string 
  }, { rejectWithValue }) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const response = await fetch(`${API_URL}/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule status');
      }

      return { scheduleId, newStatus };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// NEW: Async thunks for BatchSemesterSelector
export const fetchDepartments = createAsyncThunk(
  'schedule/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/departments`);
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch departments');
    }
  }
);

export const fetchBatchSchedules = createAsyncThunk(
  'schedule/fetchBatchSchedules',
  async (filters: { batch: string; semester: string; section: string; department_id: string }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.batch) params.append('batch', filters.batch);
      if (filters.semester) params.append('semester', filters.semester);
      if (filters.section) params.append('section', filters.section);
      if (filters.department_id) params.append('department_id', filters.department_id);

      const response = await fetch(`${API_URL}/api/schedules/batch?${params}`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch schedules');
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setBatch: (state, action: PayloadAction<string>) => {
      state.currentSchedule.batch = action.payload;
    },
    setSemester: (state, action: PayloadAction<string>) => {
      state.currentSchedule.semester = action.payload;
    },
    setSection: (state, action: PayloadAction<string>) => {
      state.currentSchedule.section = action.payload;
    },
    setDay: (state, action: PayloadAction<string>) => {
      state.currentSchedule.day = action.payload;
    },
    setCourses: (state, action: PayloadAction<CourseEntry[]>) => {
      state.currentSchedule.courses = action.payload;
    },
    setDays: (state, action: PayloadAction<DaySchedule[]>) => {
      state.currentSchedule.days = action.payload;
    },
    setDepartmentId: (state, action: PayloadAction<number | undefined>) => {
      state.currentSchedule.department_id = action.payload;
    },
    addCourse: (state) => {
      const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      state.currentSchedule.courses.push({
        id: generateId(),
        course_id: 0,
        room_id: 0,
        instructor_id: 0,
        startTime: "08:00",
        endTime: "09:00",
        color: randomColor,
      });
    },
    removeCourse: (state, action: PayloadAction<number>) => {
      if (state.currentSchedule.courses.length > 1) {
        state.currentSchedule.courses = state.currentSchedule.courses.filter((_, i) => i !== action.payload);
      }
    },
    updateCourse: (state, action: PayloadAction<{ index: number; field: string; value: any }>) => {
      const { index, field, value } = action.payload;
      if (state.currentSchedule.courses[index]) {
        (state.currentSchedule.courses[index] as any)[field] = value;
        
        if (field === "startTime") {
          const startTime = new Date(`2000-01-01T${value}`);
          startTime.setHours(startTime.getHours() + 1);
          state.currentSchedule.courses[index].endTime = startTime.toTimeString().slice(0, 5);
        }
      }
    },
    addDaySchedule: (state, action: PayloadAction<DaySchedule>) => {
      state.currentSchedule.days.push(action.payload);
    },
    removeDaySchedule: (state, action: PayloadAction<string>) => {
      state.currentSchedule.days = state.currentSchedule.days.filter(day => day.id !== action.payload);
    },
    resetForm: (state) => {
      state.currentSchedule = {
        batch: "",
        semester: "",
        section: "",
        day: "",
        courses: [{
          id: generateId(),
          course_id: 0,
          room_id: 0,
          instructor_id: 0,
          startTime: "08:00",
          endTime: "09:00",
          color: "#3b82f6",
        }],
        days: [],
        department_id: state.session?.user?.department_id,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
    setEditingSchedule: (state, action: PayloadAction<SavedSchedule | null>) => {
      if (action.payload) {
        state.currentSchedule = {
          batch: action.payload.batch,
          semester: action.payload.semester,
          section: action.payload.section,
          day: "",
          courses: [{
            id: generateId(),
            course_id: 0,
            room_id: 0,
            instructor_id: 0,
            startTime: "08:00",
            endTime: "09:00",
            color: "#3b82f6",
          }],
          days: action.payload.days || [],
          department_id: action.payload.department_id,
        };
      } else {
        state.currentSchedule = {
          batch: "",
          semester: "",
          section: "",
          day: "",
          courses: [{
            id: generateId(),
            course_id: 0,
            room_id: 0,
            instructor_id: 0,
            startTime: "08:00",
            endTime: "09:00",
            color: "#3b82f6",
          }],
          days: [],
          department_id: state.session?.user?.department_id,
        };
      }
    },

    // NEW: Reducers for BatchSemesterSelector
    setBatchFilters: (state, action: PayloadAction<Partial<ScheduleState['selectedFilters']>>) => {
      state.selectedFilters = { ...state.selectedFilters, ...action.payload };
    },
    clearBatchSchedules: (state) => {
      state.batchSchedules = [];
    },
    resetBatchFilters: (state) => {
      state.selectedFilters = initialState.selectedFilters;
    },

    // NEW: Filter rooms by department
    filterRoomsByDepartment: (state, action: PayloadAction<number | undefined>) => {
      if (!action.payload) {
        // Reset to all rooms if no department specified
        state.rooms = state.rooms;
      } else {
        // Filter rooms by department (you might need to adjust this based on your data structure)
        state.rooms = state.rooms.filter(room => 
          room.department_id === action.payload
        );
      }
    },

    // NEW: Clear today's schedules
    clearTodaySchedules: (state) => {
      state.todaySchedules = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch schedules (existing)
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.schedules = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch instructors
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.instructors = action.payload;
      })
      // Fetch courses
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      // Fetch rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch room hierarchy
      .addCase(fetchRoomHierarchy.pending, (state) => {
        state.roomHierarchyLoading = true;
      })
      .addCase(fetchRoomHierarchy.fulfilled, (state, action) => {
        state.roomHierarchyLoading = false;
        state.roomHierarchy = action.payload;
        // Also extract blocks from hierarchy
        state.blocks = action.payload;
      })
      .addCase(fetchRoomHierarchy.rejected, (state, action) => {
        state.roomHierarchyLoading = false;
        state.error = action.payload as string;
      })
      // Fetch today's schedule
      .addCase(fetchTodaySchedule.pending, (state) => {
        state.todayLoading = true;
      })
      .addCase(fetchTodaySchedule.fulfilled, (state, action) => {
        state.todayLoading = false;
        state.todaySchedules = action.payload;
      })
      .addCase(fetchTodaySchedule.rejected, (state, action) => {
        state.todayLoading = false;
        state.error = action.payload as string;
      })
      // Fetch session
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.session = action.payload;
        // Set department_id from session if available
        if (action.payload.user?.department_id) {
          state.currentSchedule.department_id = action.payload.user.department_id;
        }
      })
      // Save schedule
      .addCase(saveSchedule.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(saveSchedule.fulfilled, (state) => {
        state.submitting = false;
        state.currentSchedule = {
          batch: "",
          semester: "",
          section: "",
          day: "",
          courses: [{
            id: generateId(),
            course_id: 0,
            room_id: 0,
            instructor_id: 0,
            startTime: "08:00",
            endTime: "09:00",
            color: "#3b82f6",
          }],
          days: [],
          department_id: state.session?.user?.department_id,
        };
      })
      .addCase(saveSchedule.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Update schedule
      .addCase(updateSchedule.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateSchedule.fulfilled, (state) => {
        state.submitting = false;
        state.currentSchedule = {
          batch: "",
          semester: "",
          section: "",
          day: "",
          courses: [{
            id: generateId(),
            course_id: 0,
            room_id: 0,
            instructor_id: 0,
            startTime: "08:00",
            endTime: "09:00",
            color: "#3b82f6",
          }],
          days: [],
          department_id: state.session?.user?.department_id,
        };
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Delete schedule
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(schedule => schedule.id !== action.payload);
      })
      // Toggle schedule status
      .addCase(toggleScheduleStatus.fulfilled, (state, action) => {
        const { scheduleId, newStatus } = action.payload;
        const schedule = state.schedules.find(s => s.id === scheduleId);
        if (schedule) {
          schedule.status = newStatus as "draft" | "published";
        }
      })
      // NEW: Fetch departments for BatchSemesterSelector
      .addCase(fetchDepartments.pending, (state) => {
        state.deptLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.deptLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.deptLoading = false;
        state.error = action.payload as string;
      })
      // NEW: Fetch batch schedules for BatchSemesterSelector
      .addCase(fetchBatchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.batchSchedules = action.payload;
      })
      .addCase(fetchBatchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.batchSchedules = [];
      });
  },
});

export const {
  setBatch,
  setSemester,
  setSection,
  setDay,
  setCourses,
  setDays,
  setDepartmentId,
  addCourse,
  removeCourse,
  updateCourse,
  addDaySchedule,
  removeDaySchedule,
  resetForm,
  clearError,
  setEditingSchedule,
  // NEW: Export BatchSemesterSelector actions
  setBatchFilters,
  clearBatchSchedules,
  resetBatchFilters,
  // NEW: Export room filtering actions
  filterRoomsByDepartment,
  clearTodaySchedules,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;

const colorPalette = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];