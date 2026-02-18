import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Run, ChatStep } from '../../types';
import { runService } from '../../services/RunService';

interface RunState {
  items: Run[];
  loading: boolean;
  error: string | null;
}

const initialState: RunState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchRuns = createAsyncThunk(
  'runs/fetchRuns',
  async (_, { rejectWithValue }) => {
    try {
      return await runService.getRuns();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch runs');
    }
  }
);

export const createRun = createAsyncThunk(
  'runs/createRun',
  async (runData: Partial<Run>, { rejectWithValue }) => {
    try {
      return await runService.createRun(runData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create run');
    }
  }
);

export const updateRunStatus = createAsyncThunk(
  'runs/updateRunStatus',
  async ({ id, ...data }: { id: string } & Partial<Run>, { rejectWithValue }) => {
    try {
      // If we are just updating local status for simulation, we might not want to hit API?
      // But the goal is to connect to API.
      // However, the simulation runs might not exist on backend yet if created purely client side?
      // For now, let's assume we want to persist updates.
      return await runService.updateRun(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update run');
    }
  }
);

export const runSlice = createSlice({
  name: 'runs',
  initialState,
  reducers: {
    addRun: (state, action: PayloadAction<Run>) => {
      state.items.unshift(action.payload);
    },
    // Keep local update for simulation steps that might not be persisted step-by-step to backend yet
    updateRunLocal: (state, action: PayloadAction<{ id: string; status: Run['status']; score?: number; steps?: ChatStep[] }>) => {
      const index = state.items.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRuns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRuns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRuns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createRun.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateRunStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { addRun, updateRunLocal } = runSlice.actions;
export default runSlice.reducer;
