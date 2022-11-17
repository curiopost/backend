const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_PRIVATE_KEY
const users = require('../database/schemas/users')
const bcrypt = require('bcrypt');
const aerect = require('aerect.js')

const verifyPasswordResetToken = async (req, res, next) => {
    const reset_password_key = req.header("reset_password_key");
    const { newpassword } = req.body;

    if (!newpassword) {
        return res.status(400).json({ success: false, message: "New Password is required.", code: 400 })
    }

    if (!reset_password_key) {
        return res.status(400).json({ success: false, message: "Password change time expired.", code: 400 })
    }

    try {

        const verifyPCT = jwt.verify(reset_password_key, JWT_SECRET, { expiresIn: '1h' })
        if (verifyPCT.type === 'user_password_reset_token') {
            const findUser = await users.findOne({ _id: verifyPCT._id, pid: verifyPCT.pid })
            if (!findUser) {
                return res.status(400).json({ success: false, message: "Unable to fullfill this request.", code: 400 })
            }

            if (newpassword.length < 4) {
                return res.status(400).json({ success: false, message: "new Password must be atleast 5 characters long", code: 400 })
            }
            const salt = bcrypt.genSaltSync(10)
            const hashNP = bcrypt.hashSync(newpassword, salt)
            const PID = aerect.generateID(59)
            findUser.password = hashNP
            findUser.pid = PID
            await findUser.save()
            const Datafj = {

                type: 'user_account_token',
                _id: findUser._id,
                pid: PID
            }
            const userToken = jwt.sign(Datafj, JWT_SECRET)
            return res.status(200).json({success: true, message: "Password successfuly reset", token: userToken, code: 200})

        } else {
            return res.status(400).json({ success: false, message: "Password change time expired.", code: 400 })
        }


    } catch {
        return res.status(400).json({ success: false, message: "Password change time expired.", code: 400 })
    }
}

module.exports = verifyPasswordResetToken