const nodemailer = require('nodemailer')

const sendemail = async(message, subject, reciever) => {

    if(!message) {
        throw `message is required.`
    }
    if(!subject) {
        throw `subject is required.`
    }
    if(!reciever) {
        throw `reciever is required.`
    }

    if(typeof message !== "string") {
        throw `message must be a string.`

    }

    if(typeof subject !== "string") {
        throw `subject must be a string.`
    }
    if(typeof reciever !== "string") {
        throw `reciever must be a string.`
    }


    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      const mailOptions = {
        from: process.env.EMAIL,
        to: reciever,
        subject: subject,
        text: message
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    })
}

module.exports = sendemail;