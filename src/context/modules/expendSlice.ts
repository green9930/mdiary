import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { collection, getDocs, query } from "firebase/firestore";
import { dbService } from "./../../firebase";
import { ExpendType } from "../../config";

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
      let newExpend: ExpendType = action.payload;
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
          ) {
            newExpend = { ...newExpend, id: val.id };
          }
        });
      };
      fetchNewData();
      return [...state, newExpend];
    },
    updateExpend: (state, action: PayloadAction<ExpendType>) => {
      return state.map((val) => {
        if (val.id === action.payload.id) {
          return action.payload;
        } else {
          return val;
        }
      });
    },
    deleteExpend: (state, action: PayloadAction<ExpendType>) => {
      return state.filter((val) => val.id !== action.payload.id);
    },
  },
});

export const { setExpend, addExpend, updateExpend, deleteExpend } =
  expendSlice.actions;
export default expendSlice.reducer;
