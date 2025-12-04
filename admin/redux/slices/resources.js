// src/redux/slices/resources.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

/* ===========================
   THUNKS
=========================== */

// Get Admit Cards
export const getAdmitCards = createAsyncThunk(
  "resources/getAdmitCards",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admit-cards", { params });
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch Admit Cards"
      );
    }
  }
);

// Get Results
export const getResults = createAsyncThunk(
  "resources/getResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/results", { params });
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch Results"
      );
    }
  }
);

// Get Exams
export const getExams = createAsyncThunk(
  "resources/getExams",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/exams");
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch Exams"
      );
    }
  }
);

// Get Answer Keys
export const getAnswerKeys = createAsyncThunk(
  "resources/getAnswerKeys",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/answer-keys");
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch Answer Keys"
      );
    }
  }
);

// Delete Admit Card
export const deleteAdmitCard = createAsyncThunk(
  "resources/deleteAdmitCard",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admit-cards/${id}`);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete admit card");
    }
  }
);

// Delete Result
export const deleteResult = createAsyncThunk(
  "resources/deleteResult",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/results/${id}`);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete result");
    }
  }
);

// Delete Exam
export const deleteExam = createAsyncThunk(
  "resources/deleteExam",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/exams/${id}`);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete exam");
    }
  }
);

// Delete Answer Key
export const deleteAnswerKey = createAsyncThunk(
  "resources/deleteAnswerKey",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/answer-keys/${id}`);
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to delete answer key");
    }
  }
);

/* ===========================
   INITIAL STATE
=========================== */

const initialState = {
  admitCards: {
    loading: false,
    error: null,
    data: [],
    pagination: { page: 1, totalPages: 1, count: 0 },
  },

  results: {
    loading: false,
    error: null,
    data: [],
    pagination: { page: 1, totalPages: 1, count: 0 },
  },

  exams: {
    loading: false,
    error: null,
    data: [],
  },

  answerKeys: {
    loading: false,
    error: null,
    data: [],
  },
};

