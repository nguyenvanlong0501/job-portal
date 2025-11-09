import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { motion } from "framer-motion";
import { SlideUp } from "../utils/Animation";

const FeaturedJob = () => {
  const { jobs, jobLoading } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <section className="mt-24">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-700 mb-2">Việc làm nổi bật</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Khám phá giá trị bản thân và tìm kiếm công việc phù hợp với cuộc sống của bạn
        </p>
      </div>
      {jobLoading ? (
        <div className="flex items-center justify-center mt-10">
          <Loader />
        </div>
      ) : !Array.isArray(jobs) || jobs.length === 0 ? (
        <p className="text-center text-gray-500">Không có việc làm nào</p>
      ) : (
        <>
          <motion.div
            variants={SlideUp(0.5)}
            initial="hidden"
            whileInView="visible"
            className="grid gap-4 grid-cols-1 md:grid-cols-2"
          >
            {[...jobs]
              .reverse()
              .slice(0, 6)
              .map((job, index) => (
                <JobCard job={job} key={job.id || index} />
              ))}
          </motion.div>

          <motion.div
            variants={SlideUp(0.5)}
            initial="hidden"
            whileInView="visible"
            className="text-center mt-12"
          >
            <button
              onClick={() => {
                navigate("/all-jobs/all");
                window.scrollTo(0, 0);
              }}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
              Xem tất cả việc làm
            </button>
          </motion.div>
        </>
      )}
    </section>
  );
};

export default FeaturedJob;