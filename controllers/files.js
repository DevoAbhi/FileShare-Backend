const multer = require('multer')
// import {v4 as uuidv4} from 'uuid';
const { v4: uuidv4 } = require('uuid')
const path = require('path');
const File = require('../models/file')

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage,
    limits: { fileSize: 100000000}
}).single('myfile')

exports.postUploadFiles = async (req, res, next) => {
    
    // Store file
    upload(req, res, async (err) => {
        // Validate request
        if(!req.file) {
            return res.status(400).json({
                error: "All fields are required!"
            })
        }
        if(err) {
            return res.status(500).json({
                error: err.message,
                message: "There was a problem uploading file!"
            })
        }
        // Store in Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        })

        const response = await file.save();
        console.log(response)

        // Response -> Link
        return res.status(200).json({
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
            progress: 100
        })

    })
}

exports.sendEmail = async (req, res) => {
    const { uuid, emailFrom, emailTo } = req.body;
    console.log(uuid)
    console.log(emailFrom)
    console.log(emailTo)

    if(!uuid || !emailFrom || !emailTo) {
        return res.status(422).json({
            error: "All fields are required!"
        })
    }

    // Get file from database
    const file = await File.findOne({uuid: uuid});
    if(!file) {
        return res.status(404).json({
            error: "uuid does not exists"
        })
    }

    // So as to not send email twice
    if((file.receiver).includes(emailTo)){
        return res.status(422).json({
            error: `Email already sent to ${emailTo}`
        })
    }

    const receivers = emailTo.split(",");
    const trimmedReceivers = receivers.map(email => {
        return email.trim();
    })

    try{
        const sendMail = require('../services/sendMailService');
        const emailTemplate = require('../services/emailTemplate');
        for(const emailTo of trimmedReceivers){
            // Send Email
            const mailPayload = {
                from: `FileShare <${emailFrom}>`,
                to: emailTo,
                subject: "FileShare | File Sharing in fingertips!",
                text: `${emailFrom} has sent you a file. You can download it now!`,
                html: emailTemplate({
                    emailFrom,
                    downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
                    size: parseInt(file.size/1000) + ' KB',
                    expires: "24 hours"
                })
            }
            
            sendMail(mailPayload)
        }
        
        const allReceivers = file.receiver.concat(trimmedReceivers)
        const updatedFile = await File.findOneAndUpdate({uuid: uuid}, {sender: emailFrom, receiver: allReceivers}, {new: true, lean: true});
        console.log(updatedFile)

        return res.status(200).json({
            message: "Email sent!"
        })
    }
    catch(err){
        return res.status(500).json({
            error: "Something went wrong while sending email!"
        })
    } 
}