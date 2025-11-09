import React, { useContext, useEffect, useState, useRef } from "react";
import moment from "moment";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { toast } from "react-hot-toast";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { LoaderCircle, AlertTriangle, Calendar } from "lucide-react";

const ManageJobs = () => {
  const [manageJobData, setManageJobData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { backendUrl, companyToken } = useContext(AppContext);

  const fetchManageJobsData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/company/company/posted-jobs`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        const sortedJobs = (data.jobData || []).sort((a, b) => {
          const timestampA = a.updatedDate || a.date;
          const timestampB = b.updatedDate || b.date;
          return timestampB - timestampA;
        });
        setManageJobData(sortedJobs);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Không thể tải công việc");
    } finally {
      setLoading(false);
    }
  };

  // State cho Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editFields, setEditFields] = useState({
    title: "",
    location: "",
    salary: "",
    quantity: 1,
    visible: true,
    description: "",
    category: "Programming",
    level: "Intermediate",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const modalRef = useRef(null);

  // State cho Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteModalRef = useRef(null);

  const openEditModal = (job) => {
    setEditingJob(job);
    setEditFields({
      title: job.title || "",
      location: job.location || "",
      salary: job.salary || "",
      quantity: job.quantity ?? 1,
      visible: !!job.visible,
      description: job.description || "",
      category: job.category || "Programming",
      level: job.level || "Intermediate",
    });
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingJob(null);
    if (quillRef.current) {
      quillRef.current = null;
    }
  };

  const openDeleteModal = (job) => {
    setDeletingJob(job);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeletingJob(null);
  };

  // ✅ Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeEditModal();
      }
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        closeDeleteModal();
      }
    };

    if (isEditOpen || isDeleteOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditOpen, isDeleteOpen]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Khởi tạo Quill
  useEffect(() => {
    if (isEditOpen && editorRef.current) {
      if (quillRef.current) {
        const editorElement = editorRef.current;
        editorElement.innerHTML = "";
      }

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['link', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }]
          ]
        }
      });

      if (editFields.description) {
        quillRef.current.root.innerHTML = editFields.description;
      }

      quillRef.current.on("text-change", () => {
        const html = quillRef.current.root.innerHTML;
        setEditFields((prev) => ({ ...prev, description: html }));
      });
    }
  }, [isEditOpen]);

  useEffect(() => {
    if (isEditOpen && quillRef.current && editFields.description) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== editFields.description) {
        quillRef.current.root.innerHTML = editFields.description;
      }
    }
  }, [editFields.description, isEditOpen]);

  // ✅ Cập nhật job
  const submitJobUpdate = async () => {
    if (!editingJob) return;

    const finalDescription = quillRef.current ? quillRef.current.root.innerHTML : editFields.description;

    try {
      setSubmitLoading(true);
      const payload = {
        id: editingJob._id,
        ...editFields,
        description: finalDescription,
        salary: Number(editFields.salary),
        quantity: Number(editFields.quantity),
        visible: !!editFields.visible,
      };

      const { data } = await axios.post(`${backendUrl}/company/update-job`, payload, {
        headers: { token: companyToken },
      });

      if (data.success) {
        toast.success(data.message || "Cập nhật công việc thành công");
        closeEditModal();

        setManageJobData(prev => {
          const updatedJobs = prev.map(job =>
            job._id === editingJob._id
              ? data.jobData
              : job
          );
          return updatedJobs.sort((a, b) => {
            const timestampA = a.updatedDate || a.date;
            const timestampB = b.updatedDate || b.date;
            return timestampB - timestampA;
          });
        });
      } else {
        toast.error(data.message || "Cập nhật không thành công");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cập nhật không thành công");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ Thay đổi trạng thái hiển thị
  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/company/change-visiblity`,
        { id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchManageJobsData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  // ✅ Xóa job
  const confirmDeleteJob = async () => {
    if (!deletingJob) return;

    try {
      setDeleteLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/company/delete-job`,
        { id: deletingJob._id },
        { headers: { token: companyToken } }
      );
      if (data.success) {
        toast.success("Đã xóa công việc thành công");
        closeDeleteModal();
        fetchManageJobsData();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xóa không thành công");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchManageJobsData();
  }, []);

  useEffect(() => {
    document.title = "SuperJob - Manage Jobs";
  }, []);

  // ✅ Hàm hiển thị date với tooltip chi tiết
  const displayDate = (job) => {
    const hasUpdatedDate = job.updatedDate && job.updatedDate !== job.date;
    const displayTimestamp = hasUpdatedDate ? job.updatedDate : job.date;
    const displayDate = new Date(displayTimestamp);

    return (
      <div className="flex items-center gap-1 group relative">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">
          {moment(displayDate).format("ll")}
        </span>
        {hasUpdatedDate && (
          <span
            className="ml-1 text-xs text-blue-600 cursor-help"
            title={`Last updated: ${moment(new Date(job.updatedDate)).format("lll")}`}
          >
            ↻
          </span>
        )}
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {hasUpdatedDate ? (
            <>
              <div>Created: {moment(new Date(job.date)).format("ll")}</div>
              <div>Updated: {moment(new Date(job.updatedDate)).format("ll")}</div>
            </>
          ) : (
            `Created: ${moment(new Date(job.date)).format("ll")}`
          )}
        </div>
      </div>
    );
  };

  return (
    <section>
      {/* Header với thông tin sắp xếp */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý công việc</h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Công việc được sắp xếp theo ngày sửa đổi lần cuối (gần đây nhất xếp trước)
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <Loader />
        </div>
      ) : !manageJobData?.length ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Không tìm thấy việc làm</p>
          <p className="text-sm">Bạn chưa đăng tuyển dụng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
          <table className="w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left w-12">#</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left min-w-[200px]">Tên công việc</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left min-w-[120px]">Địa điểm</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-left min-w-[140px]">Sửa đổi lần cuối</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center min-w-[80px]">Còn lại</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center min-w-[120px]">Số lượng ứng tuyển</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center min-w-[80px]">Hiển thị</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center min-w-[140px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {manageJobData.map((job, i) => (
                <tr key={job._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {job.category === "Programming" && "Lập trình"}
                      {job.category === "Data Science" && "Khoa học dữ liệu"}
                      {job.category === "Designing" && "Thiết kế"}
                      {job.category === "Networking" && "Mạng máy tính"}
                      {job.category === "Management" && "Quản lý"}
                      {job.category === "Marketing" && "Tiếp thị"}
                      {job.category === "Cybersecurity" && "An ninh mạng"} •  {job.level === "Beginner" && "Mới bắt đầu"}
                      {job.level === "Intermediate" && "Trung cấp"}
                      {job.level === "Senior" && "Cao cấp"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {job.location === "Hanoi" && "Hà Nội"}
                    {job.location === "Haiphong" && "Hải Phòng"}
                    {job.location === "Bacninh" && "Bắc Ninh"}
                    {job.location === "Tphcm" && "Thành phố Hồ Chí Minh"}
                    {job.location === "Binhduong" && "Bình Dương"}
                    {job.location === "Cantho" && "Cần Thơ"}
                    {job.location === "Danang" && "Đà Nẵng"}
                    {job.location === "Remote" && "Từ xa"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {displayDate(job)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{job.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${job.applicants > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-600"
                      }`}>
                      {job.applicants || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={job.visible}
                      onChange={() => changeJobVisiblity(job._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(job)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm cursor-pointer"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={() => openDeleteModal(job)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium text-sm cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Cập nhật công việc</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6" id="quill-scrolling-container">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tên công việc</label>
                  <input
                    name="title"
                    value={editFields.title}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên công việc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Địa điểm làm việc</label>
                  <select
                    name="location"
                    value={editFields.location}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Chọn địa điểm</option>
                    <option value="Hanoi">Hà Nội</option>
                    <option value="Haiphong">Hải Phòng</option>
                    <option value="Bacninh">Bắc Ninh</option>
                    <option value="Tphcm">Thành phố Hồ Chí Minh</option>
                    <option value="Binhduong">Bình Dương</option>
                    <option value="Cantho">Cần Thơ</option>
                    <option value="Danang">Đà Nẵng</option>
                    <option value="Remote">Từ xa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mức lương</label>
                  <input
                    name="salary"
                    type="number"
                    value={editFields.salary}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phân loại công việc</label>
                  <select
                    name="category"
                    value={editFields.category}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="Programming">Lập trình</option>
                    <option value="Data Science">Khoa học dữ liệu</option>
                    <option value="Designing">Thiết kế</option>
                    <option value="Networking">Mạng máy tính</option>
                    <option value="Management">Quản lý</option>
                    <option value="Marketing">Tiếp thị</option>
                    <option value="Cybersecurity">An ninh mạng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Trình độ</label>
                  <select
                    name="level"
                    value={editFields.level}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="Beginner">Mới bắt đầu</option>
                    <option value="Intermediate">Trung cấp</option>
                    <option value="Senior">Cao cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Số lượng</label>
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    value={editFields.quantity}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <div
                      ref={editorRef}
                      className="bg-white min-h-[150px] max-h-[200px] overflow-y-auto"
                      style={{ height: '150px' }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    id="visible"
                    name="visible"
                    type="checkbox"
                    checked={editFields.visible}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="visible" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Hiển thị cho người nộp đơn
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeEditModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={submitJobUpdate}
                  disabled={submitLoading}
                  className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium ${submitLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                  {submitLoading ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin h-4 w-4" />
                      Đang lưu...
                    </span>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            ref={deleteModalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Xóa công việc</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Bạn có chắc chắn muốn xóa công việc này? Không thể hoàn tác hành động này.
                  </p>
                </div>
              </div>

              {deletingJob && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-red-800">{deletingJob.title}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Địa điểm: {deletingJob.location} • Đơn ứng tuyển: {deletingJob.applicants || 0}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDeleteJob}
                  disabled={deleteLoading}
                  className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium ${deleteLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                  {deleteLoading ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="animate-spin h-4 w-4" />
                      Đang xóa...
                    </span>
                  ) : (
                    "Xóa công việc"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageJobs;