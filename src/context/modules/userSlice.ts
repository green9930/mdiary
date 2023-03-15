import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type userType = {
  isLogin: boolean;
  email: string;
  username: string;
  uid: string;
};

const initialState: userType = {
  isLogin: false,
  email: "",
  username: "",
  uid: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<userType>) => {
      return (state = action.payload);
    },
  },
  extraReducers: () => {},
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
