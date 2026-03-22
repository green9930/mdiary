import { expendCategories } from "@/constants/expendConstants";

export type ExpendTypes = (typeof expendCategories)[keyof typeof expendCategories];
