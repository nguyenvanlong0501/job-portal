import React, { useContext, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";

const AddJob = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Programming");
  const [location, setLocation] = useState("Hanoi");
  const [level, setLevel] = useState("Intermediate");
  const [salary, setSalary] = useState("");
  const [quantity, setQuantity] = useState(1); // 🆕 Thêm trường số lượng
  const [loading, setLoading] = useState(false);

  const { backendUrl, companyToken } = useContext(AppContext);

  const postJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/company/post-job`,
        {
          title,
          description,
          category,
          location,
          level,
          salary,
          quantity: Number(quantity), // 🆕 gửi thêm field số lượng lên server
        },
        {
          headers: { token: companyToken },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setTitle("");
        setDescription("");
        setCategory("Programming");
        setLocation("Hanoi");
        setLevel("Intermediate");
        setSalary("");
        setQuantity(1); // reset field
        if (quillRef.current) quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Viết mô tả công việc ở đây...",
      });

      quillRef.current.on("text-change", () => {
        const html = editorRef.current.querySelector(".ql-editor").innerHTML;
        setDescription(html);
      });
    }
  }, []);

  useEffect(() => {
    document.title = "SuperJob - Job Portal | Dashboard";
  }, []);

  return (
    <section className="mr-1 mb-6">
      <form onSubmit={postJob}>
        {/* Job Title */}
        <div className="mb-6">
          <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            Tên công việc
          </label>
          <input
            type="text"
            placeholder="Nhập tên công việc"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
            Mô tả công việc
          </label>
          <div
            ref={editorRef}
            style={{
              minHeight: "150px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
            }}
          />
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Category */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Phân loại công việc
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Location */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Địa điểm làm việc
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Hanoi">Hà Nội</option>
              <option value="Haiphong">Hải Phòng</option>
              <option value="Bacninh">Bắc Ninh</option>
              <option value="Tphcm">Thành phố Hồ Chí Minh</option>
              <option value="Binhduong">Bình Dương</option>
              <option value="Cantho">Cần Thơ</option>
              <option value="Danang">Đà Nẵng</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Trình độ
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Beginner">Mới bắt đầu</option>
              <option value="Intermediate">Trung cấp</option>
              <option value="Senior">Cao cấp</option>

            </select>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Mức Lương
            </label>
            <input
              type="number"
              placeholder="Nhập mức lương"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>

          {/* 🆕 Quantity */}
          <div>
            <label className="block text-gray-800 text-lg font-semibold mb-3 pb-1 border-b border-gray-200">
              Số lượng cần tuyển
            </label>
            <input
              type="number"
              placeholder="Nhập số lượng nhân sự cần tuyển"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              required
              min={1}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-8 font-semibold rounded ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
        >
          {loading ? (
            <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
          ) : (
            "Thêm việc làm"
          )}
        </button>
      </form>
    </section>
  );
};

export default AddJob;
