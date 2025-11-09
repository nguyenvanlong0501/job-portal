import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  resendVerification,
  checkVerified,
  notifyCompanyApplication,
  fetchUserData,
  applyJob,
  getUserAppliedJobs,
  uploadResume,
} from "../controllers/userController.js";
import upload from "../utils/upload.js";
import userAuthMiddleware from "../middlewares/userAuthMiddleware.js";

const router = express.Router();

router.post("/register-user", upload.single("image"), registerUser);
router.post("/login-user", upload.single("image"), loginUser);
router.get("/verify", verifyUser);
router.post("/resend-verification", resendVerification);
router.post("/check-verified", checkVerified);
router.get("/user-data", userAuthMiddleware, fetchUserData);
router.post("/apply-job", userAuthMiddleware, applyJob);
router.post("/notify-company-application", userAuthMiddleware, notifyCompanyApplication);
router.post("/get-user-applications", userAuthMiddleware, getUserAppliedJobs);
router.post(
  "/upload-resume",
  userAuthMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;
