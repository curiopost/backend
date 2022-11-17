const express = require('express');
const router = express.Router();
const aerect = require('aerect.js');
const users = require('../database/schemas/users');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
const bcrypt = require('bcrypt');
const sendEmail = require('../functions/sendEmail');
const validateUsername = require('../functions/validateUsername');
const verifyVerificationToken = require('../middleware/verifyVerificationToken');
const verifyUserToken = require('../middleware/verifyUserToken')
const abbreviate = require('number-abbreviate');
const validator = require('validator');
const fetch = require('node-fetch')
const randomNumber = require("random-number-csprng");
const otps = require('../database/schemas/otps');
const verifyOtpReplyToken = require('../middleware/verifyOtpReplyToken')
const verifyPasswordResetToken = require('../middleware/verifyPasswordResetToken')
const antispamlimitobject = {
    success: false,
    message: "Too many authentication requests in a short period of time, please try again in a few minutes.",
    code: 429
}

const antispamauth = rateLimit({
    windowMs: 15000,
    max: 10,
    message: antispamlimitobject
});



router.post('/register', antispamauth, async (req, res) => {
    try {
        const ID = aerect.generateID(11)
        const PID = aerect.generateID(59)
        const {r_key} = req.query;
        if(!r_key) {
            return res.status(400).json({success: false, message: "Your using an outdated version of curiopost, reload your page with ctrl + f5 or by clicking the three dots and clicking reload on your phone.", code: 400})
        }

        const v_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${r_key}`;
        const validateHuman = await fetch(v_url,{
            method: 'GET'
        })
        const validateHumanjson = await validateHuman.json()

        if(!validateHumanjson.success) {
           
            return res.status(400).json({success: false, message: "Could not verify you as a human.", code: 400}) 
        }


        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {

            return res.status(400).json({ success: false, message: "Please fill up all the fields.", code: 400 })
        }
        if (password.length < 4) {
            return res.status(400).json({ success: false, message: "Password must be atleast 4 characters in length.", code: 400 })

        }

        const isLegitEmail = validator.isEmail(email)

        if (!isLegitEmail) {

            return res.status(400).json({ success: false, message: "Please enter a valid email address.", code: 400 })
        }

        const isusernameclean = validateUsername(username)
        if (!isusernameclean) {
            return res.status(400).json({ success: false, message: "Username cannot have spaces or non URL friendly characters.", code: 400 })
        }

        const accountisduplicate = await users.findOne({ email: email })
        if (accountisduplicate) {
            return res.status(400).json({ success: false, message: "Email is already registered.", code: 400 })
        }

        const isusernametaken = await users.findOne({ username: username })
        if (isusernametaken) {
            return res.status(400).json({ success: false, message: "Sorry username is already taken by someone else.", code: 400 })
        }

        if (email === process.env.EMAIL) {
            return res.status(400).json({ success: false, message: "Email is already registered.", code: 400 })
        }
        /*
            const isIdDuplicate = users.findOne({_id: ID})
            if(isIdDuplicate) {
                return res.status(500).json({success: false, message: "Unexpected error occured on our end, please try again later.", code: 500})
            } */

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const user_object = {
            _id: ID,
            username: username,
            name: name,
            email: email,
            password: hash,
            verified: false,
            pid: PID,
            created_at: Date.now(),
            following: [],
            followers: [],
            interests: [],
            avatar_url: null,
            bio: null,
            location: null,
            website: null,
            likes: [],
            notifications: []
        }
        await users.create(user_object)
        const verification_token_details = {
            type: 'user_verification_token',
            _id: ID,
            pid: PID
        }
        const verification_token = jwt.sign(verification_token_details, JWT_SECRET, { expiresIn: '1h' })
        await sendEmail(`Hi ${name}\n\nWe recieved a request to verify your account, to verify please click this link: ${process.env.FRONTEND_URL}/verify?token=${verification_token} \nthis link expires in 1 hour.\n\nThanks - The Curiopost Team`, `Curiopost account verification request`, email)
        return res.status(200).json({ success: true, message: "Account created check your mail for a verification link to login.", code: 200 })
    } catch (e) {
        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }
})

router.post('/verify', antispamauth, verifyVerificationToken, async (req, res) => {

    try {

        users.findOne({ _id: req.verification_user._id, pid: req.verification_user.pid, verified: false }, async (err, data) => {

            if (data) {

                const new_pid = aerect.generateID(59)
                data.verified = true;
                data.pid = new_pid;
                await data.save()

                const new_user_data = await users.findOne({ _id: req.verification_user._id })

                const account_token_details = {
                    type: 'user_account_token',
                    _id: new_user_data._id,
                    pid: new_user_data.pid
                }
                const account_token = jwt.sign(account_token_details, JWT_SECRET)

                return res.status(200).json({ success: true, message: "Account successfully verified.", token: account_token, code: 200 })
            } else {

                return res.status(400).json({ success: false, message: "No data exists as requested.", code: 400 })
            }
        })
    } catch (e) {
        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })
    }

})

router.post('/login', antispamauth, async (req, res) => {
    
    const {r_key} = req.query;
    if(!r_key) {
        return res.status(400).json({success: false, message: "Your using an outdated version of curiopost, reload your page with ctrl + f5 or by clicking the three dots and clicking reload on your phone.", code: 400})
    }

    const v_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${r_key}`;
    const validateHuman = await fetch(v_url,{
        method: 'GET'
    })
    const validateHumanjson = await validateHuman.json()

    if(!validateHumanjson.success) {
       
        return res.status(400).json({success: false, message: "Could not verify you as a human.", code: 400}) 
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please fill up all the fields.", code: 400 })
    }

    try {

        const user = await users.findOne({ email: email })

        if (!user) {
            return res.status(400).json({ success: false, message: "Email or password is incorrect.", code: 400 })
        }

        const ispasswordvalid = await bcrypt.compare(password, user.password)

        if (!ispasswordvalid) {
            return res.status(400).json({ success: false, message: "Email or password is incorrect.", code: 400 })
        }

        if (!user.verified) {
            const verification_token_details = {
                type: 'user_verification_token',
                _id: user._id,
                pid: user.pid
            }

            const verification_token = jwt.sign(verification_token_details, JWT_SECRET, { expiresIn: '1h' })

            await sendEmail(`Hi ${user.name}\n\nWe recieved a request to verify your account, to verify please click this link: ${process.env.FRONTEND_URL}/verify?token=${verification_token} \nthis link expires in 1 hour.\n\nThanks - The Curiopost Team`, `Curiopost account verification request`, email)

            return res.status(405).json({ success: false, message: "Email wasn't verified, we resent a link to your mail, please verify it to login.", code: 405 })

        }

        const account_token_details = {
            type: 'user_account_token',
            _id: user._id,
            pid: user.pid

        }

        const account_token = jwt.sign(account_token_details, JWT_SECRET)

        return res.status(200).json({ success: true, message: "Login successful.", token: account_token, code: 200 })

    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })

    }


})