/* ===========================
   SLICE
=========================== */

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    clearResourceErrors: (state) => {
      state.admitCards.error = null;
      state.results.error = null;
      state.exams.error = null;
      state.answerKeys.error = null;
    },
    // optimistic local removals for undo support
    removeLocalAdmitCards: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.admitCards.data = (state.admitCards.data || []).filter((it) => !ids.includes(it._id || it.id || it.slug));
      state.admitCards.pagination.count = Math.max(0, (state.admitCards.pagination.count || 0) - ids.length);
    },
    restoreAdmitCards: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.admitCards.data = [...items, ...(state.admitCards.data || [])];
    },
    removeLocalResults: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.results.data = (state.results.data || []).filter((it) => !ids.includes(it._id || it.id || it.slug));
      state.results.pagination.count = Math.max(0, (state.results.pagination.count || 0) - ids.length);
    },
    restoreResults: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.results.data = [...items, ...(state.results.data || [])];
    },
    removeLocalExams: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.exams.data = (state.exams.data || []).filter((it) => !ids.includes(it._id || it.id || it.slug));
    },
    restoreExams: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.exams.data = [...items, ...(state.exams.data || [])];
    },
    removeLocalAnswerKeys: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.answerKeys.data = (state.answerKeys.data || []).filter((it) => !ids.includes(it._id || it.id || it.slug));
    },
    restoreAnswerKeys: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.answerKeys.data = [...items, ...(state.answerKeys.data || [])];
    }
  },

  extraReducers: (builder) => {
    /* ===========================
       ADMIT CARDS
    ============================ */
    builder
      .addCase(getAdmitCards.pending, (state) => {
        state.admitCards.loading = true;
        state.admitCards.error = null;
      })
      .addCase(getAdmitCards.fulfilled, (state, action) => {
        state.admitCards.loading = false;
        state.admitCards.data = action.payload.data || [];
        state.admitCards.pagination = {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          count: action.payload.count || 0,
        };
      })
      .addCase(getAdmitCards.rejected, (state, action) => {
        state.admitCards.loading = false;
        state.admitCards.error = action.payload;
      });

    /* ===========================
       DELETE ADMIT CARD
    ============================ */
    builder
      .addCase(deleteAdmitCard.pending, (state) => { state.admitCards.loading = true; state.admitCards.error = null; })
      .addCase(deleteAdmitCard.fulfilled, (state, action) => {
        state.admitCards.loading = false;
        state.admitCards.data = (state.admitCards.data || []).filter((it) => (it._id || it.id || it.slug) !== action.payload.id);
        state.admitCards.pagination.count = Math.max(0, (state.admitCards.pagination.count || 0) - 1);
      })
      .addCase(deleteAdmitCard.rejected, (state, action) => { state.admitCards.loading = false; state.admitCards.error = action.payload; });

    /* ===========================
       RESULTS
    ============================ */
    builder
      .addCase(getResults.pending, (state) => {
        state.results.loading = true;
        state.results.error = null;
      })
      .addCase(getResults.fulfilled, (state, action) => {
        state.results.loading = false;
        state.results.data = action.payload.data || [];
        state.results.pagination = {
          page: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          count: action.payload.count || 0,
        };
      })
      .addCase(getResults.rejected, (state, action) => {
        state.results.loading = false;
        state.results.error = action.payload;
      });

    /* ===========================
       DELETE RESULT
    ============================ */
    builder
      .addCase(deleteResult.pending, (state) => { state.results.loading = true; state.results.error = null; })
      .addCase(deleteResult.fulfilled, (state, action) => {
        state.results.loading = false;
        state.results.data = (state.results.data || []).filter((it) => (it._id || it.id || it.slug) !== action.payload.id);
        state.results.pagination.count = Math.max(0, (state.results.pagination.count || 0) - 1);
      })
      .addCase(deleteResult.rejected, (state, action) => { state.results.loading = false; state.results.error = action.payload; });

    /* ===========================
       EXAMS
    ============================ */
    builder
      .addCase(getExams.pending, (state) => {
        state.exams.loading = true;
        state.exams.error = null;
      })
      .addCase(getExams.fulfilled, (state, action) => {
        state.exams.loading = false;
        state.exams.data = action.payload.data || action.payload || [];
      })
      .addCase(getExams.rejected, (state, action) => {
        state.exams.loading = false;
        state.exams.error = action.payload;
      });

    /* ===========================
       DELETE EXAM
    ============================ */
    builder
      .addCase(deleteExam.pending, (state) => { state.exams.loading = true; state.exams.error = null; })
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams.loading = false;
        state.exams.data = (state.exams.data || []).filter((it) => (it._id || it.id || it.slug) !== action.payload.id);
      })
      .addCase(deleteExam.rejected, (state, action) => { state.exams.loading = false; state.exams.error = action.payload; });

    /* ===========================
       ANSWER KEYS
    ============================ */
    builder
      .addCase(getAnswerKeys.pending, (state) => {
        state.answerKeys.loading = true;
        state.answerKeys.error = null;
      })
      .addCase(getAnswerKeys.fulfilled, (state, action) => {
        state.answerKeys.loading = false;
        state.answerKeys.data = action.payload.data || action.payload || [];
      })
      .addCase(getAnswerKeys.rejected, (state, action) => {
        state.answerKeys.loading = false;
        state.answerKeys.error = action.payload;
      });

    /* ===========================
       DELETE ANSWER KEY
    ============================ */
    builder
      .addCase(deleteAnswerKey.pending, (state) => { state.answerKeys.loading = true; state.answerKeys.error = null; })
      .addCase(deleteAnswerKey.fulfilled, (state, action) => {
        state.answerKeys.loading = false;
        state.answerKeys.data = (state.answerKeys.data || []).filter((it) => (it._id || it.id || it.slug) !== action.payload.id);
      })
      .addCase(deleteAnswerKey.rejected, (state, action) => { state.answerKeys.loading = false; state.answerKeys.error = action.payload; });
  },
});

/* ===========================
   EXPORTS
=========================== */

export const { clearResourceErrors } = resourceSlice.actions;
export default resourceSlice.reducer;
// Export optimistic actions
export const {
  removeLocalAdmitCards,
  restoreAdmitCards,
  removeLocalResults,
  restoreResults,
  removeLocalExams,
  restoreExams,
  removeLocalAnswerKeys,
  restoreAnswerKeys
} = resourceSlice.actions;
