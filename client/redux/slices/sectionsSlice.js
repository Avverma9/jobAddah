import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../src/util/apiClient';

// Helper functions moved here for now
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


export const fetchSections = createAsyncThunk('sections/fetchSections', async () => {
  const categoryPayload = await api.get('/get-sections');
    const sectionDocs = categoryPayload?.data ?? categoryPayload ?? [];
    const categories =
      Array.isArray(sectionDocs) && sectionDocs.length > 0 ? sectionDocs[0]?.categories || [] : [];

    if (!categories?.length) {
      return [];
    }

    const sectionPromises = categories.map(async (cat) => {
  try {
  const payload = await api.post('/get-postlist', { url: cat.link });
  const base = payload?.data ?? payload;

        let jobs = [];
        if (Array.isArray(base)) {
          const match = base.find((item) => item.url === cat.link) || base[0];
          jobs = match?.jobs || [];
        } else {
          jobs = base?.jobs || [];
        }

        const processed = sortLatestFirst(
          (jobs || [])
            .map(normalizeJob)
            .filter(
              (job) =>
                job?.title &&
                !job.title.toLowerCase().includes("privacy policy") &&
                !job.title.toLowerCase().includes("sarkari result")
            )
        );
        return { name: cat.name, data: processed, color: "gray", postType: "JOB" };
      } catch {
        return { name: cat.name, data: [], color: "gray", postType: "JOB" };
      }
    });

    const sections = await Promise.all(sectionPromises);
    return sections;
});

const sectionsSlice = createSlice({
  name: 'sections',
  initialState: {
    sections: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSections.pending, (state) => {
        // Keep existing state.sections so UI can render stale data.
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = action.payload;
      })
      .addCase(fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default sectionsSlice.reducer;
