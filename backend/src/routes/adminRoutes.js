import express from "express";
import {
  getStats,
  getUsers,
  lockUser,
  unlockUser,
  deleteUser,
  getJobs,
  approveJob,
  deleteJobAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/users", getUsers);
router.post("/users/:id/lock", lockUser);
router.post("/users/:id/unlock", unlockUser);
router.delete("/users/:id", deleteUser);

router.get("/jobs", getJobs);
router.post("/jobs/:id/approve", approveJob);
router.delete("/jobs/:id", deleteJobAdmin);

export default router;
