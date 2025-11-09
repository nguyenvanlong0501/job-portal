import Job from "../models/Job.js";

const getAllJobs = async (req, res) => {
  try {
    // Only return jobs that are visible and still have remaining quantity
    const jobs = await Job.find({ visible: true, quantity: { $gt: 0 } }).populate(
      "companyId",
      "-password"
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tin tuyển dụng thành công",
      jobData: jobs,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Lấy danh sách tin tuyển dụng thất bại",
    });
  }
};

export default getAllJobs;
