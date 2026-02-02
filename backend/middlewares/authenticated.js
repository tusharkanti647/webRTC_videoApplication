import jwt from 'jsonwebtoken';

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.JWTToken;

        if (!token) {
            return res.status(401).json({ message: 'User not Authenticated', success: false });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        if (!decode) {
            return res.status(401).json({ message: 'Invalid token', success: false });
        }

        req.id = decode.userId;
        next();
    } catch (e) {
        console.log('ERROR', e)
        return res.status(500).json({ message: "Internal Server Error.", success: false });
    }

}

export default isAuthenticated;