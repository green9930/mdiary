import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import CategoryPage from "../pages/CategoryPage";
import DailyPage from "../pages/DailyPage";
import LoginPage from "../pages/LoginPage";
import MonthlyPage from "../pages/MonthlyPage";
import NewPage from "../pages/NewPage";
import WeeklyPage from "../pages/WeeklyPage";
import { useAppSelector } from "../context/redux";
import { initGA, logPageView } from "../utils/googleAnalytics";

interface IRouter extends React.HTMLAttributes<HTMLDivElement> {
  isLogin: boolean;
}

const Router: React.FC<IRouter> = () => {
  const [gaInit, setGaInit] = useState(false);

  let location = useLocation();
  const isLogin = useAppSelector((state) => state.user.isLogin);

  // useEffect(() => {
  //   initGA();
  //   setGaInit(true);
  // }, []);

  // useEffect(() => {
  //   if (gaInit) {
  //     console.log(location);
  //     console.log(window.location.pathname);
  //     logPageView();
  //   }
  // }, [gaInit, location]);

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
