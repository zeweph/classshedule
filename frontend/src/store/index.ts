// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from './slices/usersSlice';
import departmentsReducer from './slices/departmentsSlice';
import roomsReducer from './slices/roomsSlice';
import checkReducer from './slices/checkSession';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import coursesSlice from './slices/coursesSlice';
import instructorsSlice from './slices/instructorsSlice';
import sheduleslice from './slices/scheduleSlice';
import announcementsReducer from './slices/announcementsSlice';
import dashboardReducer from './slices/dashboardSlice';
import feedbackReducer from './slices/feedbackSlice';
import userSettingsReducer from './slices/userSettingsSlice';
import batchReducer from './slices/batchSlice'
import SemesterReducer from './slices/semesterSlice'
export const store = configureStore({
  reducer: {
    users: usersReducer,
    departments: departmentsReducer,
    rooms: roomsReducer,
    auth: checkReducer,
    loginauth: authReducer,
    ui: uiReducer,
    courses: coursesSlice,
    instructor: instructorsSlice,
    schedule:sheduleslice,
     announcements: announcementsReducer,
     dashboard: dashboardReducer,
       feedback: feedbackReducer,
       userSettings: userSettingsReducer,
       batches:batchReducer,
       semesters:SemesterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;