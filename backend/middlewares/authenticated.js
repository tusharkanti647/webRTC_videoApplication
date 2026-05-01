import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.JWTToken;

    if (!token) {
      return res.status(401).json({ message: 'User not Authenticated', success: false });
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode || !decode.userId) {
      return res.status(401).json({ message: 'Invalid token', success: false });
    }

    // 2. Check user exists in DB
    const user = await User.findById(decode.userId).select('_id');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.id = user._id;
    next();
  } catch (e) {
    console.log('ERROR', e);
    return res.status(500).json({ message: 'Internal Server Error.', success: false });
  }
};

export default isAuthenticated;
