import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import user from "./modules/userSlice";
import expend from "./modules/expendSlice";

const store = configureStore({
  reducer: {
    expend,
    user,
  },
});

type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
