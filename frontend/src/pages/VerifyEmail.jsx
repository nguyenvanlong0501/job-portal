import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const useQuery = () => new URLSearchParams(useLocation().search);

const VerifyEmail = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { setUserToken, setCompanyToken, setIsLogin, setIsCompanyLogin } =
    useContext(AppContext);

  useEffect(() => {
    const token = query.get("token");
    const role = query.get("role");

    if (token && role) {
      if (role === "user") {
        setUserToken(token);
        setIsLogin(true);
        localStorage.setItem("userToken", token);
        toast.success("Đã xác minh email. Đã đăng nhập.");
        navigate("/");
      } else if (role === "company") {
        setCompanyToken(token);
        setIsCompanyLogin(true);
        localStorage.setItem("companyToken", token);
        toast.success("Email công ty đã được xác minh. Đã đăng nhập.");
        navigate("/dashboard");
      } else {
        toast.error("Vai trò không hợp lệ trong liên kết xác minh.");
        navigate("/");
      }
    } else {
      toast.error("Liên kết xác minh không hợp lệ.");
      navigate("/");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white border rounded">Đang xác minh...</div>
    </div>
  );
};

export default VerifyEmail;
