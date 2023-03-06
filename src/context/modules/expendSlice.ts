import { dbService } from "./../../firebase";
import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { collection, getDocs, query } from "firebase/firestore";

export type ExpendType = {
  id?: string;
  category: string;
  title: string;
  content: string;
  date: string;
  price: string;
  username: string;
};

type DataType = {
  auth: string;
  arr: ExpendType[];
};

const initialState: ExpendType[] = [];

const expendSlice = createSlice({
  name: "expend",
  initialState,
  reducers: {
    setExpend: (state, action: PayloadAction<DataType>) => {
      const { auth, arr } = action.payload;
      return arr.filter((val) => val.username === auth);
    },
    addExpend: (state, action: PayloadAction<ExpendType>) => {
      let targetId: string = "";
      const fetchNewData = async () => {
        const q = query(collection(dbService, "expend"));
        const res = await getDocs(q);
        res.forEach((val) => {
          const data = val.data() as ExpendType;
          const target = action.payload;
          if (
            data.category === target.category &&
            data.content === target.content &&
            data.date === target.date &&
            data.price === target.price &&
            data.title === target.title &&
            data.username === target.username
          )
            targetId = val.id;
        });
      };
      fetchNewData();
      state.push({ id: targetId, ...action.payload });
    },
    deleteExpend: (state, action: PayloadAction<ExpendType>) => {
      return state.filter((val) => val.id !== action.payload.id);
    },
  },
});

export const { setExpend, addExpend, deleteExpend } = expendSlice.actions;
export default expendSlice.reducer;