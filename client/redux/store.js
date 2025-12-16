import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import sectionsReducer from './slices/sectionsSlice';
import privateJobsReducer from './slices/privateJobsSlice';
import favPostsReducer from './slices/favPostsSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    sections: sectionsReducer,
    privateJobs: privateJobsReducer,
    favPosts: favPostsReducer,
  },
});
