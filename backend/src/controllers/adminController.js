import User from "../models/User.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const companiesCount = await Company.countDocuments();
    const jobsCount = await Job.countDocuments();
    const applicationsCount = await JobApplication.countDocuments();

    return res.json({
      users: usersCount,
      companies: companiesCount,
      jobs: jobsCount,
      applications: applicationsCount,
    });
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ success: false, message: "Không lấy được số liệu thống kê" });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email image isVerified locked");
    const companies = await Company.find().select("name email image isVerified locked");

    // unify into single list with role
    const unified = [
      ...users.map((u) => ({ _id: u._id, name: u.name, email: u.email, image: u.image, role: "candidate", locked: !!u.locked })),
      ...companies.map((c) => ({ _id: c._id, name: c.name, email: c.email, image: c.image, role: "company", locked: !!c.locked })),
    ];

    return res.json(unified);
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ success: false, message: "Không tìm nạp được người dùng" });
  }
};

// Helper: find and update lock status in User or Company
const findAccountAndUpdateLock = async (id, lock) => {
  let acc = await User.findById(id);
  if (acc) {
    acc.locked = lock;
    await acc.save();
    return { type: "user", account: acc };
  }

  acc = await Company.findById(id);
  if (acc) {
    acc.locked = lock;
    await acc.save();
    return { type: "company", account: acc };
  }

  return null;
};

// POST /api/admin/users/:id/lock
export const lockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await findAccountAndUpdateLock(id, true);
    if (!found) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
    return res.json({ success: true, message: "Khóa tài khoản thành công" });
  } catch (err) {
    console.error("lockUser error:", err);
    return res.status(500).json({ success: false, message: "Không thể khóa tài khoản" });
  }
};

// POST /api/admin/users/:id/unlock
export const unlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const found = await findAccountAndUpdateLock(id, false);
    if (!found) return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
    return res.json({ success: true, message: "Mở khóa tài khoản thành công" });
  } catch (err) {
    console.error("unlockUser error:", err);
    return res.status(500).json({ success: false, message: "Không thể mở khóa tài khoản" });
  }
};

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // try delete user
    const user = await User.findById(id);
    if (user) {
      await User.findByIdAndDelete(id);
      // also delete their applications
      await JobApplication.deleteMany({ userId: id });
      return res.json({ success: true, message: "Xóa người dùng thành công" });
    }

    const company = await Company.findById(id);
    if (company) {
      // delete company, their jobs, and related applications
      const jobs = await Job.find({ companyId: id });
      const jobIds = jobs.map((j) => j._id);
      await Job.deleteMany({ companyId: id });
      await JobApplication.deleteMany({ companyId: id });
      await JobApplication.deleteMany({ jobId: { $in: jobIds } });
      await Company.findByIdAndDelete(id);
      return res.json({ success: true, message: "Đã xóa công ty và dữ liệu liên quan" });
    }

    return res.status(404).json({ success: false, message: "Không tìm thấy tài khoản" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: "Không thể xóa tài khoản" });
  }
};

// GET /api/admin/jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("companyId", "name email image");
    return res.json(jobs);
  } catch (err) {
    console.error("getJobs error:", err);
    return res.status(500).json({ success: false, message: "Không thể lấy danh sách tin tuyển dụng" });
  }
};

// POST /api/admin/jobs/:id/approve
export const approveJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });
    job.approved = true;
    await job.save();
    return res.json({ success: true, message: "Tin tuyển dụng đã được phê duyệt" });
  } catch (err) {
    console.error("approveJob error:", err);
    return res.status(500).json({ success: false, message: "Không thể phê duyệt tin tuyển dụng" });
  }
};

// DELETE /api/admin/jobs/:id
export const deleteJobAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });

    await Job.findByIdAndDelete(id);
    await JobApplication.deleteMany({ jobId: id });

    return res.json({ success: true, message: "Xóa tin tuyển dụng thành công" });
  } catch (err) {
    console.error("deleteJobAdmin error:", err);
    return res.status(500).json({ success: false, message: "Không thể xóa tin tuyển dụng" });
  }
};
