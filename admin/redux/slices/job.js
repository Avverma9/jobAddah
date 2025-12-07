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


export const getPrivateJob = createAsyncThunk(
  "job/getPrivateJob",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/get-private-jobs");
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
export const insertBulkPosts = createAsyncThunk(
  "job/insertBulkPosts",
  async (jobDataArray, { rejectWithValue }) => {
    try {
      // Make sure this URL matches your Backend Route for bulk insert
      // Based on your previous backend code, it expects an array in req.body
      const response = await api.post("/bulk-insert", jobDataArray);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
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

export const markFav = createAsyncThunk(
  "job/markFav",
  async ({id,fav}, { rejectWithValue }) => {  
    try {
      const { data } = await api.put(`/mark-fav/${id}`,{fav});
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Failed to mark favorite");
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
  privateJobs: { loading: false, error: null, data: [] },

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
    // Optimistic local removal (UI only) for undo support
    removeLocalJobs: (state, action) => {
      const ids = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.jobs = (state.jobs || []).filter((j) => !ids.includes(j._id || j.id));
    },
    restoreJobs: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [action.payload];
      // Prepend restored items to jobs list
      state.jobs = [...items, ...(state.jobs || [])];
    },
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
 /* --- Get Private Jobs --- */
    builder
      .addCase(getPrivateJob.pending, (state) => { state.privateJobs.loading = true; state.privateJobs.error = null; })
      .addCase(getPrivateJob.fulfilled, (state, action) => {
        state.privateJobs.loading = false;
        // payload may be an array or an object with .data
        state.privateJobs.data = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(getPrivateJob.rejected, (state, action) => {
        state.privateJobs.loading = false;
        state.privateJobs.error = action.payload;
        state.privateJobs.data = [];
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
        // ✅ ADD CASES FOR insertBulkPosts
    builder
    .addCase(insertBulkPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(insertBulkPosts.fulfilled, (state, action) => {
      state.loading = false;
      // Optionally add the new jobs to the state
      if (action.payload.data) {
         // If backend returns the array of inserted docs
         state.jobs = [...action.payload.data, ...state.jobs]; 
      }
    })
    .addCase(insertBulkPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });

    /* --- Update Job --- */
    builder
      .addCase(updateJob.pending, (state) => { state.loading = true; })
      .addCase(updateJob.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload?.job; // Handle nested response
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
        // Often backend returns { success: true, data: { ... } }, handle that
        state.currentJob = action.payload.data ? action.payload.data : action.payload;
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

    /* --- Mark Favorite (New Logic Added Here) --- */
    builder
      .addCase(markFav.pending, (state) => {
         // Optionally set loading or keep silent for better UX
      })
      .addCase(markFav.fulfilled, (state, action) => {
        // Extract the updated job data from the API response
        // Backend usually returns: { success: true, data: { ...updatedJob } }
        const updatedJob = action.payload.data || action.payload;
        
        if (updatedJob && updatedJob._id) {
          // Find and update the job in the jobs array
          const index = state.jobs.findIndex((job) => job._id === updatedJob._id);
          if (index !== -1) {
            state.jobs[index] = updatedJob; // Update state instantly
          }
        }
      })
      .addCase(markFav.rejected, (state, action) => {
        state.error = action.payload;
        // Optionally show a toast error here
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
  resetJobState,
  removeLocalJobs,
  restoreJobs
} = jobSlice.actions;

export default jobSlice.reducer;