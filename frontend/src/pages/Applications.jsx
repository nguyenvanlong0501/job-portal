import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const Applications = () => {
  const {
    userApplication,
    applicationsLoading,
    backendUrl,
    userToken,
    userData,
    fetchUserData,
    fetchUserApplication,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleResumeSave = async () => {
    if (!resumeFile) {
      toast.error("Chọn file CV");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post(
        `${backendUrl}/user/upload-resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token: userToken,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error?.response?.data?.message || "Lỗi tải lên CV.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserApplication();
  }, []);

  return (
    <>
      <Navbar />
      <section>
        {/* Resume Section */}
        <div className="mb-10">
          <h1 className="text-lg font-medium mb-3">CV của bạn</h1>
          {isEdit ? (
            <div className="flex items-center flex-wrap gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  {resumeFile ? resumeFile.name : "Select resume"}
                </span>
                <img
                  className="w-8"
                  src={assets.profile_upload_icon}
                  alt="Upload icon"
                />
              </label>

              <div className="flex gap-2">
                <button
                  disabled={!resumeFile || loading}
                  onClick={handleResumeSave}
                  className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors border border-gray-200  ${!resumeFile || loading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-100 text-blue-500 hover:bg-blue-200 cursor-pointer"
                    }`}
                >
                  {loading ? (
                    <>
                      <LoaderCircle className="animate-spin w-4 h-4" />
                      Đang tải lên...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {userData?.resume ? (
                <a
                  href={userData.resume}
                  target="_blank"
                  className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors"
                >
                  Xem CV
                </a>
              ) : (
                <span className="bg-blue-100 text-blue-500 rounded px-3 py-1.5 text-sm hover:bg-blue-200 transition-colors">
                  Không có CV nào được tải lên
                </span>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {userData?.resume ? "Cập nhật" : "Tải lên"}
              </button>
            </div>
          )}
        </div>

        {/* Applications Table */}
        {applicationsLoading ? (
          <div className="flex justify-center items-center mt-20">
            <Loader />
          </div>
        ) : !userApplication || userApplication.length === 0 ? (
          <p className="text-center text-gray-500">Không tìm thấy ứng dụng nào.</p>
        ) : (
          <>
            <h1 className="text-lg font-medium mb-3">Việc làm đã ứng tuyển</h1>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Công ty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên công việc
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Địa điểm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Ngày
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...userApplication].reverse().map((job) => (
                      <tr key={job._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <img
                              src={
                                job?.companyId?.image || assets.default_profile
                              }
                              alt={job?.companyId?.name || "Company logo"}
                              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.src = assets.default_profile;
                              }}
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 truncate max-w-[150px]">
                              {job?.companyId?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate">
                          {job?.jobId?.title}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                          {job?.jobId?.location === "Hanoi" && "Hà Nội"}
                          {job?.jobId?.location === "Haiphong" && "Hải Phòng"}
                          {job?.jobId?.location === "Bacninh" && "Bắc Ninh"}
                          {job?.jobId?.location === "Tphcm" && "Thành phố Hồ Chí Minh"}
                          {job?.jobId?.location === "Binhduong" && "Bình Dương"}
                          {job?.jobId?.location === "Cantho" && "Cần Thơ"}
                          {job?.jobId?.location === "Danang" && "Đà Nẵng"}
                          {job?.jobId?.location === "Remote" && "Từ xa"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {moment(job.date).format("ll")}
                        </td>
                        <td className="px-4 py-4">
                          {(() => {
                            const rawStatus = job?.status || "";
                            let label = rawStatus;
                            let colorClass = "text-green-500";

                            if (rawStatus === "Pending" || rawStatus.toLowerCase() === "pending" || rawStatus === "Đang xử lý") {
                              label = "Đang xử lý";
                              colorClass = "text-blue-500";
                            } else if (rawStatus === "Rejected") {
                              label = "Đã từ chối";
                              colorClass = "text-red-500";
                            } else if (rawStatus === "Accepted") {
                              label = "Đã chấp nhận";
                              colorClass = "text-green-500";
                            }

                            return (
                              <span className={`px-2 inline-flex text-xs font-semibold ${colorClass}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Applications;
