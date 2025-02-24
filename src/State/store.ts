import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PersistConfig } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session"; // Use sessionStorage
import { combineReducers } from "redux";

// Import your reducers
import AuthenticationReducer from "./slices/AuthenticationSlice";
import AdvertiserAccountSlice from "./slices/AdvertiserAccountSlice";
import whatsappSlice from "./slices/WhatsappSlice";
import adminSlice from "./slices/AdminSlice";
import OperatorSlice from "./slices/OperatorSlice"
import SmsSlice from "./slices/SmsSlice";
// Combine reducers

const rootReducer = combineReducers({
  authentication: AuthenticationReducer,
  advertiserAccount: AdvertiserAccountSlice,
  whatsapp: whatsappSlice,
  admin:adminSlice,
  operator:OperatorSlice,
  sms:SmsSlice,
});

// Define Redux Persist configuration
const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: "root", // Storage key prefix
  storage: storageSession, // Use sessionStorage instead of localStorage
  whitelist: ["authentication", "advertiserAccount", "admin","operator"], // Reducers to persist
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the store
export const store = configureStore({
  reducer: persistedReducer,
});

// Create persistor
export const persistor = persistStore(store);

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



// import { configureStore } from "@reduxjs/toolkit";
// import AuthenticationReducer from "./slices/AuthenticationSlice";
// import AdvertiserAccountSlice from "./slices/AdvertiserAccountSlice";
// import whatsappSlice from "./slices/WhatsappSlice";


// export const store = configureStore({
//     reducer: {
//         authentication: AuthenticationReducer,
//         advertiserAccount: AdvertiserAccountSlice,
//         whatsapp:whatsappSlice,
//     }
    
// })

// export type RootState = ReturnType<typeof store.getState>;
// export type  AppDispatch = typeof store.dispatch;



