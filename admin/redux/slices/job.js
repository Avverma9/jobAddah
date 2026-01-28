// redux/slices/job.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../util/api";

export const getJobs = createAsyncThunk("job/getJobs", async () => {
  const { data } = await api.get("/get-jobs");
  return Array.isArray(data?.data) ? data.data : [];
});

export const getPrivateJob = createAsyncThunk("job/getPrivateJob", async () => {
  const { data } = await api.get("/get-private-jobs");
  return Array.isArray(data?.data) ? data.data : [];
});

export const createJob = createAsyncThunk("job/createJob", async (jobData) => {
  const { data } = await api.post("/add-job", jobData);
  return data;
});

export const bulkInsert = createAsyncThunk(
  "job/bulkInsert",
  async (jobData) => {
    const { data } = await api.post("/bulk-insert", jobData);
    return data;
  }
);

export const insertBulkPosts = createAsyncThunk(
  "job/insertBulkPosts",
  async (jobDataArray) => {
    const res = await api.post("/bulk-insert", jobDataArray);
    return res.data;
  }
);

export const updateJob = createAsyncThunk(
  "job/updateJob",
  async ({ id, jobData }) => {
    const { data } = await api.put(`/update-job/${id}`, jobData);
    return data;
  }
);

export const deleteJob = createAsyncThunk("job/deleteJob", async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return { id, ...data };
});

export const getJobById = createAsyncThunk("job/getJobById", async (id) => {
  const { data } = await api.get(`/get-job/${id}`);
  return data;
});



// ⭐ mark/unmark favourite – same API, fav param se toggle
export const markFav = createAsyncThunk("job/markFav", async ({ id, fav }) => {
  const { data } = await api.put(`/mark-fav/${id}`, { fav });
  return data; // expected: { data: updatedJob } ya direct updatedJob
});

export const getSections = createAsyncThunk("job/getSections", async () => {
  const { data } = await api.get("/get-sections");
  // yahan sirf data.data return karo
  return Array.isArray(data?.data) ? data.data : [];
});

export const getPostlist = createAsyncThunk("job/getPostlist", async (url) => {
  const { data } = await api.post(`/get-postlist${url}`);
  return data;
});

export const getSite = createAsyncThunk("/dashboard/getSite", async () => {
  const { data } = await api.get("/dashboard/get-site");
  return data;
});

export const setSite = createAsyncThunk(
  "/dashboard/setSite",
  async (siteData) => {
    const { data } = await api.post("/dashboard/set-site", siteData);
    return data;
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  stats: null,
  site: null,
  privateJobs: { data: [] },
  message: null,
  sections: [],
  postlist: [],

  // model related
  isSettingModel: false,
  currentModel: null,
};

const jobSlice = createSlice({
  name: "job",
  initialState,
  reducers: {
    clearMessage: (state) => {
      state.message = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    removeLocalJobs: (state, action) => {
      const ids = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.jobs = state.jobs.filter((j) => !ids.includes(j._id || j.id));
    },
    restoreJobs: (state, action) => {
      const items = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.jobs = [...items, ...state.jobs];
    },
    resetJobState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(getJobs.fulfilled, (state, action) => {
      state.jobs = action.payload;
    });

    builder.addCase(getPrivateJob.fulfilled, (state, action) => {
      state.privateJobs.data = action.payload;
    });

    builder.addCase(createJob.fulfilled, (state, action) => {
      state.message = "Job created";
      if (action.payload?.job) state.jobs.unshift(action.payload.job);
    });

    builder.addCase(bulkInsert.fulfilled, (state) => {
      state.message = "Bulk insert successful";
    });

    builder.addCase(insertBulkPosts.fulfilled, (state, action) => {
      if (action.payload?.data) {
        state.jobs = [...action.payload.data, ...state.jobs];
      }
    });

    builder.addCase(updateJob.fulfilled, (state, action) => {
      const updated = action.payload?.data || action.payload?.job;
      if (updated) {
        const idx = state.jobs.findIndex((j) => j._id === updated._id);
        if (idx !== -1) state.jobs[idx] = updated;
        if (state.currentJob?._id === updated._id) state.currentJob = updated;
      }
      state.message = "Job updated";
    });

    builder.addCase(deleteJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter((j) => j._id !== action.payload.id);
      state.message = "Job deleted";
    });

    builder.addCase(getJobById.fulfilled, (state, action) => {
      state.currentJob = action.payload.data || action.payload;
    });


    builder.addCase(getSite.fulfilled, (state, action) => {
      state.site = action.payload;
    });
    builder.addCase(setSite.fulfilled, (state) => {
      state.message = "New site Updated";
    });
    // ⭐ fav update state.jobs + state.postlist
    builder.addCase(markFav.fulfilled, (state, action) => {
      const updated = action.payload?.data || action.payload;
      if (!updated) return;
      const id = updated._id || updated.id;
      const fav = !!updated.fav;

      // jobs array
      state.jobs = state.jobs.map((job) =>
        job._id === id || job.id === id ? { ...job, fav } : job
      );

      // postlist: { jobs: [] }
      if (state.postlist && Array.isArray(state.postlist.jobs)) {
        state.postlist.jobs = state.postlist.jobs.map((j) =>
          j._id === id || j.id === id ? { ...j, fav } : j
        );
      }

      // postlist: sections array
      if (Array.isArray(state.postlist)) {
        state.postlist = state.postlist.map((section) => {
          if (!Array.isArray(section.jobs)) return section;
          return {
            ...section,
            jobs: section.jobs.map((j) =>
              j._id === id || j.id === id ? { ...j, fav } : j
            ),
          };
        });
      }
    });

    builder.addCase(getSections.fulfilled, (state, action) => {
      state.sections = action.payload; // ab ye array hoga
    });

    builder.addCase(getPostlist.fulfilled, (state, action) => {
      // payload = { success, count, data: [...] }
      if (Array.isArray(action.payload?.data)) {
        state.postlist = action.payload.data; // <-- yahi chahiye component ko
      } else if (Array.isArray(action.payload?.jobs)) {
        // agar kabhi backend se direct jobs aa jaye
        state.postlist = action.payload.jobs;
      } else {
        state.postlist = [];
      }
    });
  },
});

export const {
  clearMessage,
  clearCurrentJob,
  removeLocalJobs,
  restoreJobs,
  resetJobState,
} = jobSlice.actions;

export default jobSlice.reducer;
