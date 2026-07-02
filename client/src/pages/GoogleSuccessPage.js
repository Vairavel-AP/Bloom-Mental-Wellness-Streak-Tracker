import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const GoogleSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Save token and load user
    localStorage.setItem("wellness_token", token);

    api
      .get("/auth/me")
      .then(({ data }) => {
        updateUser(data.user);
        navigate("/");
      })
      .catch(() => {
        navigate("/login");
      });
  }, [params, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f3eb]">
      <div className="text-center">
        <div className="text-4xl mb-3">🌱</div>
        <p className="text-ink-600 font-medium">Signing you in...</p>
      </div>
    </div>
  );
};

export default GoogleSuccessPage;
