import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

import generateToken from "../utils/generateToken.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import sendEmail from "../utils/sendEmail.js";

export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập tên" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập mật khẩu" });
    }

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng tải lên logo" });
    }

    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      return res
        .status(409)
        .json({ success: false, message: "Công ty đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      image: imageUpload.secure_url,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await company.save();

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/company/verify?token=${verificationToken}&email=${encodeURIComponent(
      email
    )}`;

    const html = `<p>Hello ${name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify email</a>`;

    try {
      await sendEmail(email, "Verify your company email", html);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công. Email xác minh đã được gửi.",
      companyData: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Đăng ký thất bại",
    });
  }
};

export const verifyCompany = async (req, res) => {
  try {
    const { token, email } = req.query;
  if (!token || !email) return res.status(400).send("Liên kết xác minh không hợp lệ");

    const company = await Company.findOne({ email, verificationToken: token });
  if (!company) return res.status(400).send("Liên kết xác minh không hợp lệ hoặc đã hết hạn");

    if (company.verificationTokenExpires < Date.now()) {
      return res.status(400).send("Mã xác minh đã hết hạn");
    }

    company.isVerified = true;
    company.verificationToken = undefined;
    company.verificationTokenExpires = undefined;
    await company.save();

  const jwtToken = await generateToken(company._id);
  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${jwtToken}&role=company`;
  return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Xác minh không thành công");
  }
};

export const resendCompanyVerification = async (req, res) => {
  try {
    const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Vui lòng nhập email" });

    const company = await Company.findOne({ email });
  if (!company) return res.json({ success: false, message: "Không tìm thấy công ty" });
  if (company.isVerified) return res.json({ success: false, message: "Đã được xác minh" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    company.verificationToken = verificationToken;
    company.verificationTokenExpires = verificationTokenExpires;
    await company.save();

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/company/verify?token=${verificationToken}&email=${encodeURIComponent(
      email
    )}`;

    const html = `<p>Hello ${company.name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify email</a>`;

    try {
      await sendEmail(email, "Verify your company email", html);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

  return res.json({ success: true, message: "Email xác minh đã được gửi" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Gửi lại email xác minh thất bại" });
  }
};

export const checkCompanyVerified = async (req, res) => {
  try {
    const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Vui lòng nhập email" });

    const company = await Company.findOne({ email });
  if (!company) return res.json({ success: false, message: "Không tìm thấy công ty" });

    if (company.isVerified) {
      const token = await generateToken(company._id);
      return res.json({ success: true, verified: true, token, companyData: company });
    }

    return res.json({ success: true, verified: false });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Kiểm tra thất bại" });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập email" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Vui lòng nhập mật khẩu" });
    }

    const company = await Company.findOne({ email });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy công ty" });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }

    const token = await generateToken(company._id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      companyData: company,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Đăng nhập thất bại" });
  }
};

export const fetchCompanyData = async (req, res) => {
  try {
    const company = req.companyData;

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công ty",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu công ty thành công",
      companyData: company,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Lấy dữ liệu công ty thất bại",
    });
  }
};

export const postJob = async (req, res) => {
  try {
    const { title, description, location, level, salary, category, quantity } = req.body;

    if (!title || !description || !location || !level || !salary || !category) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    // validate quantity
    let qty = 1;
    if (quantity !== undefined && quantity !== null) {
      qty = parseInt(quantity, 10);
      if (Number.isNaN(qty) || qty < 1) {
        return res.status(400).json({ success: false, message: "Số lượng phải là số nguyên dương" });
      }
    }

    const companyId = req.companyData._id;

    const job = new Job({
      title,
      description,
      location,
      level,
      salary,
      category,
      companyId,
      date: Date.now(),
      quantity: qty,
    });

    await job.save();

    return res.status(201).json({
      success: true,
      message: "Đăng tin tuyển dụng thành công",
      jobData: job,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Đăng tin thất bại",
    });
  }
};

export const getCompanyPostedAllJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const jobs = await Job.find({ companyId });

    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({ jobId: job._id });

        return { ...job.toObject(), applicants: applicants.length };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách tin tuyển dụng thành công",
      jobData: jobsData,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Lấy danh sách tin tuyển dụng thất bại",
    });
  }
};

export const changeJobVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp Job ID",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin tuyển dụng",
      });
    }

    if (job.companyId.toString() === companyId.toString()) {
      job.visible = !job.visible;
    }

    await job.save();

    return res.status(200).json({
      success: true,
      message: "Đã thay đổi trạng thái hiển thị",
    });
  } catch (error) {
    console.error("Error changing job visibility:", error);
    return res.status(500).json({
      success: false,
      message: "Thay đổi trạng thái hiển thị thất bại",
    });
  }
};


export const updateJob = async (req, res) => {
  try {
    const { id, title, description, location, level, salary, category, quantity, visible } = req.body;

  if (!id) return res.status(400).json({ success: false, message: "Vui lòng cung cấp Job ID" });

    const job = await Job.findById(id);
  if (!job) return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });

    // Only company that owns the job can update
    const companyId = req.companyData._id;
    if (job.companyId.toString() !== companyId.toString()) {
  return res.status(403).json({ success: false, message: "Không có quyền cập nhật công việc này" });
    }

    // Update allowed fields if provided
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (location !== undefined) job.location = location;
    if (level !== undefined) job.level = level;
    if (salary !== undefined) job.salary = salary;
    if (category !== undefined) job.category = category;

    if (quantity !== undefined) {
      const qty = parseInt(quantity, 10);
      if (Number.isNaN(qty) || qty < 0) {
        return res.status(400).json({ success: false, message: "Số lượng phải là số nguyên không âm" });
      }
      job.quantity = qty;
    }

    if (visible !== undefined) job.visible = !!visible;

    // ✅ Cập nhật thời gian sửa đổi - dùng timestamp
    job.updatedDate = Date.now();

    console.log("Updating job - new updatedDate:", job.updatedDate); // DEBUG

    const updatedJob = await job.save();

    // ✅ Đảm bảo populate các trường cần thiết nếu có
    const populatedJob = await Job.findById(updatedJob._id);

    return res.status(200).json({ 
      success: true, 
      message: "Cập nhật công việc thành công", 
      jobData: populatedJob // Trả về job đã được cập nhật
    });
  } catch (err) {
    console.error("Update job failed:", err);
    return res.status(500).json({ success: false, message: "Cập nhật công việc thất bại" });
  }
};

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.companyData._id;

    const applicants = await JobApplication.find({ companyId })
      .populate("userId", "name image resume")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ứng viên thành công",
      viewApplicationData: applicants,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Lấy danh sách ứng viên thất bại",
    });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Cần ID ứng dụng và trạng thái",
      });
    }
    // load existing application to check previous status and job
    const application = await JobApplication.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn ứng tuyển" });
    }

    const prevStatus = (application.status || "").toLowerCase();
    const newStatus = (status || "").toLowerCase();

    // define statuses that consume a position
    const acceptStatuses = ["accepted", "hired", "offer", "offer accepted"];

    // If transitioning to an accepted/hired status from a non-accepted one, decrement job quantity atomically
    if (!acceptStatuses.includes(prevStatus) && acceptStatuses.includes(newStatus)) {
      // try to decrement job quantity
      const updatedJob = await Job.findOneAndUpdate(
        { _id: application.jobId, quantity: { $gt: 0 }, visible: true },
        { $inc: { quantity: -1 } },
        { new: true }
      );

      if (!updatedJob) {
  return res.status(409).json({ success: false, message: "Không còn vị trí cho công việc này" });
      }

      // if quantity reached zero, mark invisible
      if (typeof updatedJob.quantity === "number" && updatedJob.quantity <= 0) {
        try {
          await Job.findByIdAndUpdate(updatedJob._id, { visible: false });
        } catch (err) {
          console.error("Failed to mark job invisible after quantity reached 0:", err);
        }
      }

      // update application status after consuming a slot
      application.status = status;
      await application.save();

  return res.status(200).json({ success: true, message: "Thay đổi trạng thái thành công", application, job: updatedJob });
    }

    // for other transitions, simply update status
    application.status = status;
    await application.save();

  return res.status(200).json({ success: true, message: "Thay đổi trạng thái thành công", application });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Thay đổi trạng thái thất bại",
    });
  }
};

// Notify applicant by email about status change
export const notifyApplicantStatus = async (req, res) => {
  try {
    const { id, status } = req.body; // id is application id

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Cần ID đơn và trạng thái" });
    }

    const application = await JobApplication.findById(id).populate("userId", "name email").populate("jobId", "title");

    if (!application) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn" });
    }

    const applicant = application.userId;

     let statusText;
    if (status.toLowerCase() === 'accepted' || status === 'chấp nhận') {
      statusText = 'đã được chấp nhận';
    } else if (status.toLowerCase() === 'rejected' || status === 'từ chối') {
      statusText = 'đã bị từ chối';
    } else {
      statusText = `đã được ${status}`;
    }

    const subject = `Đơn ứng tuyển của bạn cho vị trí ${application.jobId.title} - ${status}`;
    const html = `<p>Xin chào ${applicant.name || "Ứng viên"},</p>
      <p>Đơn ứng tuyển của bạn cho vị trí <strong>${application.jobId.title}</strong> ${statusText}.</p>
      <p>Cảm ơn bạn đã quan tâm và ứng tuyển.</p>`;

    try {
      await sendEmail(applicant.email, subject, html);
    } catch (err) {
      console.error("Failed sending status notification:", err);
      return res.json({ success: false, message: "Thông báo ứng viên thất bại" });
    }

    return res.json({ success: true, message: "Đã thông báo ứng viên" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Thông báo thất bại" });
  }
};

// ✅ Delete Job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.companyData._id;

    if (!id) {
      return res.status(400).json({ success: false, message: "Vui lòng cung cấp Job ID" });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });
    }

    // Chỉ công ty sở hữu job mới được xóa
    if (job.companyId.toString() !== companyId.toString()) {
  return res.status(403).json({ success: false, message: "Không có quyền xóa công việc này" });
    }

    // Xóa job
    await Job.findByIdAndDelete(id);

    // Xóa các đơn ứng tuyển liên quan (nếu muốn dọn sạch dữ liệu)
    await JobApplication.deleteMany({ jobId: id });

    return res.json({ success: true, message: "Xóa công việc thành công" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({ success: false, message: "Xóa công việc thất bại" });
  }
};
