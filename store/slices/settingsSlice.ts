import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  interviewerName: string;
}

const initialState: SettingsState = {
  interviewerName: 'Admin User',
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setInterviewerName: (state, action: PayloadAction<string>) => {
      state.interviewerName = action.payload;
    },
  },
});

export const { setInterviewerName } = settingsSlice.actions;
export default settingsSlice.reducer;
