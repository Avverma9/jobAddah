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
  },
});

/* ===========================
   EXPORTS
=========================== */

export const { clearResourceErrors } = resourceSlice.actions;
export default resourceSlice.reducer;
