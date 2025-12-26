import { combineReducers } from '@reduxjs/toolkit';
import postsReducer from './slices/postsSlice';
import sectionsReducer from './slices/sectionsSlice';
import privateJobsReducer from './slices/privateJobsSlice';
import favPostsReducer from './slices/favPostsSlice';
import searchReducer from './slices/searchSlice';
import remindersReducer from './slices/remindersSlice';
import adConfigReducer from './slices/adConfigSlice';

// Combine reducers in a single root reducer so the store can import one source
const rootReducer = combineReducers({
	posts: postsReducer,
	sections: sectionsReducer,
	privateJobs: privateJobsReducer,
	favPosts: favPostsReducer,
	search: searchReducer,
	reminders: remindersReducer,
	adConfig: adConfigReducer,
});

export default rootReducer;
