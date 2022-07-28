const users = require('../database/schemas/users');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_PRIVATE_KEY;

const verifyVerificationToken = async(req, res, next) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({success: false, message: "Verification token invalid or expired.", code: 400})
    }

    try {

        const verifiedData = jwt.verify(token, JWT_SECRET , {expiresIn: '1h'})
if(verifiedData.type === 'user_verification_token') {

       const user = await users.findOne({
            _id: verifiedData._id,
            pid: verifiedData.pid

        })
        if(!user) {
            return res.status(400).json({success: false, message: "Verification token invalid or expired.", code: 400})  
        }

        req.verification_user = user;
        return next()


    } else {

        return res.status(400).json({success: false, message: "Verification token invalid or expired.", code: 400})
   
    }

    } catch {

        return res.status(400).json({success: false, message: "Verification token invalid or expired.", code: 400})

    }

};

module.exports = verifyVerificationToken;