import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

/* ===========================
   ALL API CALLS
=========================== */

// Get All Jobs
export const getJobs = createAsyncThunk(
  "job/getJobs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-jobs");
      return Array.isArray(data?.data) ? data.data : [];
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

// Create Single Job
export const createJob = createAsyncThunk(
  "job/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/add-job", jobData);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to create job");
    }
  }
);

// Bulk Insert (Array or Single Object)
export const bulkInsert = createAsyncThunk(
  "job/bulkInsert",
  async (jobData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/bulk-insert", jobData); // <-- NO WRAPPING
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Bulk insert failed");
    }
  }
);

// Update Job
export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/jobs/${id}`, jobData);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to update");
    }
  }
);

// Delete Job
export const deleteJob = createAsyncThunk(
  "job/deleteJob",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/jobs/${id}`);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to delete");
    }
  }
);

// Get Job By ID
export const getJobById = createAsyncThunk(
  "job/getJobById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch job");
    }
  }
);

// GET STATS (Do Not Touch)
export const getStats = createAsyncThunk(
  "job/getStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin/stats"); // EXACTLY AS YOU SAID
      return data?.stats;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to fetch stats");
    }
  }
);

/* ===========================
   INITIAL STATE
=========================== */

const initialState = {
  jobs: [],
  currentJob: null,
  stats: null,
  loading: false,
  error: null,
  message: null,

  admitCards: { loading: false, error: null, data: [], pagination: {} },
  admitCardDetail: { loading: false, error: null, data: null },

  resultCards: { loading: false, error: null, data: [], pagination: {} },
  resultCardDetail: { loading: false, error: null, data: null }
};

/* ===========================
   SLICE
=========================== */

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

    /* --- Get Jobs --- */
    builder
      .addCase(getJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.jobs = [];
      });

    /* --- Create Job --- */
    builder
      .addCase(createJob.pending, (state) => { state.loading = true; })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "Job created";
        if (action.payload?.job) state.jobs.unshift(action.payload.job);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* --- Bulk Insert --- */
    builder
      .addCase(bulkInsert.pending, (state) => { state.loading = true; })
      .addCase(bulkInsert.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "Bulk insert successful";
      })
      .addCase(bulkInsert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* --- Update Job --- */
    builder
      .addCase(updateJob.pending, (state) => { state.loading = true; })
      .addCase(updateJob.fulfilled, (state, action) => {
        const updated = action.payload?.job;
        state.loading = false;
        state.message = "Job updated";
        if (updated) {
          const idx = state.jobs.findIndex((j) => j._id === updated._id);
          if (idx !== -1) state.jobs[idx] = updated;
          if (state.currentJob?._id === updated._id) state.currentJob = updated;
        }
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* --- Delete Job --- */
    builder
      .addCase(deleteJob.pending, (state) => { state.loading = true; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "Job deleted";
        state.jobs = state.jobs.filter((j) => j._id !== action.payload.id);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    /* --- Single Job --- */
    builder
      .addCase(getJobById.pending, (state) => { state.loading = true; })
      .addCase(getJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(getJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentJob = null;
      });

    /* --- Stats (UNTOUCHED) --- */
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
  }
});

/* ===========================
   EXPORTS
=========================== */

export const {
  clearError,
  clearMessage,
  clearCurrentJob,
  resetJobState
} = jobSlice.actions;

export default jobSlice.reducer;
