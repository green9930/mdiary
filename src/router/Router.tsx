import { Route, Routes } from "react-router-dom";
import { useAppSelector } from "../context/redux";
import CategoryPage from "../pages/CategoryPage";
import DailyPage from "../pages/DailyPage";
import LoginPage from "../pages/LoginPage";
import MonthlyPage from "../pages/MonthlyPage";
import NewPage from "../pages/NewPage";
import WeeklyPage from "../pages/WeeklyPage";

interface IRouter extends React.HTMLAttributes<HTMLDivElement> {}
interface IRouter {
  isLogin: boolean;
}

const Router: React.FC<IRouter> = () => {
  const isLogin = useAppSelector((state) => state.user.isLogin);

  return (
    <Routes>
      <Route path="/" element={isLogin ? <MonthlyPage /> : <LoginPage />} />
      <Route path="/new" element={isLogin ? <NewPage /> : <LoginPage />} />
      <Route
        path="/weekly"
        element={isLogin ? <WeeklyPage /> : <LoginPage />}
      />
      <Route path="/daily" element={isLogin ? <DailyPage /> : <LoginPage />} />
      <Route
        path="/categories"
        element={isLogin ? <CategoryPage /> : <LoginPage />}
      />
    </Routes>
  );
};

export default Router;
