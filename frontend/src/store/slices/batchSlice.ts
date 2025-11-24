/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Batch {
  batch_id: number;
  department_id: number;
  department_name: string;
  batch_year: number;
  created_at: string;
  updated_at: string;
}

// Interface for creating/updating batches (without auto-generated and joined fields)
export interface BatchFormData {
  department_id: number;
  batch_year: number;
}

interface BatchState {
  batches: Batch[];
  currentBatch: Batch | null; // Add currentBatch to the state
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BatchState = {
  batches: [],
  currentBatch: null, // Initialize currentBatch
  loading: false,
  error: null,
  successMessage: null,
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async Thunks
export const fetchBatches = createAsyncThunk(
  'batches/fetchBatches',
  async () => {
    const response = await fetch(`${API_URL}/api/batches`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch batches');
    }
    return response.json();
  }
);

export const fetchBatchById = createAsyncThunk(
  'batches/fetchBatchById',
  async (batchId: number) => {
    const response = await fetch(`${API_URL}/api/batches/${batchId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch batch');
    }
    const data = await response.json();
    return data.data; // Return the batch data directly
  }
);

export const createBatch = createAsyncThunk(
  'batches/createBatch',
  async (batchData: BatchFormData) => {
    const response = await fetch(`${API_URL}/api/batches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create batch');
    }
    
    return response.json();
  }
);

export const updateBatch = createAsyncThunk(
  'batches/updateBatch',
  async ({ batchId, batchData }: { batchId: number; batchData: Partial<BatchFormData> }) => {
    console.log('Updating batch with ID:', batchId);
    
    if (!batchId || isNaN(batchId)) {
      throw new Error('Invalid batch ID');
    }

    const response = await fetch(`${API_URL}/api/batches/${batchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update batch');
    }
    
    return response.json();
  }
);

export const deleteBatch = createAsyncThunk(
  'batches/deleteBatch',
  async (batchId: number) => {
    console.log('Deleting batch with ID:', batchId);
    
    if (!batchId || isNaN(batchId)) {
      throw new Error('Invalid batch ID');
    }

    const response = await fetch(`${API_URL}/api/batches/${batchId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete batch');
    }
    
    return { batchId };
  }
);

const batchesSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentBatch: (state, action) => {
      state.currentBatch = action.payload;
    },
    clearCurrentBatch: (state) => {
      state.currentBatch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch batches
      .addCase(fetchBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload.data;
        state.error = null;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch batches';
      })
      
      // Fetch batch by ID
      .addCase(fetchBatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBatch = action.payload; // Set currentBatch when fetching by ID
        state.error = null;
      })
      .addCase(fetchBatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch batch';
      })
      
      // Create batch
      .addCase(createBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches.push(action.payload.data);
        state.successMessage = 'Batch created successfully';
        state.error = null;
        state.currentBatch = action.payload.data; // Set currentBatch to the newly created batch
      })
      .addCase(createBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create batch';
      })
      
      // Update batch
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBatch = action.payload.data;
        const index = state.batches.findIndex(batch => batch.batch_id === updatedBatch.batch_id);
        if (index !== -1) {
          state.batches[index] = updatedBatch;
        }
        state.currentBatch = updatedBatch; // Update currentBatch with the updated batch
        state.successMessage = 'Batch updated successfully';
        state.error = null;
      })
      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update batch';
      })
      
      // Delete batch
      .addCase(deleteBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = state.batches.filter(batch => batch.batch_id !== action.payload.batchId);
        // Clear currentBatch if it was the deleted batch
        if (state.currentBatch && state.currentBatch.batch_id === action.payload.batchId) {
          state.currentBatch = null;
        }
        state.successMessage = 'Batch deleted successfully';
        state.error = null;
      })
      .addCase(deleteBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete batch';
      });
  },
});

export const { clearError, clearSuccessMessage, setCurrentBatch, clearCurrentBatch } = batchesSlice.actions;

// Selectors
export const selectBatches = (state: { batches: { batches: any; }; }) => state.batches.batches;
export const selectBatchesLoading = (state: { batches: { loading: any; }; }) => state.batches.loading;
export const selectBatchesError = (state: { batches: { error: any; }; }) => state.batches.error;
export const selectBatchesSuccessMessage = (state: { batches: { successMessage: any; }; }) => state.batches.successMessage;
export const selectCurrentBatch = (state: { batches: { currentBatch: any; }; }) => state.batches.currentBatch; // Add selector for currentBatch
export const selectBatchById = (batchId: any) => (state: { batches: { batches: any[]; }; }) => 
  state.batches.batches.find((batch: { batch_id: any; }) => batch.batch_id === batchId);

export default batchesSlice.reducer;