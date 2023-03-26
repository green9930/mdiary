import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { UserType } from "../../config";

const initialState: UserType = {
  isLogin: false,
  email: "",
  username: "",
  uid: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      return (state = action.payload);
    },
  },
  extraReducers: () => {},
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
