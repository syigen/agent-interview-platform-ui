import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccessRequest } from '../../types';

interface AccessRequestState {
  items: AccessRequest[];
}

const initialState: AccessRequestState = {
  items: [
    {
        id: 'req-1',
        certificateId: 'CERT-8921-XJY',
        certificateName: 'gpt-4o-mini-custom-v3',
        requesterName: 'Cyberdyne Systems',
        requesterContact: 'compliance@cyberdyne.net',
        message: 'Requiring full audit logs for integration safety check.',
        timestamp: '10 mins ago',
        status: 'unread'
    },
    {
        id: 'req-2',
        certificateId: 'CERT-1102-MKA',
        certificateName: 'Medical-Triage-v2',
        requesterName: 'General Hospital IT',
        requesterContact: 'admin@genhospital.org',
        message: 'Verification of HIPAA compliance benchmarks.',
        timestamp: '2 hours ago',
        status: 'read'
    }
  ],
};

export const accessRequestSlice = createSlice({
  name: 'accessRequests',
  initialState,
  reducers: {
    addRequest: (state, action: PayloadAction<Omit<AccessRequest, 'id' | 'timestamp' | 'status'>>) => {
      const newReq: AccessRequest = {
        ...action.payload,
        id: `req-${Date.now()}`,
        timestamp: 'Just now',
        status: 'unread'
      };
      state.items.unshift(newReq);
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const req = state.items.find(r => r.id === action.payload);
      if (req) {
        req.status = 'read';
      }
    },
  },
});

export const { addRequest, markAsRead } = accessRequestSlice.actions;
export default accessRequestSlice.reducer;
