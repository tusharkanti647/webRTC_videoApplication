import { Router } from 'express';

import isAuthenticated from '../../../middlewares/authenticated.js';
import { createRoom } from '../controllewares/roomController.js';
import { hostKick, hostMute } from '../../user/controllers/hostController.js';
import { validate } from '../../../middlewares/zodValidate.js';
import { createRoomSchima } from '../room.zod.schima.js';

const router = Router();

router.route('/create/').post(validate(createRoomSchima), isAuthenticated, createRoom);
router.route('/mute/:id').post(isAuthenticated, hostMute);
router.route('/kick/:id').post(isAuthenticated, hostKick);

export default router;
