const nodemailer = require('nodemailer');

const sendMail = async (mailPayload) => {
    // const {from , to, subject, text, html} = mailPayload;

    let trasporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: process.env.SMTP_PORT,
        service: 'gmail',
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    try{
        const mailInfo = await trasporter.sendMail(mailPayload);
        console.log(mailInfo)
    }
    catch(err) {
        console.log(err)
        throw "Email cannot be sent"
    }

}

module.exports = sendMail;