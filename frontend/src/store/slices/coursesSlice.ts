/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  credit_hour: number;
  category: string; // ✅ Fixed spelling
}

interface CoursesState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  editingCourse: Course | null;
  submitting: boolean;
}

const initialState: CoursesState = {
  courses: [],
  loading: false,
  error: null,
  editingCourse: null,
  submitting: false,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
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

export const addCourse = createAsyncThunk(
  'courses/addCourse',
  async (courseData: Omit<Course, 'course_id'>, { rejectWithValue }) => {
    try {
      console.log('Sending course data:', courseData);
      console.log('API URL:', `${API_URL}/api/courses`);
      
      const response = await fetch(`${API_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        let errorMessage = 'Failed to add course';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const newCourse = await response.json();
      console.log('Success response:', newCourse);
      return newCourse;
    } catch (error: any) {
      console.error('Add course error:', error);
      return rejectWithValue(error.message);
    }
  }
);
export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async (courseData: Course, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseData.course_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      return updatedCourse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while updating course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete course');
      }

      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'An error occurred while deleting course');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setEditingCourse: (state, action: PayloadAction<Course | null>) => {
      state.editingCourse = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSubmitting: (state) => {
      state.submitting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add course
      .addCase(addCourse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.submitting = false;
        state.courses.push(action.payload);
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.submitting = false;
        state.courses = state.courses.map(course => 
          course.course_id === action.payload.course_id ? action.payload : course
        );
        state.editingCourse = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.submitting = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<number>) => {
        state.submitting = false;
        state.courses = state.courses.filter(course => course.course_id !== action.payload);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEditingCourse, clearError, resetSubmitting } = coursesSlice.actions;
export default coursesSlice.reducer;