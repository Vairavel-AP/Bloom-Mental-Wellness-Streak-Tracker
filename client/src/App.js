import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HabitsPage from "./pages/HabitsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BadgesPage from "./pages/BadgesPage";
import SocialPage from "./pages/SocialPage";
import SettingsPage from "./pages/SettingsPage";
import GoogleSuccessPage from "./pages/GoogleSuccessPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f3eb] dark:bg-[#1a1812]">
        <div className="w-10 h-10 border-3 border-moss-300 border-t-moss-600 rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="habits" element={<HabitsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="badges" element={<BadgesPage />} />
              <Route path="social" element={<SocialPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route
              path="/auth/google/success"
              element={<GoogleSuccessPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
