import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

// Helper functions from homescreen.jsx
const normalizeJob = (job) => {
    const id = job?.link || job?.url || job?.id || job?._id;
    const title = job?.recruitment?.title || job?.title || job?.postTitle || "Job Post";
    const createdAt =
      job?.createdAt ||
      job?.recruitment?.createdAt ||
      job?.date ||
      job?.recruitment?.date ||
      job?.updatedAt ||
      null;
  
    return { ...job, id, title, createdAt };
  };
  
  const getTimeValue = (job) => {
    const raw = job?.createdAt;
    const t = raw ? new Date(raw).getTime() : NaN;
    if (!Number.isNaN(t)) return t;
    return job?.timestamp || 0;
  };
  
  const sortLatestFirst = (list) => {
    const arr = Array.isArray(list) ? [...list] : [];
    return arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));
  };

export const fetchPrivateJobs = createAsyncThunk('privateJobs/fetchPrivateJobs', async () => {
  const payload = await api.get('/get-jobs?postType=PRIVATE_JOB');
  const base = payload?.data ?? payload;
  const jobs = Array.isArray(base) ? base : base?.data || [];
  const processed = sortLatestFirst(
    jobs.map((j) =>
      normalizeJob({
        ...j,
        id: j._id || j.id,
        title: j.postTitle || j.title,
        createdAt: j.createdAt || j.updatedAt,
      })
    )
  );
  return processed;
});

const privateJobsSlice = createSlice({
  name: 'privateJobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivateJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrivateJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchPrivateJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default privateJobsSlice.reducer;
