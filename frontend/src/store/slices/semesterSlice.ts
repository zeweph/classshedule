import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Semester {
  id: number;
  semester: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: string;
  department_id: number;
  department_name: string;
  batch_id: number;
}

export interface SemesterFormData {
  semester: string;
  batch_id: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  department_id: number;
  status?: string;
}

interface SemesterState {
  semesters: Semester[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  currentSemester: Semester | null;
}

const initialState: SemesterState = {
  semesters: [],
  loading: false,
  error: null,
  successMessage: null,
  currentSemester: null,
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to handle errors
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Async Thunks
export const fetchSemesters = createAsyncThunk(
  'semesters/fetchSemesters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/semesters`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch semesters');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const createSemester = createAsyncThunk(
  'semesters/createSemester',
  async (semesterData: SemesterFormData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/semesters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semesterData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create semester');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateSemester = createAsyncThunk(
  'semesters/updateSemester',
  async ({ semesterId, semesterData }: { semesterId: number; semesterData: Partial<SemesterFormData> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/semesters/${semesterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(semesterData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update semester');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const deleteSemester = createAsyncThunk(
  'semesters/deleteSemester',
  async (semesterId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/semesters/${semesterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete semester');
      }
      
      return { semesterId };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const semesterSlice = createSlice({
  name: 'semesters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentSemester: (state, action) => {
      state.currentSemester = action.payload;
    },
    clearCurrentSemester: (state) => {
      state.currentSemester = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch semesters
      .addCase(fetchSemesters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSemesters.fulfilled, (state, action) => {
        state.loading = false;
        state.semesters = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchSemesters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create semester
      .addCase(createSemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSemester.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.semesters.push(action.payload.data);
        }
        state.successMessage = 'Semester created successfully';
        state.error = null;
      })
      .addCase(createSemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update semester
      .addCase(updateSemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSemester.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSemester = action.payload.data;
        if (updatedSemester) {
          const index = state.semesters.findIndex(semester => semester.id === updatedSemester.id);
          if (index !== -1) {
            state.semesters[index] = updatedSemester;
          }
        }
        state.successMessage = 'Semester updated successfully';
        state.error = null;
      })
      .addCase(updateSemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete semester
      .addCase(deleteSemester.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSemester.fulfilled, (state, action) => {
        state.loading = false;
        state.semesters = state.semesters.filter(semester => semester.id !== action.payload.semesterId);
        state.successMessage = 'Semester deleted successfully';
        state.error = null;
      })
      .addCase(deleteSemester.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setCurrentSemester, clearCurrentSemester } = semesterSlice.actions;

// Selectors
export const selectSemesters = (state: { semesters: SemesterState }) => state.semesters.semesters;
export const selectSemestersLoading = (state: { semesters: SemesterState }) => state.semesters.loading;
export const selectSemestersError = (state: { semesters: SemesterState }) => state.semesters.error;
export const selectSemestersSuccessMessage = (state: { semesters: SemesterState }) => state.semesters.successMessage;
export const selectCurrentSemester = (state: { semesters: SemesterState }) => state.semesters.currentSemester;

export default semesterSlice.reducer;