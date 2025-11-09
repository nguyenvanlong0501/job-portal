import axios from "axios";
import { Lock, Mail, Upload, UserRound, LoaderCircle } from "lucide-react";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const RecruiterSignup = () => {
  const [companyLogo, setCompanyLogo] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  // const [checkLoading, setCheckLoading] = useState(false);

  const { backendUrl, setCompanyData, setCompanyToken } =
    useContext(AppContext);
  const navigate = useNavigate();

  const recruiterSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", companyLogo);

      const { data } = await axios.post(
        `${backendUrl}/company/register-company`,
        formData
      );

      if (data.success) {
        if (data.token) {
          setCompanyToken(data.token);
          setCompanyData(data.companyData);
          localStorage.setItem("companyToken", data.token);
          toast.success(data.message || "Tài khoản đã được tạo. Đã đăng nhập.");
          navigate("/dashboard");
        } else {
          setRegisteredEmail(email);
          setShowVerifyPrompt(true);
          toast.success(
            data.message ||
            "Đăng ký thành công. Vui lòng xác minh email của bạn (kiểm tra hộp thư đến)."
          );
        }
      } else {
        toast.error(data.message);
      }

      console.log("Signup successful:", data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đăng ký không thành công");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/resend-verification`,
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
      const { data } = await axios.post(`${backendUrl}/company/check-verified`, {
        email: registeredEmail,
      });

      if (data.success && data.verified) {
        if (data.token) {
          setCompanyToken(data.token);
          setCompanyData(data.companyData || null);
          localStorage.setItem("companyToken", data.token);
          toast.success("Đã xác minh. Đăng nhập thành công.");
          navigate("/dashboard");
        } else {
          // try login
          try {
            const loginRes = await axios.post(`${backendUrl}/company/login`, {
              email: registeredEmail,
              password,
            });
            if (loginRes.data.success && loginRes.data.token) {
              setCompanyToken(loginRes.data.token);
              setCompanyData(loginRes.data.companyData || null);
              localStorage.setItem("companyToken", loginRes.data.token);
              toast.success("Đã xác minh. Đăng nhập thành công.");
              navigate("/dashboard");
            } else {
              toast.error(loginRes.data.message || "Đã xác minh nhưng đăng nhập không thành công.");
            }
          } catch (err) {
            toast.error(err?.response?.data?.message || "Đăng nhâp không thành công");
          }
        }
      } else {
        toast.error(data.message || "Email chưa được xác minh. Kiểm tra hộp thư đến.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi kiểm tra xác minh.");
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div>
        <main className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-md border border-gray-200 rounded-lg p-6 bg-white shadow">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-700 mb-1.5">
                Đăng ký nhà tuyển dụng
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng! Vui lòng tạo một tài khoản để tiếp tục
              </p>
            </div>

            <form className="space-y-4" onSubmit={recruiterSignup}>
              {/* Logo Upload */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer flex items-center justify-between flex-col">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
                    {companyLogo ? (
                      <img
                        src={URL.createObjectURL(companyLogo)}
                        alt="Company logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-400" />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setCompanyLogo(e.target.files[0])}
                      required
                    />
                  </div>
                  <span className="block text-xs mt-2 text-gray-500">
                    {companyLogo ? "Thay đổi logo" : "Tải lên logo công ty"}
                  </span>
                </label>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <UserRound className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Tên công ty"
                    className="w-full outline-none text-sm bg-transparent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="Nhập email"
                    className="w-full outline-none text-sm bg-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="border border-gray-300 rounded flex items-center p-2.5">
                  <Lock className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="w-full outline-none text-sm bg-transparent"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <label
                htmlFor="terms-checkbox"
                className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer"
              >
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  required
                />
                <span className="text-sm text-gray-600">Tôi đồng ý với {" "}
                  <Link to="/terms" className="text-blue-600 hover:underline">
                    Các điều khoản và điều kiện
                  </Link></span>
              </label>

              {/* Submit Button */}
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
                  to="/recruiter-login"
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
                  Chúng tôi đã gửi liên kết xác minh tới <strong>{registeredEmail}</strong>. Mở email của bạn và nhấp vào liên kết để xác minh tài khoản công ty của bạn.
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

export default RecruiterSignup;
