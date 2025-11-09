import React from "react";
import Counter from "../components/Counter";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Testimonials from "../components/Testimonials";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { SlideLeft, SlideUp } from "../utils/Animation";

const About = () => {
  return (
    <>
      <Navbar />
      <section>
        <Counter />

        {/* About Section */}
        <div className="mt-16">
          <h1 className="text-3xl md:text-4xl font-semibold mb-8 text-center text-gray-700">
            Về SuperJob
          </h1>
          <div className="max-w-4xl text-center mx-auto space-y-6 text-gray-600">
            <motion.p
              variants={SlideUp(0.3)}
              initial="hidden"
              whileInView="visible"
              className="leading-relaxed"
            >
              Nhiều đến mức một cấp bậc đã nhìn thấy bluebird sau bên ngoài được cho là nhiều hơn khi ôi loài côn trùng chim cánh cụt cầu kỳ một cách ngạo mạn không thể cưỡng lại được và wow hoàn toàn thô lỗ một cách vội vàng một con chó đốm một con chó đốm liếc nhìn một con thú lông nhím một con vẹt và thật tốt là một số con dơi đang ủ rũ đã đóng băng.
            </motion.p>
            <motion.p
              variants={SlideUp(0.5)}
              initial="hidden"
              whileInView="visible"
              className="text-lg leading-relaxed"
            >
              Nhiều lần mơ thấy alas opossum nhưng đột ngột mặc dù đã nhanh chóng rằng những chiếc xe jeep đã lỏng lẻo nói rằng con lươn bên dưới được giữ và ngủ chặt chẽ đã kêu gừ gừ chắc chắn ở phía trên phù hợp để bị quét sạch một cách ương ngạnh.
            </motion.p>
          </div>
        </div>

        <Testimonials />

        {/* How It Works Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
              SuperJob hoạt động như thế nào?
            </h1>
            <p className="text-lg text-gray-500">Việc làm cho bất cứ ai, ở bất cứ đâu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Work Step 1 */}
            <motion.div
              variants={SlideLeft(0.2)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_1}
                  alt="Resume Assessment"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Đánh giá sơ yếu lý lịch miễn phí
              </h3>
              <p className="text-gray-600">
                Nhà tuyển dụng trung bình dành 31 giây để quét sơ yếu lý lịch để xác định các ứng viên tiềm năng.
              </p>
            </motion.div>

            {/* Work Step 2 */}
            <motion.div
              variants={SlideLeft(0.4)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_2}
                  alt="Job Fit Scoring"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Chấm điểm mức độ phù hợp công việc
              </h3>
              <p className="text-gray-600">
                Thuật toán nâng cao của chúng tôi chấm điểm sơ yếu lý lịch của bạn theo tiêu chí công việc.
              </p>
            </motion.div>

            {/* Work Step 3 */}
            <motion.div
              variants={SlideLeft(0.6)}
              initial="hidden"
              whileInView="visible"
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={assets.work_3}
                  alt="Help Every Step"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Tối ưu trải nghiệm người dùng
              </h3>
              <p className="text-gray-600">
                Dễ dàng sử dụng cho dù bạn đang tìm kiếm việc làm hay tuyển dụng nhân sự.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;
