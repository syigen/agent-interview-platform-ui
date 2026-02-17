import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Run, ChatStep } from '../../types';

interface RunState {
  items: Run[];
}

const initialState: RunState = {
  items: [
    { id: 'RUN-3920', agentId: 'AGT-774', agentName: 'Support-Genius-v2', timestamp: 'Just now', status: 'running' },
    { id: 'RUN-3919', agentId: 'AGT-882', agentName: 'Market-Analyst-Pro', timestamp: '12 mins ago', status: 'pass', score: 94, isCertified: true },
    { id: 'RUN-3918', agentId: 'AGT-104', agentName: 'Code-Refactor-Bot', timestamp: '45 mins ago', status: 'fail', score: 62 },
    { id: 'RUN-3917', agentId: 'AGT-774', agentName: 'Support-Genius-v2', timestamp: '2 hours ago', status: 'pass', score: 88, isCertified: true },
    { id: 'RUN-3916', agentId: 'AGT-991', agentName: 'Legal-Doc-Reviewer', timestamp: '5 hours ago', status: 'pass', score: 91, isCertified: true },
    { id: 'RUN-3915', agentId: 'AGT-332', agentName: 'Translation-Matrix-X', timestamp: '1 day ago', status: 'pass', score: 97, isCertified: true },
    { id: 'RUN-3914', agentId: 'AGT-882', agentName: 'Market-Analyst-Pro', timestamp: '1 day ago', status: 'fail', score: 45 },
    { id: 'RUN-3913', agentId: 'AGT-104', agentName: 'Code-Refactor-Bot', timestamp: '2 days ago', status: 'pass', score: 85, isCertified: true },
    { id: 'RUN-3912', agentId: 'AGT-551', agentName: 'Ethical-Constraint-v1', timestamp: '3 days ago', status: 'pass', score: 100, isCertified: true },
    { id: 'RUN-3911', agentId: 'AGT-003', agentName: 'Chaos-Monkey-Agent', timestamp: '4 days ago', status: 'fail', score: 12 },
  ],
};

export const runSlice = createSlice({
  name: 'runs',
  initialState,
  reducers: {
    addRun: (state, action: PayloadAction<Run>) => {
      state.items.unshift(action.payload);
    },
    updateRunStatus: (state, action: PayloadAction<{ id: string; status?: Run['status']; score?: number; steps?: ChatStep[]; isCertified?: boolean }>) => {
        const index = state.items.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
        }
    }
  },
});

export const { addRun, updateRunStatus } = runSlice.actions;
export default runSlice.reducer;