const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_PRIVATE_KEY
const users = require('../database/schemas/users')
const otps = require('../database/schemas/otps')
const isEqual = require('safe-compare');

const verifyOtpReplyToken = async(req, res, next) => {
    const r_token = req.header('reply_token');
    if(!r_token) {
        return res.status(400).json({success: false, message: "OTP seems to be expired or invalid", code: 400})
    }

    const otp = req.body.otp

    try {

        if(typeof otp !== 'number') {
            return res.status(400).json({success: false, message: "OTP must be a number", code: 400})
        }

    const rTokenData = jwt.verify(r_token, JWT_SECRET, {expiresIn: '3m'})

    if(rTokenData.type === 'user_otp_reply_token') {

        const otp_Data = await otps.findOne({_id: rTokenData._id})
        if(!otp_Data) {
            return res.status(400).json({success: false, message: "OTP seems to be expired or invalid", code: 400})  
        }

        const findUser = await users.findOne({_id: otp_Data.user_id})
        if(!findUser) {
            return res.status(400).json({success: false, message: "The user account requesting this OTP no longer exists.", code: 400})   
        }
       if(otp_Data.expires_at < Date.now()) {
        return res.status(400).json({success: false, message: "OTP seems to be expired or invalid", code: 400})  
       }

       if(otp_Data.failed_attempts > 4) {
        return res.status(400).json({success: false, message: "Too many failed attempts, request a new otp.", code: 400})  
       }

       if(isEqual(otp, otp_Data.otp)) {

        const DataForPasswordResetToken = {
            type: 'user_password_reset_token',
            _id: findUser._id,
            pid: findUser.pid
        }

        const prt = jwt.sign(DataForPasswordResetToken, JWT_SECRET, {expiresIn: '1h'})

        await otp_Data.delete()
        findUser.verified = true;
        await findUser.save()
        return res.status(200).json({success: true, message: "Otp verified", password_reset_token: prt, code: 200})

       } else {
        otp_Data.failed_attempts++
        await otp_Data.save()
        return res.status(400).json({success: false, message: "Wrong OTP", code: 400})
       }





    

    } else {
        return res.status(400).json({success: false, message: "OTP seems to be expired or invalid", code: 400})  
    }

} catch {
    return res.status(400).json({success: false, message: "OTP seems to be expired or invalid", code: 400})
}
}

module.exports = verifyOtpReplyToken;