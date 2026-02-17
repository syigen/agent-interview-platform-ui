import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Template } from '../../types';
import { templateService } from '../../services/TemplateService';

interface TemplateState {
  items: Template[];
  loading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      return await templateService.getTemplates();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch templates');
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/createTemplate',
  async (template: Omit<Template, 'id' | 'lastUpdated'>, { rejectWithValue }) => {
    try {
      // We need to cast because backend expects snake_case but frontend uses camelCase.
      // However, we updated schemas to use camelCase aliases, so it should be fine?
      // Wait, TemplateService.createTemplate takes Omit<Template, 'id' | 'last_updated'>
      // types.ts has lastUpdated.
      // TemplateService type definition needs to match. 
      // Let's assume types.ts Template is correct (camelCase).
      // And TemplateService sends JSON. Backend Pydantic accepts camelCase aliases.
      // So this should work.
      return await templateService.createTemplate(template as any);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create template');
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ id, data }: { id: string; data: Partial<Template> }, { rejectWithValue }) => {
    try {
      return await templateService.updateTemplate(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update template');
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await templateService.deleteTemplate(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete template');
    }
  }
);

export const duplicateTemplate = createAsyncThunk(
  'templates/duplicateTemplate',
  async ({ id, newName }: { id: string; newName: string }, { rejectWithValue }) => {
    try {
      return await templateService.duplicateTemplate(id, newName);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to duplicate template');
    }
  }
);

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      // Duplicate
      .addCase(duplicateTemplate.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { clearError } = templateSlice.actions;
export default templateSlice.reducer;
