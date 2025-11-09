import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import sendEmail from "../utils/sendEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name) {
      return res.json({ success: false, message: "Vui lòng nhập tên" });
    }

    if (!email) {
      return res.json({ success: false, message: "Vui lòng nhập email" });
    }

    if (!password) {
      return res.json({ success: false, message: "Vui lòng nhập mật khẩu" });
    }

    if (!imageFile) {
      return res.json({ success: false, message: "Vui lòng tải lên ảnh" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "Người dùng đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imageUploadUrl = await cloudinary.uploader.upload(imageFile.path);

    // create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUploadUrl.secure_url,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    // send verification email
    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/user/verify?token=${verificationToken}&email=${encodeURIComponent(
      email
    )}`;

    const html = `<p>Hello ${name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyUrl}">Verify email</a>
      <p>If you didn't sign up, ignore this email.</p>`;

    try {
      await sendEmail(email, "Verify your email", html);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

    return res.json({
      success: true,
      message: "Đăng ký thành công. Email xác minh đã được gửi.",
      userData: user,
    });
  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      message: "Đăng ký thất bại",
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).send("Liên kết xác minh không hợp lệ");
    }

    const user = await User.findOne({ email, verificationToken: token });

    if (!user) {
      return res.status(400).send("Liên kết xác minh không hợp lệ hoặc đã hết hạn");
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).send("Mã xác minh đã hết hạn");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    // Optionally create token to log in user after verification
    const jwtToken = await generateToken(user._id);

  // redirect to frontend verify page with token and role so frontend will finish login
  const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${jwtToken}&role=user`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Xác minh không thành công");
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Vui lòng nhập email" });

    const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });
  if (user.isVerified) return res.json({ success: false, message: "Đã được xác minh" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/user/verify?token=${verificationToken}&email=${encodeURIComponent(
      email
    )}`;

    const html = `<p>Xin chào ${user.name},</p>
      <p>Vui lòng xác minh email của bạn bằng cách nhấp vào liên kết bên dưới:</p>
      <a href="${verifyUrl}">Xác minh email</a>`;

    try {
      await sendEmail(email, "Verify your email", html);
    } catch (err) {
      console.error("Failed to send verification email:", err);
    }

  return res.json({ success: true, message: "Email xác minh đã được gửi" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Gửi lại email xác minh thất bại" });
  }
};

export const checkVerified = async (req, res) => {
  try {
    const { email } = req.body;
  if (!email) return res.json({ success: false, message: "Vui lòng nhập email" });

    const user = await User.findOne({ email });
  if (!user) return res.json({ success: false, message: "Không tìm thấy người dùng" });

    if (user.isVerified) {
      const token = await generateToken(user._id);
      return res.json({ success: true, verified: true, token, userData: user });
    }

    return res.json({ success: true, verified: false });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Kiểm tra thất bại" });
  }
};
export const loginUser = async (req, res) => {
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

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }

    const token = await generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Đăng nhập không thành công" });
  }
};

export const fetchUserData = async (req, res) => {
  try {
    const userData = req.userData;

    return res.status(200).json({
      success: true,
      message: "Lấy dữ liệu người dùng thành công",
      userData,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "Lấy dữ liệu người dùng thất bại",
      userData,
    });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    if (!userId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Cần userId và jobId",
      });
    }

    const isAlreadyApplied = await JobApplication.findOne({ userId, jobId });

    if (isAlreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã ứng tuyển cho công việc này",
      });
    }

    const jobData = await Job.findById(jobId);

    if (!jobData) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng" });
    }

    const jobApplication = new JobApplication({
      jobId,
      userId,
      companyId: jobData.companyId,
      date: new Date(),
    });

    await jobApplication.save();

    return res.status(201).json({
      success: true,
      message: "Ứng tuyển thành công",
      jobApplication,
    });
  } catch (error) {
    console.error("Job application error:", error);

    return res.status(500).json({
      success: false,
      message: "Ứng tuyển thất bại",
    });
  }
};

// Notify company by email about a new application
export const notifyCompanyApplication = async (req, res) => {
  try {
    const { jobId, applicationId } = req.body;
    const userId = req.userData._id;

    if (!jobId || !applicationId) {
      return res.status(400).json({ success: false, message: "Cần jobId và applicationId" });
    }

    const job = await Job.findById(jobId).populate("companyId", "name email");
    const application = await JobApplication.findById(applicationId).populate("userId", "name email resume");

    if (!job || !application) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng hoặc đơn" });
    }

    const company = job.companyId;
    if (!company || !company.email) {
      return res.status(400).json({ success: false, message: "Email công ty không khả dụng" });
    }

    const applicant = application.userId;

    const subject = `New application for ${job.title}`;

    const html = `<p>Xun chào ${company.name || "Đội ngũ tuyển dụng"},</p>
      <p>${applicant.name} đã ứng tuyển vào vai trò này <strong>${job.title}</strong>.</p>
      <p>Email của người nộp đơn: ${applicant.email}</p>
      ${applicant.resume ? `<p>CV: <a href="${applicant.resume}">Tải xuống</a></p>` : ""}
      <p>Xem ứng dụng trong bảng điều khiển để phản hồi.</p>
    `;

    try {
      await sendEmail(company.email, subject, html);
    } catch (err) {
      console.error("Failed sending application notification:", err);
      return res.json({ success: false, message: "Thông báo công ty thất bại" });
    }

    return res.json({ success: true, message: "Đã thông báo công ty" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Thông báo thất bại" });
  }
};

export const getUserAppliedJobs = async (req, res) => {
  try {
    const userId = req.userData._id;

    const application = await JobApplication.find({ userId })
      .populate("companyId", "name email image")
      .populate("jobId", "title location date status");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ứng tuyển thành công",
      jobApplications: application,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Lấy danh sách ứng tuyển thất bại",
    });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const resumeFile = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng tải lên file CV",
      });
    }

    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Upload resume to Cloudinary
    const uploadedResumeUrl = await cloudinary.uploader.upload(resumeFile.path);
    userData.resume = uploadedResumeUrl.secure_url;

    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Tải CV lên thành công",
      resumeUrl: userData.resume,
    });
  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Tải CV thất bại",
    });
  }
};
