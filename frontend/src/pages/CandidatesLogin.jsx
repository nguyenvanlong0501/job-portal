import React, { useContext, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Mail, Lock, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import axios from "axios";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const CandidatesLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { backendUrl, setUserData, setUserToken, setIsLogin } =
    useContext(AppContext);

  const userLoginHandler = async (e) => {
    e.preventDefault();
    setLoading(true); //
    try {
      const { data } = await axios.post(`${backendUrl}/user/login-user`, {
        email,
        password,
      });

      if (data.success) {
        setUserToken(data.token);
        setUserData(data.userData);
        setIsLogin(true);
        localStorage.setItem("userToken", data.token);
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message || "Đăng nhập không thành công");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col">
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1">
                Đăng nhập ứng viên
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục
              </p>
            </div>

            <form className="space-y-4" onSubmit={userLoginHandler}>
              <div className="border border-gray-300 rounded flex items-center p-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Nhập email"
                  className="w-full outline-none text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="border border-gray-300 rounded flex items-center p-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label
                  htmlFor="terms-checkbox"
                  className="flex items-center gap-1 cursor-pointer text-sm text-gray-600"
                >
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    required
                  />
                  Tôi đồng ý với {" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Các điều khoản và điều kiện
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex justify-center items-center cursor-pointer ${loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5" />
                ) : (
                  "Đăng nhập"
                )}
              </button>

              <div className="text-center text-sm text-gray-600 mt-2">
                Bạn không có tài khoản?{" "}
                <Link
                  to="/candidate-signup"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Đăng ký
                </Link>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CandidatesLogin;
