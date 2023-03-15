import { collection, getDocs, query, where } from "firebase/firestore";
import { ExpendType } from "../config";
import { dbService } from "../firebase";

export const fetchData = async (username: string) => {
  const q = query(
    collection(dbService, "expend"),
    where("username", "==", username)
  );
  const res = await getDocs(q);
  let arr: ExpendType[] = [];
  res.forEach((val) => {
    const data = val.data() as ExpendType;
    arr.push({ ...data, id: val.id });
  });
  return { auth: username, arr };
};
