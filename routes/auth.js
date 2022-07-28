const express = require('express');
const router = express.Router();
const aerect = require('aerect.js');
const users = require('../database/schemas/users')
const rateLimit = require('express-rate-limit')

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

    

router.get('/login', antispamauth, async (req, res) => {
    res.send("Hello world")
})


module.exports = router;