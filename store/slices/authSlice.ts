import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { AuthService } from '../../services/AuthService';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    error: string | null;
    initialized: boolean;
}

const initialState: AuthState = {
    user: null,
    session: null,
    isLoading: false,
    error: null,
    initialized: false,
};

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password, rememberMe }: { email: string; password: string; rememberMe: boolean }, { rejectWithValue }) => {
        const { session, user, error } = await AuthService.signIn(email, password, rememberMe);
        if (error) return rejectWithValue(error.message);
        return { session, user };
    }
);

export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        const { user, error } = await AuthService.signUp(email, password);
        if (error) return rejectWithValue(error.message);
        return { user };
    }
);

export const signOut = createAsyncThunk(
    'auth/signOut',
    async (_, { rejectWithValue }) => {
        const { error } = await AuthService.signOut();
        if (error) return rejectWithValue(error.message);
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (email: string, { rejectWithValue }) => {
        const { error } = await AuthService.resetPassword(email);
        if (error) return rejectWithValue(error.message);
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<{ session: Session | null; user: User | null }>) {
            state.session = action.payload.session;
            state.user = action.payload.user;
            state.initialized = true;
            state.isLoading = false;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // SignIn
        builder.addCase(signIn.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signIn.fulfilled, (state, action) => {
            state.isLoading = false;
            state.session = action.payload.session;
            state.user = action.payload.user;
        });
        builder.addCase(signIn.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // SignUp
        builder.addCase(signUp.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.isLoading = false;
            // User might be null if email confirmation is required, but usually data.user is returned
        });
        builder.addCase(signUp.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // SignOut
        builder.addCase(signOut.fulfilled, (state) => {
            state.session = null;
            state.user = null;
        });
    },
});

export const { setSession, setLoading, clearError } = authSlice.actions;
export default authSlice.reducer;