router.post('/getuser', verifyUserToken, async (req, res) => {

    try {

        const authorized_account = req.authorized_account;

        const raw_data = {
            _id: authorized_account._id,
            username: authorized_account.username,
            name: authorized_account.name,
            email: authorized_account.email,
            verified: authorized_account.verified,
            created_at: authorized_account.created_at,
            following: authorized_account.following,
            followers: authorized_account.followers,
            avatar_url: authorized_account.avatar_url,
            bio: authorized_account.bio,
            location: authorized_account.location,
            website: authorized_account.website,
            likes: authorized_account.likes,
            notifications: authorized_account.notifications
        }

        // processed_data is just stuff like likes but with abbreviated numbers and exact date.

        const total_following = abbreviate(authorized_account.following.length, 2)

        const total_followers = abbreviate(authorized_account.followers.length, 2)

        const total_likes = abbreviate(authorized_account.likes.length, 2)

        const account_creation_date = new Date(authorized_account.created_at).toDateString()

        const processed_data = {
            total_following: total_following,
            total_followers: total_followers,
            total_likes: total_likes,
            creation_date: account_creation_date
        }

        return res.status(200).json({ success: true, message: "Token verified, details are provided in this response.", raw_data, processed_data })
    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })

    }

})

router.post('/updatepassword', antispamauth, verifyUserToken, async (req, res) => {
    const { password, newpassword } = req.body;

    try {

        if (!password || !newpassword) {

            return res.status(400).json({ success: false, message: "Please fill up all the fields.", code: 400 })

        }

        if (newpassword.length < 4) {
            return res.status(400).json({ success: false, message: "New password must be atleast 4 characters in length.", code: 400 })

        }



        const authorized_account = req.authorized_account;

        users.findOne({ _id: authorized_account._id }, async (err, data) => {

            if (data) {

                const isoldpasswordvalid = await bcrypt.compare(password, data.password)

                if (!isoldpasswordvalid) {

                    return res.status(400).json({ success: false, message: "Old password is incorrect.", code: 400 })
                }
                if (newpassword === password) {

                    return res.status(400).json({ success: false, message: "New password cannot be your old password.", code: 400 })
                }

                const PID = aerect.generateID(59)

                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(newpassword, salt);

                data.password = hash
                data.pid = PID


                await data.save()

                const new_user = await users.findOne({ _id: authorized_account._id })

                const token_object = {
                    type: 'user_account_token',
                    _id: new_user._id,
                    pid: new_user.pid
                }

                const new_token = jwt.sign(token_object, JWT_SECRET)

                return res.status(200).json({ success: true, message: "Password has been updated and all access tokens have been revoked.", token: new_token, code: 200 })


            } else {

                return res.status(400).json({ success: false, message: "No data exists as requested.", code: 400 })

            }
        })




    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })

    }
})

