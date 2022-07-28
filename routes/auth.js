const express = require('express');
const router = express.Router();
const aerect = require('aerect.js');
const users = require('../database/schemas/users');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_PRIVATE_KEY;
const bcrypt = require('bcrypt');
const sendEmail = require('../functions/sendEmail');
const validateUsername = require('../functions/validateUsername')

const antispamlimitobject = {
    success: false,
    message:"Too many authentication requests in a short period of time, please try again in a few minutes.",
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
    const { name, username, email, password} = req.body;

    if(!name || !username || !email || !password) {

        return res.status(400).json({success: false, message: "Please fill up all the fields.", code: 400})
    }
    if(password.length < 4) {
        return res.status(400).json({success: false, message: "Password must be atleast 4 characters in length.", code: 400})

    }

    const isusernameclean = validateUsername(username)
    if(!isusernameclean) {
        return res.status(400).json({success: false, message: "Username cannot have spaces or non URL friendly characters.", code: 400})
    }

    const accountisduplicate = await users.findOne({email: email})
    if(accountisduplicate) {
        return res.status(400).json({success: false, message: "Email is already registered.", code: 400})
    }

    const isusernametaken = await users.findOne({username: username})
    if(isusernametaken) {
        return res.status(400).json({success: false, message: "Sorry username is already taken by someone else.", code: 400})
    }

    if(email === process.env.EMAIL) {
        return res.status(400).json({success: false, message: "Email is already registered.", code: 400})
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
        likes: null,
        notifications: []
    }
    await users.create(user_object)
    const verification_token_details = {
        type: 'user_verification_token',
        _id: ID,
        pid: PID
    }
const verification_token = jwt.sign(verification_token_details, JWT_SECRET, {expiresIn: '1h'})
sendEmail(`Hi ${name} \n \n We recieved a request to verify your account, to verify please click this link: ${process.env.FRONTEND_URL}/verify?token=${verification_token} \n this link expires in 1 hour. \n \n The Curiopost Team`, `Curiopost account verification request`, email)
return res.status(200).json({success: true, message: "Account created check your mail for a verification link to login.", code: 200})
} catch(e) {
    console.error(e)

    return res.status(500).json({success: false, message: "Unexpected error occured on our end, please try again later.", code: 500})
}
})


module.exports = router;