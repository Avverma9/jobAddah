import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

export const getJobs = createAsyncThunk(
  "job/getJobs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-jobs");
      return data?.data || data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch jobs");
    }
  }
);

export const createJob = createAsyncThunk(
  "job/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/add-jobs", jobData);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to create job");
    }
  }
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, jobData);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to update job");
    }
  }
);

export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/jobs/${id}`);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to delete job");
    }
  }
);

export const getJobById = createAsyncThunk(
  "job/getJobById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch job details");
    }
  }
);

export const getStats = createAsyncThunk(
  "job/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/jobs/stats");
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch stats");
    }
  }
);

export const getAdmitCards = createAsyncThunk(
  "job/getAdmitCards",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admit-cards", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch admit cards");
    }
  }
);

export const getResultCards = createAsyncThunk(
  "job/getResultCards",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/results", { params });
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch result cards");
    }
  }
);

export const getExams = createAsyncThunk(
  "job/getExams",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/exams");
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Failed to fetch exams");
    }
  }
);

export const getAdmitCardById = createAsyncThunk(
  "job/getAdmitCardById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}/admit-card`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Admit card not available");
    }
  }
);

export const getResultCardById = createAsyncThunk(
  "job/getResultCardById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}/result`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || error.message || "Result not available");
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  stats: null,
  loading: false,
  error: null,
  message: null,

  admitCards: {
    loading: false,
    error: null,
    data: [],
    pagination: { page: 1, totalPages: 1, count: 0 }
  },

  admitCardDetail: {
    loading: false,
    error: null,
    data: null
  },

  resultCards: {
    loading: false,
    error: null,
    data: [],
    pagination: { page: 1, totalPages: 1, count: 0 }
  },

  resultCardDetail: {
    loading: false,
    error: null,
    data: null
  }
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearMessage: (state) => { state.message = null; },
    clearCurrentJob: (state) => { state.currentJob = null; },
    resetJobState: () => initialState
  },

  extraReducers: (builder) => {
    builder
      .addCase(getJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || [];
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.jobs = [];
      });

    builder
      .addCase(createJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Job created";
        if (action.payload?.job) state.jobs.unshift(action.payload.job);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Job updated";
        if (action.payload?.job) {
          const idx = state.jobs.findIndex((j) => j._id === action.payload.job._id);
          if (idx !== -1) state.jobs[idx] = action.payload.job;
          if (state.currentJob?._id === action.payload.job._id) state.currentJob = action.payload.job;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload?.message || "Job deleted";
        state.jobs = state.jobs.filter((job) => job._id !== action.payload.id);
        if (state.currentJob?._id === action.payload.id) state.currentJob = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getJobById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload?.job || action.payload;
      })
      .addCase(getJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentJob = null;
      });

    builder
      .addCase(getStats.pending, (state) => { state.loading = true; })
      .addCase(getStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(getAdmitCards.pending, (state) => {
        state.admitCards.loading = true;
        state.admitCards.error = null;
      })
      .addCase(getAdmitCards.fulfilled, (state, action) => {
        state.admitCards.loading = false;
        state.admitCards.data = action.payload.data || [];
        state.admitCards.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          count: action.payload.count
        };
      })
      .addCase(getAdmitCards.rejected, (state, action) => {
        state.admitCards.loading = false;
        state.admitCards.error = action.payload;
        state.admitCards.data = [];
      });

    builder
      .addCase(getAdmitCardById.pending, (state) => {
        state.admitCardDetail.loading = true;
        state.admitCardDetail.error = null;
      })
      .addCase(getAdmitCardById.fulfilled, (state, action) => {
        state.admitCardDetail.loading = false;
        state.admitCardDetail.data = action.payload;
      })
      .addCase(getAdmitCardById.rejected, (state, action) => {
        state.admitCardDetail.loading = false;
        state.admitCardDetail.error = action.payload;
      });

    builder
      .addCase(getResultCards.pending, (state) => {
        state.resultCards.loading = true;
        state.resultCards.error = null;
      })
      .addCase(getResultCards.fulfilled, (state, action) => {
        state.resultCards.loading = false;
        state.resultCards.data = action.payload.data || [];
        state.resultCards.pagination = {
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          count: action.payload.count
        };
      })
      .addCase(getResultCards.rejected, (state, action) => {
        state.resultCards.loading = false;
        state.resultCards.error = action.payload;
        state.resultCards.data = [];
      });

    builder
      .addCase(getResultCardById.pending, (state) => {
        state.resultCardDetail.loading = true;
        state.resultCardDetail.error = null;
      })
      .addCase(getResultCardById.fulfilled, (state, action) => {
        state.resultCardDetail.loading = false;
        state.resultCardDetail.data = action.payload;
      })
      .addCase(getResultCardById.rejected, (state, action) => {
        state.resultCardDetail.loading = false;
        state.resultCardDetail.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearMessage,
  clearCurrentJob,
  resetJobState
} = jobSlice.actions;

export default jobSlice.reducer;
