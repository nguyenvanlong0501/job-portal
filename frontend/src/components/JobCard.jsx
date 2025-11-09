import React from "react";
import moment from "moment";
// use Intl.NumberFormat to display salary in VND
import { assets } from "../assets/assets";
import { MapPin, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      key={job._id}
      onClick={() => {
        navigate(`/apply-job/${job._id}`);
        scrollTo(0, 0);
      }}
      className="flex gap-4 rounded-lg border border-gray-200 p-5 hover:shadow transition cursor-pointer"
    >
      <img
        className="w-[50px] h-[50px] object-contain"
        src={job.companyId?.image || assets.company_icon}
        alt={`${job.companyId?.name || "Công ty"} Logo`}
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h1 className="text-xl text-gray-700 font-semibold mb-1">
            {job.title}
          </h1>
          {typeof job.quantity === 'number' && (
            <span className="text-sm text-white bg-blue-600 px-2 py-0.5 rounded-md ml-2 h-min">
              Còn lại: {job.quantity}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-3">
          <div className="flex items-center gap-2">
            <img src={assets.suitcase_icon} alt="Công ty" />
            <span>{job.companyId?.name || "Công ty không xác định"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={20} />
            <span>{job.category === "Programming" && "Lập trình"}
              {job.category === "Data Science" && "Khoa học dữ liệu"}
              {job.category === "Designing" && "Thiết kế"}
              {job.category === "Networking" && "Mạng máy tính"}
              {job.category === "Management" && "Quản lý"}
              {job.category === "Marketing" && "Tiếp thị"}
              {job.category === "Cybersecurity" && "An ninh mạng"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={19} />
            <span>{job.location === "Hanoi" && "Hà Nội"}
              {job.location === "Haiphong" && "Hải Phòng"}
              {job.location === "Bacninh" && "Bắc Ninh"}
              {job.location === "Tphcm" && "Thành phố Hồ Chí Minh"}
              {job.location === "Binhduong" && "Bình Dương"}
              {job.location === "Cantho" && "Cần Thơ"}
              {job.location === "Danang" && "Đà Nẵng"}
              {job.location === "Remote" && "Remote"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={19} />
            <span>{moment(job.date).fromNow()}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.money_icon} alt="Lương" />
            <span>
              Mức lương: {job.salary ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(job.salary)) : "Không công bố"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;