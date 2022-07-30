const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_PRIVATE_KEY
const users = require('../database/schemas/users')

const verifyUserToken = async(req, res, next) => {

    const token = req.header('token')

    if(!token) {
        return res.status(401).json({success: false, message: "Token is expired or invalid.", code: 401})
    }
    try {

    const tokenDetails = jwt.verify(token, JWT_SECRET)

    if(tokenDetails.type === "user_account_token") {
        const user = await users.findOne({_id: tokenDetails._id, pid: tokenDetails.pid}).select('-password').select('-pid')

        if(!user) {
            return res.status(401).json({success: false, message: "Token is expired or invalid.", code: 401})
        }

        req.authorized_account = user;
        return next()

    } else {

        return res.status(401).json({success: false, message: "Token is expired or invalid.", code: 401})
    }

} catch {

    return res.status(401).json({success: false, message: "Token is expired or invalid.", code: 401})

}
}

module.exports = verifyUserToken;