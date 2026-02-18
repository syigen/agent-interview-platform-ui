import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Run, ChatStep } from '../../types';

interface RunState {
  items: Run[];
}

const initialState: RunState = {
  items: [],
};

export const runSlice = createSlice({
  name: 'runs',
  initialState,
  reducers: {
    addRun: (state, action: PayloadAction<Run>) => {
      state.items.unshift(action.payload);
    },
    updateRunStatus: (state, action: PayloadAction<{ id: string; status: Run['status']; score?: number; steps?: ChatStep[] }>) => {
      const index = state.items.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    }
  },
});

export const { addRun, updateRunStatus } = runSlice.actions;
export default runSlice.reducer;