router.post('/request_recovery', antispamauth, async(req, res) => {
   
   // make sure to uncomment the below before deploying to production.
 
   
   const {r_key} = req.query;
    if(!r_key) {
        return res.status(400).json({success: false, message: "Could not verify you as a human.", code: 400})
    }

    const v_url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${r_key}`;
    const validateHuman = await fetch(v_url,{
        method: 'GET'
    })
    const validateHumanjson = await validateHuman.json()

    if(!validateHumanjson.success) {
       
        return res.status(400).json({success: false, message: "Could not verify you as a human.", code: 400}) 
    }
    try {

        const { email } = req.body;
        if(!email) {
            return res.status(400).json({success: false, message: "Email is required.", code: 400})
        }

        const findUser = await users.findOne({email: email});
        if(!findUser) {
            return res.status(400).json({success: false, message: "Email is not registered", code: 400})
        }

        const u_id = findUser._id;

        const OTP = await randomNumber(100000,999999);
        const requestId = aerect.generateID(11)

        await otps.create({
            _id: requestId,
            user_id: u_id,
            otp: OTP,
            expires_at: Date.now()+180000,
            failed_attempts: 0


        })
        const otpData = {
            type: 'user_otp_reply_token',
            _id: requestId

        }

        const replyToken = jwt.sign(otpData, JWT_SECRET, {expiresIn: '3m'})
        
        await sendEmail(`Hi ${findUser.name}\n\nWe recieved a request to reset your password. Your code to reset your password is: ${OTP}\n\nThis code expires in 3 minutes, if you didn't request this code then ignore this email.\n\nThanks - The Curiopost Team`, `${OTP} is your Curiopost recovery code`, findUser.email)
        
        return res.status(200).json({success: true, message: "OTP send to your email.", reply_token: replyToken, code: 200})



    } catch (e) {

        console.error(e)

        return res.status(500).json({ success: false, message: "Unexpected error occured on our end, please try again later.", code: 500 })

    }
})

router.post('/verify_otp', verifyOtpReplyToken)
router.post('/recover_password', verifyPasswordResetToken)
module.exports = router;