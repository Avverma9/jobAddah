import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

const buildProviderState = () => ({
  keys: [],
  models: [],
  loading: {
    keys: false,
    models: false,
    savingKey: false,
    savingKeyId: null,
    savingModel: false,
    savingModelName: null,
  },
});

const initialState = {
  gemini: buildProviderState(),
  perplexity: buildProviderState(),
  checking: false,
  error: null,
};

const pickError = (error, fallback) =>
  error?.response?.data || { message: fallback };

/* ===================== HELPERS ===================== */

const normalizeList = (data, key) => {
  if (!data) return [];
  if (Array.isArray(data[key])) return data[key];
  // some backends might return single object
  if (data[key]) return [data[key]];
  return [];
};

/* ===================== THUNKS ===================== */

// -------- GEMINI --------

export const fetchGeminiKeys = createAsyncThunk(
  "ai/fetchGeminiKeys",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-api-key");
      return normalizeList(data, "keys");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to load Gemini keys"));
    }
  }
);

export const fetchGeminiModels = createAsyncThunk(
  "ai/fetchGeminiModels",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-model");
      return normalizeList(data, "models");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to load Gemini models"));
    }
  }
);

export const saveGeminiKey = createAsyncThunk(
  "ai/saveGeminiKey",
  async (payload, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-api-key", payload);
      const { data } = await api.get("/ai/get-api-key");
      return normalizeList(data, "keys");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to save Gemini key"));
    }
  }
);

export const saveGeminiModel = createAsyncThunk(
  "ai/saveGeminiModel",
  async (payload, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-model", payload);
      const { data } = await api.get("/ai/get-model");
      return normalizeList(data, "models");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to save Gemini model"));
    }
  }
);

// -------- PERPLEXITY --------

export const fetchPplKeys = createAsyncThunk(
  "ai/fetchPplKeys",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-api-key-ppl");
      return normalizeList(data, "keys");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to load Perplexity keys"));
    }
  }
);

export const fetchPplModels = createAsyncThunk(
  "ai/fetchPplModels",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/ai/get-model-ppl");
      return normalizeList(data, "models");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to load Perplexity models"));
    }
  }
);

export const savePplKey = createAsyncThunk(
  "ai/savePplKey",
  async (payload, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-api-key-ppl", payload);
      const { data } = await api.get("/ai/get-api-key-ppl");
      return normalizeList(data, "keys");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to save Perplexity key"));
    }
  }
);

export const savePplModel = createAsyncThunk(
  "ai/savePplModel",
  async (payload, { rejectWithValue }) => {
    try {
      await api.post("/ai/set-model-ppl", payload);
      const { data } = await api.get("/ai/get-model-ppl");
      return normalizeList(data, "models");
    } catch (error) {
      return rejectWithValue(pickError(error, "Failed to save Perplexity model"));
    }
  }
);

/* ===================== SLICE ===================== */

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
      // ===== GEMINI LISTS =====
      .addCase(fetchGeminiKeys.pending, (state) => {
        state.error = null;
        state.gemini.loading.keys = true;
      })
      .addCase(fetchGeminiKeys.fulfilled, (state, action) => {
        state.gemini.loading.keys = false;
        state.gemini.keys = action.payload;
      })
      .addCase(fetchGeminiKeys.rejected, (state, action) => {
        state.gemini.loading.keys = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchGeminiModels.pending, (state) => {
        state.error = null;
        state.gemini.loading.models = true;
      })
      .addCase(fetchGeminiModels.fulfilled, (state, action) => {
        state.gemini.loading.models = false;
        state.gemini.models = action.payload;
      })
      .addCase(fetchGeminiModels.rejected, (state, action) => {
        state.gemini.loading.models = false;
        state.error = action.payload?.message;
      })

      .addCase(saveGeminiKey.pending, (state, action) => {
        state.error = null;
        state.gemini.loading.savingKey = true;
        state.gemini.loading.savingKeyId =
          action.meta?.arg?._id || action.meta?.arg?.apiKey || null;
      })
      .addCase(saveGeminiKey.fulfilled, (state, action) => {
        state.gemini.loading.savingKey = false;
        state.gemini.loading.savingKeyId = null;
        state.gemini.keys = action.payload;
      })
      .addCase(saveGeminiKey.rejected, (state, action) => {
        state.gemini.loading.savingKey = false;
        state.gemini.loading.savingKeyId = null;
        state.error = action.payload?.message;
      })

      .addCase(saveGeminiModel.pending, (state, action) => {
        state.error = null;
        state.gemini.loading.savingModel = true;
        state.gemini.loading.savingModelName =
          action.meta?.arg?.modelName || null;
      })
      .addCase(saveGeminiModel.fulfilled, (state, action) => {
        state.gemini.loading.savingModel = false;
        state.gemini.loading.savingModelName = null;
        state.gemini.models = action.payload;
      })
      .addCase(saveGeminiModel.rejected, (state, action) => {
        state.gemini.loading.savingModel = false;
        state.gemini.loading.savingModelName = null;
        state.error = action.payload?.message;
      })

      // ===== PERPLEXITY LISTS =====
      .addCase(fetchPplKeys.pending, (state) => {
        state.error = null;
        state.perplexity.loading.keys = true;
      })
      .addCase(fetchPplKeys.fulfilled, (state, action) => {
        state.perplexity.loading.keys = false;
        state.perplexity.keys = action.payload;
      })
      .addCase(fetchPplKeys.rejected, (state, action) => {
        state.perplexity.loading.keys = false;
        state.error = action.payload?.message;
      })

      .addCase(fetchPplModels.pending, (state) => {
        state.error = null;
        state.perplexity.loading.models = true;
      })
      .addCase(fetchPplModels.fulfilled, (state, action) => {
        state.perplexity.loading.models = false;
        state.perplexity.models = action.payload;
      })
      .addCase(fetchPplModels.rejected, (state, action) => {
        state.perplexity.loading.models = false;
        state.error = action.payload?.message;
      })

      .addCase(savePplKey.pending, (state, action) => {
        state.error = null;
        state.perplexity.loading.savingKey = true;
        state.perplexity.loading.savingKeyId =
          action.meta?.arg?._id || action.meta?.arg?.apiKey || null;
      })
      .addCase(savePplKey.fulfilled, (state, action) => {
        state.perplexity.loading.savingKey = false;
        state.perplexity.loading.savingKeyId = null;
        state.perplexity.keys = action.payload;
      })
      .addCase(savePplKey.rejected, (state, action) => {
        state.perplexity.loading.savingKey = false;
        state.perplexity.loading.savingKeyId = null;
        state.error = action.payload?.message;
      })

      .addCase(savePplModel.pending, (state, action) => {
        state.error = null;
        state.perplexity.loading.savingModel = true;
        state.perplexity.loading.savingModelName =
          action.meta?.arg?.modelName || null;
      })
      .addCase(savePplModel.fulfilled, (state, action) => {
        state.perplexity.loading.savingModel = false;
        state.perplexity.loading.savingModelName = null;
        state.perplexity.models = action.payload;
      })
      .addCase(savePplModel.rejected, (state, action) => {
        state.perplexity.loading.savingModel = false;
        state.perplexity.loading.savingModelName = null;
        state.error = action.payload?.message;
      });
  },
});

export const { clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
