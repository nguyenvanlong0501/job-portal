import express from "express";
import {
  fetchCompanyData,
  loginCompany,
  postJob,
  registerCompany,
  verifyCompany,
  resendCompanyVerification,
  checkCompanyVerified,
  getCompanyPostedAllJobs,
  changeJobVisibility,
  updateJob,
  getCompanyJobApplicants,
  changeStatus,
  notifyApplicantStatus,
  deleteJob,
} from "../controllers/companyController.js";
import upload from "../utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.get("/verify", verifyCompany);
router.post("/resend-verification", resendCompanyVerification);
router.post("/check-verified", checkCompanyVerified);
router.post("/login-company", loginCompany);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.post("/update-job", companyAuthMiddleware, updateJob);
router.get(
  "/company/posted-jobs",
  companyAuthMiddleware,
  getCompanyPostedAllJobs
);
router.post("/change-visiblity", companyAuthMiddleware, changeJobVisibility);
router.post(
  "/view-applications",
  companyAuthMiddleware,
  getCompanyJobApplicants
);
router.post("/change-status", companyAuthMiddleware, changeStatus);
router.post("/notify-applicant-status", companyAuthMiddleware, notifyApplicantStatus);
router.post("/delete-job", companyAuthMiddleware, deleteJob);



export default router;
