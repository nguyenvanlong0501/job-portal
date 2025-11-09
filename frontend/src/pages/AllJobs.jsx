import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobCategories, JobLocations } from "../assets/assets";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { slideRigth, SlideUp } from "../utils/Animation";

function AllJobs() {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const {
    jobs,
    searchFilter,
    setSearchFilter,
    setIsSearched,
    isSearched,
    fetchJobsData,
  } = useContext(AppContext);

  const { category } = useParams();
  const navigate = useNavigate();

  const jobsPerPage = 6;

  const [titleFilter, setTitleFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchJobsData();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!jobs?.length) return;

    let filtered = [...jobs];

    if (category !== "all") {
      filtered = filtered.filter(
        (job) => job.category.toLowerCase() === category.toLowerCase()
      );
    }

    setJobData(filtered);
    setTitleFilter(isSearched ? searchFilter.title : "");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedLevels([]);

    setCurrentPage(1);
  }, [category, jobs, isSearched, searchFilter]);

  useEffect(() => {
    let results = [...jobData];

    console.log("=== BẮT ĐẦU LỌC ===");
    console.log("Tổng số việc làm:", jobData.length);
    console.log("Danh mục đã chọn:", selectedCategories);
    console.log("Địa điểm đã chọn:", selectedLocations);
    console.log("Trình độ đã chọn:", selectedLevels);

    if (titleFilter.trim()) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      results = results.filter(job =>
        selectedCategories.some(cat => job.category === cat)
      );
    }

    if (selectedLocations.length > 0) {
      results = results.filter(job =>
        selectedLocations.some(loc => job.location === loc)
      );
    }

    if (selectedLevels.length > 0) {
      results = results.filter(job =>
        selectedLevels.some(level => job.level === level)
      );
    }

    console.log("Kết quả cuối cùng:", results.length);
    console.log("=== KẾT THÚC LỌC ===");

    setFilteredJobs(results);
    setCurrentPage(1);
  }, [jobData, titleFilter, selectedCategories, selectedLocations, selectedLevels]);

  const handleTitleChange = (e) => {
    setTitleFilter(e.target.value);
  };

  const handleCategoryToggle = (category) => {
    console.log("Chuyển đổi danh mục:", category);
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category];
      console.log("Danh mục mới:", newCategories);
      return newCategories;
    });
  };

  const handleLocationToggle = (location) => {
    console.log("Chuyển đổi địa điểm:", location);
    setSelectedLocations(prev => {
      const newLocations = prev.includes(location)
        ? prev.filter(l => l !== location)
        : [...prev, location];
      console.log("Địa điểm mới:", newLocations);
      return newLocations;
    });
  };

  const handleLevelToggle = (level) => {
    console.log("Chuyển đổi trình độ:", level);
    setSelectedLevels(prev => {
      const newLevels = prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level];
      console.log("Trình độ mới:", newLevels);
      return newLevels;
    });
  };

  const clearAllFilters = () => {
    setTitleFilter("");
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedLevels([]);
    setSearchFilter({ title: "", location: "" });
    setIsSearched(false);
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    return [...filteredJobs]
      .reverse()
      .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  }, [filteredJobs, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section className="container mx-auto px-4 py-8">
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Filter size={18} />
            {showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
          </button>
        </div>

        <motion.div
          variants={slideRigth(0.5)}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Bộ lọc */}
          <div
            className={`w-full md:w-1/4 p-4 rounded-lg border border-gray-200 bg-white ${showFilters ? "block" : "hidden md:block"
              }`}
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Tên công việc
                </h2>
                <input
                  type="text"
                  value={titleFilter}
                  onChange={handleTitleChange}
                  placeholder="Nhập tên công việc"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bộ lọc trình độ */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Trình độ
                </h2>
                <ul className="space-y-2">
                  {["Beginner", "Intermediate", "Senior"].map((level, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={() => handleLevelToggle(level)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-gray-700 cursor-pointer select-none">
                        {level === "Beginner" && "Mới bắt đầu"}
                        {level === "Intermediate" && "Trung cấp"}
                        {level === "Senior" && "Cao cấp"}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bộ lọc danh mục */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Phân loại
                </h2>
                <ul className="space-y-2">
                  {JobCategories.map((category, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-gray-700 cursor-pointer select-none">
                        {category === "Programming" && "Lập trình"}
                        {category === "Data Science" && "Khoa học dữ liệu"}
                        {category === "Designing" && "Thiết kế"}
                        {category === "Networking" && "Mạng máy tính"}
                        {category === "Management" && "Quản lý"}
                        {category === "Marketing" && "Tiếp thị"}
                        {category === "Cybersecurity" && "An ninh mạng"}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bộ lọc địa điểm */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Địa điểm
                </h2>
                <ul className="space-y-2">
                  {JobLocations.map((location, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(location)}
                        onChange={() => handleLocationToggle(location)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-gray-700 cursor-pointer select-none">
                        {location === "Hanoi" && "Hà Nội"}
                        {location === "Haiphong" && "Hải Phòng"}
                        {location === "Bacninh" && "Bắc Ninh"}
                        {location === "Tphcm" && "Thành phố Hồ Chí Minh"}
                        {location === "Binhduong" && "Bình Dương"}
                        {location === "Cantho" && "Cần Thơ"}
                        {location === "Danang" && "Đà Nẵng"}
                        {location === "Remote" && "Từ xa"}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nút xóa bộ lọc */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition font-medium"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách việc làm */}
          <div className="w-full md:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-700 capitalize mb-2">
                {category === "all"
                  ? "Tất Cả Việc Làm Mới Nhất"
                  : `Việc Làm ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                {filteredJobs.length > 0 && (
                  <span className="ml-2 text-gray-500 text-lg">
                    ({filteredJobs.length}{" "}
                    {filteredJobs.length === 1 ? "việc làm" : "việc làm"})
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Nhận công việc mong muốn của bạn từ các công ty hàng đầu
              </p>

              {/* Hiển thị bộ lọc đang áp dụng */}
              {(titleFilter || selectedCategories.length > 0 || selectedLocations.length > 0 || selectedLevels.length > 0) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Bộ lọc đang áp dụng:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {titleFilter && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Tên: "{titleFilter}"
                      </span>
                    )}
                    {selectedCategories.map(cat => (
                      <span key={cat} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {cat === "Programming" && "Lập trình"}
                        {cat === "Data Science" && "Khoa học dữ liệu"}
                        {cat === "Designing" && "Thiết kế"}
                        {cat === "Networking" && "Mạng máy tính"}
                        {cat === "Management" && "Quản lý"}
                        {cat === "Marketing" && "Tiếp thị"}
                        {cat === "Cybersecurity" && "An ninh mạng"}
                      </span>
                    ))}
                    {selectedLocations.map(loc => (
                      <span key={loc} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {loc === "Hanoi" && "Hà Nội"}
                        {loc === "Haiphong" && "Hải Phòng"}
                        {loc === "Bacninh" && "Bắc Ninh"}
                        {loc === "Tphcm" && "TP Hồ Chí Minh"}
                        {loc === "Binhduong" && "Bình Dương"}
                        {loc === "Cantho" && "Cần Thơ"}
                        {loc === "Danang" && "Đà Nẵng"}
                        {loc === "Remote" && "Từ xa"}
                      </span>
                    ))}
                    {selectedLevels.map(level => (
                      <span key={level} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        {level === "Beginner" ? "Mới bắt đầu" :
                          level === "Intermediate" ? "Trung cấp" : "Cao cấp"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <motion.div
              variants={SlideUp(0.5)}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job, i) => <JobCard key={job._id || i} job={job} />)
              ) : (
                <div className="text-center bg-white p-6 border border-gray-200 rounded-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Không tìm thấy việc làm
                  </h3>
                  <p className="text-gray-500 mb-3">
                    Hãy thử điều chỉnh bộ lọc tìm kiếm của bạn.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              )}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-md border text-center transition cursor-pointer ${currentPage === i + 1
                      ? "bg-blue-50 text-blue-500 border-blue-300"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-gray-700 transition cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default AllJobs;