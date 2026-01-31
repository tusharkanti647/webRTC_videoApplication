import { Router } from "express";


import { createRoom } from '../controllers/roomController.js';
import isAuthenticated from '../middlewares/authenticated.js';
import { hostKick, hostMute } from "../controllers/hostController.js";


const router = Router();

// router.post("/", requireAuth, createRoom);
// router.get("/:id", getRoom);




router.route('/create/').post(isAuthenticated, createRoom);
router.route('/mute/:id').post(isAuthenticated, hostMute);
router.route('/kick/:id').post(isAuthenticated, hostKick);

export default router;









