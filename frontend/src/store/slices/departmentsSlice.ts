/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/slices/departmentsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Department {
  department_id: number;
  department_name: string;
  head_id?: number | null;
  head_name?: string | null;
}

export interface DepartmentHistory extends Department {
  lastdate_at: string;
}

export interface Instructor {
  id: number;
  full_name: string;
  department_name?: string;
}

interface DepartmentsState {
  departments: Department[];
  departmentsHistory: DepartmentHistory[];
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DepartmentsState = {
  departments: [],
  departmentsHistory: [],
  instructors: [],
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.departments || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDepartmentsHistory = createAsyncThunk(
  'departments/fetchDepartmentsHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/departments/his');
      if (!response.ok) {
        throw new Error('Failed to fetch departments history');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.departments_his || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInstructors = createAsyncThunk(
  'departments/fetchInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/instructors');
      if (!response.ok) {
        throw new Error('Failed to fetch instructors');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addDepartment = createAsyncThunk(
  'departments/addDepartment',
  async (departmentName: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_name: departmentName.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add department');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/updateDepartment',
  async ({ id, departmentName }: { id: number; departmentName: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ department_name: departmentName.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/deleteDepartment',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete department');
      }
      
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const assignDepartmentHead = createAsyncThunk(
  'departments/assignDepartmentHead',
  async ({ departmentId, instructorId }: { departmentId: number; instructorId: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/departments/${departmentId}/head`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ head_id: instructorId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign department head');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Departments
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
        state.error = null;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Departments History
      .addCase(fetchDepartmentsHistory.fulfilled, (state, action) => {
        state.departmentsHistory = action.payload;
      })
      // Fetch Instructors
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.instructors = action.payload;
      })
      // Add Department
      .addCase(addDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments.push(action.payload);
        state.successMessage = 'Department added successfully';
        state.error = null;
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      })
      // Update Department
      .addCase(updateDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.departments.findIndex(dept => dept.department_id === action.payload.department_id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.successMessage = 'Department updated successfully';
        state.error = null;
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      })
      // Delete Department
      .addCase(deleteDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = state.departments.filter(dept => dept.department_id !== action.payload);
        state.successMessage = 'Department deleted successfully';
        state.error = null;
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      })
      // Assign Department Head
      .addCase(assignDepartmentHead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(assignDepartmentHead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.departments.findIndex(dept => dept.department_id === action.payload.department_id);
        if (index !== -1) {
          state.departments[index] = action.payload;
        }
        state.successMessage = 'Department head assigned successfully';
        state.error = null;
      })
      .addCase(assignDepartmentHead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.successMessage = null;
      });
  },
});
export const selectDepartments = (state: { departments: { departments: any; }; }) => state.departments.departments;
export const selectDepartmentsLoading = (state: { departments: { loading: any; }; }) => state.departments.loading;
export const selectDepartmentsError = (state: { departments: { error: any; }; }) => state.departments.error;
export const selectDepartmentOptions = (state: { departments: { departments: any[]; }; }) => 
  state.departments.departments.map((dept: { department_id: any; department_name: any; }) => ({
    value: String(dept.department_id),
    label: dept.department_name,
  }));
export const { clearError, clearSuccessMessage } = departmentsSlice.actions;
export default departmentsSlice.reducer;