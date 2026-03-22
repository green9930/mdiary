import { CategoryIcon } from "@/components/elements/CategoryIcon";
import { expendCategories } from "@/constants/expendConstants";

const testData = {
  category: expendCategories.beauty,
};

const ExpenseItem = () => {
  return (
    <div>
      <CategoryIcon target={testData.category} />
    </div>
  );
};

export default ExpenseItem;
