import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

/* ===================== THUNKS ===================== */

// -------- GEMINI --------

export const getModel = createAsyncThunk(
  "ai/getModel",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-model");
      return {
        modelName: data.modelName || "",
        status: data.status ?? true,
        id: data._id || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to get Gemini model" }
      );
    }
  }
);

export const setModel = createAsyncThunk(
  "ai/setModel",
  async (modelName, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/set-model", { modelName });
      return {
        modelName,
        id: data?._id || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to set Gemini model" }
      );
    }
  }
);

export const changeGeminiStatus = createAsyncThunk(
  "ai/changeGeminiStatus",
  async ({ status, modelName }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/change-gemini-status", {
        status,
        modelName,
      });
      return {
        status: data.status,
        id: data._id,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to change Gemini status",
        }
      );
    }
  }
);

// -------- PERPLEXITY --------

export const getPplModel = createAsyncThunk(
  "ai/getPplModel",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-model-ppl");
      return {
        modelName: data.modelName || "",
        status: data.status ?? true,
        id: data._id || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to get PPL model" }
      );
    }
  }
);

export const setPplModel = createAsyncThunk(
  "ai/setPplModel",
  async (modelName, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/set-model-ppl", { modelName });
      return {
        modelName,
        id: data?._id || null,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to set PPL model" }
      );
    }
  }
);

export const changePplStatus = createAsyncThunk(
  "ai/changePplStatus",
  async ({ status, modelName }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/ai/change-perplexity-status", {
        status,
        modelName,
      });
      return {
        status: data.status,
        id: data._id,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || {
          message: "Failed to change Perplexity status",
        }
      );
    }
  }
);

// -------- API KEYS --------

export const getApiKey = createAsyncThunk(
  "ai/getApiKey",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-api-key");
      return data.apiKey || "";
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to get API key" }
      );
    }
  }
);

export const setApiKey = createAsyncThunk(
  "ai/setApiKey",
  async (apiKey, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-api-key", { apiKey });
      return apiKey;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to set API key" }
      );
    }
  }
);

export const getPplApiKey = createAsyncThunk(
  "ai/getPplApiKey",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-api-key-ppl");
      return data.apiKey || "";
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to get PPL API key" }
      );
    }
  }
);

export const setPplApiKey = createAsyncThunk(
  "ai/setPplApiKey",
  async (apiKey, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-api-key-ppl", { apiKey });
      return apiKey;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Failed to set PPL API key" }
      );
    }
  }
);

/* ===================== SLICE ===================== */

const initialState = {
  gemini: {
    model: "",
    status: true,
    id: null,
    loading: {
      get: false,
      set: false,
      toggle: false,
    },
  },

  perplexity: {
    model: "",
    status: true,
    id: null,
    loading: {
      get: false,
      set: false,
      toggle: false,
    },
  },

  apiKeys: {
    gemini: "",
    ppl: "",
    loading: {
      gemini: false,
      ppl: false,
    },
  },

  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearAiError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ===== GEMINI =====
      .addCase(getModel.pending, (state) => {
        state.gemini.loading.get = true;
      })
      .addCase(getModel.fulfilled, (state, action) => {
        state.gemini.loading.get = false;
        state.gemini.model = action.payload.modelName;
        state.gemini.status = action.payload.status;
        state.gemini.id = action.payload.id;
      })
      .addCase(getModel.rejected, (state, action) => {
        state.gemini.loading.get = false;
        state.error = action.payload?.message;
      })

      .addCase(setModel.pending, (state) => {
        state.gemini.loading.set = true;
      })
      .addCase(setModel.fulfilled, (state, action) => {
        state.gemini.loading.set = false;
        state.gemini.model = action.payload.modelName;
        state.gemini.id = action.payload.id;
      })
      .addCase(setModel.rejected, (state, action) => {
        state.gemini.loading.set = false;
        state.error = action.payload?.message;
      })

      .addCase(changeGeminiStatus.pending, (state) => {
        state.gemini.loading.toggle = true;
      })
      .addCase(changeGeminiStatus.fulfilled, (state, action) => {
        state.gemini.loading.toggle = false;
        state.gemini.status = action.payload.status;
        state.gemini.id = action.payload.id;
      })
      .addCase(changeGeminiStatus.rejected, (state, action) => {
        state.gemini.loading.toggle = false;
        state.error = action.payload?.message;
      })

      // ===== PERPLEXITY =====
      .addCase(getPplModel.pending, (state) => {
        state.perplexity.loading.get = true;
      })
      .addCase(getPplModel.fulfilled, (state, action) => {
        state.perplexity.loading.get = false;
        state.perplexity.model = action.payload.modelName;
        state.perplexity.status = action.payload.status;
        state.perplexity.id = action.payload.id;
      })
      .addCase(getPplModel.rejected, (state, action) => {
        state.perplexity.loading.get = false;
        state.error = action.payload?.message;
      })

      .addCase(setPplModel.pending, (state) => {
        state.perplexity.loading.set = true;
      })
      .addCase(setPplModel.fulfilled, (state, action) => {
        state.perplexity.loading.set = false;
        state.perplexity.model = action.payload.modelName;
        state.perplexity.id = action.payload.id;
      })
      .addCase(setPplModel.rejected, (state, action) => {
        state.perplexity.loading.set = false;
        state.error = action.payload?.message;
      })

      .addCase(changePplStatus.pending, (state) => {
        state.perplexity.loading.toggle = true;
      })
      .addCase(changePplStatus.fulfilled, (state, action) => {
        state.perplexity.loading.toggle = false;
        state.perplexity.status = action.payload.status;
        state.perplexity.id = action.payload.id;
      })
      .addCase(changePplStatus.rejected, (state, action) => {
        state.perplexity.loading.toggle = false;
        state.error = action.payload?.message;
      })

      // ===== API KEYS =====
      .addCase(getApiKey.pending, (state) => {
        state.apiKeys.loading.gemini = true;
      })
      .addCase(getApiKey.fulfilled, (state, action) => {
        state.apiKeys.loading.gemini = false;
        state.apiKeys.gemini = action.payload;
      })
      .addCase(getApiKey.rejected, (state, action) => {
        state.apiKeys.loading.gemini = false;
        state.error = action.payload?.message;
      })

      .addCase(setApiKey.fulfilled, (state, action) => {
        state.apiKeys.gemini = action.payload;
      })

      .addCase(getPplApiKey.pending, (state) => {
        state.apiKeys.loading.ppl = true;
      })
      .addCase(getPplApiKey.fulfilled, (state, action) => {
        state.apiKeys.loading.ppl = false;
        state.apiKeys.ppl = action.payload;
      })
      .addCase(getPplApiKey.rejected, (state, action) => {
        state.apiKeys.loading.ppl = false;
        state.error = action.payload?.message;
      })

      .addCase(setPplApiKey.fulfilled, (state, action) => {
        state.apiKeys.ppl = action.payload;
      });
  },
});

export const { clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
