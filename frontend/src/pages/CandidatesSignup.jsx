import axios from "axios";
import { LoaderCircle, Lock, Mail, Upload, UserRound } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

const CandidatesSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  // const [checkLoading, setCheckLoading] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, setUserData, setUserToken, setIsLogin } =
    useContext(AppContext);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const userSignupHanlder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/user/register-user`,
        formData
      );

      if (data.success) {
        // If backend immediately returns a token (already verified), continue login flow
        if (data.token) {
          setUserToken(data.token);
          setUserData(data.userData);
          setIsLogin(true);
          localStorage.setItem("userToken", data.token);
          toast.success(data.message || "Tài khoản đã được tạo. Đã đăng nhập.");
          navigate("/");
        } else {
          // Otherwise prompt the user to check their email for verification
          setRegisteredEmail(email);
          setShowVerifyPrompt(true);
          toast.success(
            data.message ||
            "Đăng ký thành công. Vui lòng xác minh email của bạn (kiểm tra hộp thư đến).")
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/user/resend-verification`,
        { email: registeredEmail }
      );
      if (data.success) {
        toast.success(data.message || "Gửi lại email xác minh.");
      } else {
        toast.error(data.message || "Không thể gửi lại email xác minh.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể gửi lại.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!registeredEmail) return;
    setCheckLoading(true);
    try {
      // Ask backend whether the user's email has been verified yet
      const { data } = await axios.post(`${backendUrl}/user/check-verified`, {
        email: registeredEmail,
      });

      if (data.success && data.verified) {
        // If backend returns a token, use it. Otherwise try to login with provided credentials.
        if (data.token) {
          setUserToken(data.token);
          setUserData(data.userData || null);
          setIsLogin(true);
          localStorage.setItem("userToken", data.token);
          toast.success("Đã xác minh email. Đã đăng nhập.");
          navigate("/");
        } else {
          // Attempt login to get token (we kept password in state)
          try {
            const loginRes = await axios.post(`${backendUrl}/user/login`, {
              email: registeredEmail,
              password,
            });
            if (loginRes.data.success && loginRes.data.token) {
              setUserToken(loginRes.data.token);
              setUserData(loginRes.data.userData || null);
              setIsLogin(true);
              localStorage.setItem("userToken", loginRes.data.token);
              toast.success("Đã xác minh email. Đã đăng nhập.");
              navigate("/");
            } else {
              toast.error(
                loginRes.data.message || "Đã xác minh nhưng không đăng nhập được."
              );
            }
          } catch (err) {
            toast.error(err?.response?.data?.message || "Đăng nhập không thành công.");
          }
        }
      } else {
        toast.error(data.message || "Email chưa được xác minh. Kiểm tra hộp thư đến của bạn.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Kiểm tra xác minh không thành công.");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1">
                Đăng ký ứng viên
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng! Vui lòng đăng ký để tiếp tục
              </p>
            </div>

            <form className="space-y-4" onSubmit={userSignupHanlder}>
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer flex items-center justify-between flex-col">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <span className="block text-xs mt-2 text-gray-500">
                    {image ? "Thay đổi ảnh" : "Tải ảnh của bạn lên"}
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Nhập tên"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Nhập email"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex justify-center items-center cursor-pointer ${loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5" />
                ) : (
                  "Đăng ký"
                )}
              </button>

              <div className="text-center text-sm text-gray-600 pt-2">
                Bạn đã có tài khoản?{" "}
                <Link
                  to="/candidate-login"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Đăng nhập
                </Link>
              </div>
            </form>

            {showVerifyPrompt && (
              <div className="mt-4 border border-yellow-200 bg-yellow-50 p-4 rounded">
                <h3 className="text-sm font-medium text-yellow-800">Verify your email</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Chúng tôi đã gửi liên kết xác minh tới
                  <strong>{registeredEmail}</strong>. Vui lòng mở email của bạn và nhấp vào liên kết để xác minh tài khoản của bạn.

                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className={`px-3 py-1 text-sm rounded bg-blue-600 text-white ${resendLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"
                      }`}
                  >
                    {resendLoading ? "Đang gửi lại..." : "Gửi lại xác minh"}
                  </button>

                  <button
                    onClick={() => setShowVerifyPrompt(false)}
                    className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Quay lại đăng ký

                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CandidatesSignup;
