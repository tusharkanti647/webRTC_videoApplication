// import express from 'express';
import express from 'express';
import { login, googleLogin, logOut, register, authCheck } from '../controllers/userControllers.js';
import isAuthenticated from '../../../middlewares/authenticated.js';

const router = express.Router();

router.route('/signUp').post(register);
router.route('/signIn').post(login);
router.route('/googleSignIn').post(googleLogin);
router.route('/authCheck').get(isAuthenticated, authCheck);
router.route('/signOut').get(logOut);

export default router;
