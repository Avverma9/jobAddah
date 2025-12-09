import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../util/api";

export const getModel = createAsyncThunk(
  "job/getModel",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-model");
      return {
        success: data?.success ?? true,
        modelName: data?.modelName ?? "",
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: error.message || "Failed to get model" }
      );
    }
  }
);

export const setModel = createAsyncThunk(
  "job/setModel",
  async (modelName, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/set-model", { modelName });
      return {
        ...(data || {}),
        modelName,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: error.message || "Failed to set model" }
      );
    }
  }
);

export const setApiKey = createAsyncThunk(
  "job/setApiKey",
  async (apiKey, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/set-api-key", { apiKey });
      return {
        ...(data || {}),
        apiKey,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: error.message || "Failed to set API key" }
      );
    }
  }
);

export const getApiKey = createAsyncThunk(
  "job/getApiKey",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-api-key");
      return {
        success: data?.success ?? true,
        apiKey: data?.apiKey ?? "",
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: error.message || "Failed to get API key" }
      );
    }
  }
);

const initialState = {
  currentModel: "",
  isGettingModel: false,
  isSettingModel: false,
  currentApiKey: "",
  isGettingApiKey: false,
  isSettingApiKey: false,
  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getModel.pending, (state) => {
        state.isGettingModel = true;
      })
      .addCase(getModel.fulfilled, (state, action) => {
        state.isGettingModel = false;
        state.currentModel = action.payload.modelName;
      })
      .addCase(getModel.rejected, (state, action) => {
        state.isGettingModel = false;
        state.error = action.payload?.message || action.error.message || null;
      })
      .addCase(setModel.pending, (state) => {
        state.isSettingModel = true;
      })
      .addCase(setModel.fulfilled, (state, action) => {
        state.isSettingModel = false;
        state.currentModel = action.payload.modelName;
      })
      .addCase(setModel.rejected, (state, action) => {
        state.isSettingModel = false;
        state.error = action.payload?.message || action.error.message || null;
      })
      .addCase(getApiKey.pending, (state) => {
        state.isGettingApiKey = true;
      })
      .addCase(getApiKey.fulfilled, (state, action) => {
        state.isGettingApiKey = false;
        state.currentApiKey = action.payload.apiKey;
      })
      .addCase(getApiKey.rejected, (state, action) => {
        state.isGettingApiKey = false;
        state.error = action.payload?.message || action.error.message || null;
      })
      .addCase(setApiKey.pending, (state) => {
        state.isSettingApiKey = true;
      })
      .addCase(setApiKey.fulfilled, (state, action) => {
        state.isSettingApiKey = false;
        state.currentApiKey = action.payload.apiKey;
      })
      .addCase(setApiKey.rejected, (state, action) => {
        state.isSettingApiKey = false;
        state.error = action.payload?.message || action.error.message || null;
      });
  },
});

export default aiSlice.reducer;
