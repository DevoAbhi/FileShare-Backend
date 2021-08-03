const multer = require('multer')
// import {v4 as uuidv4} from 'uuid';
const { v4: uuidv4 } = require('uuid')
const path = require('path');
const File = require('../models/file')
const AdmZip = require('adm-zip');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

// let upload = multer({
//     storage,
//     limits: { fileSize: 100000000}
// }).single('myfile')

let upload = multer({
    storage,
    limits: { fileSize: 100000000}
}).array('myfile', 30)

exports.postUploadFiles = async (req, res, next) => {
    
    // Store file
    upload(req, res, async (err) => {
        // Validate request
        if(!req.files) {
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

        // Initialize adm-zip package
        const admZip = new AdmZip();

        let index = 0;
        let response;
        let zipSize = 0;
        for (const file of req.files) {

            // Only add files to zip if they are greater than 1
            if(req.files.length > 1) {
                // Add files in zip
                const filePath = `${__dirname}/../${file.path}`;
                admZip.addLocalFile(filePath);
                zipSize += file.size;
            }

            if(req.files.length > 1 && index === (req.files.length-1)) {
                // Save zip file in uploads folder
                const zipFileName = `${uuidv4()}.zip`;
                const uploadsZipPath = `uploads/${zipFileName}`
                const zipFilePath = `${__dirname}/../${uploadsZipPath}`;
                admZip.writeZip(zipFilePath);

                // Store in Database
                const dbFile = new File({
                    filename: file.filename,
                    uuid: uuidv4(),
                    path: file.path,
                    zipName: zipFileName,
                    zipPath: uploadsZipPath,
                    zipSize: zipSize,
                    size: file.size
                })
        
                response = await dbFile.save();
                console.log(response)

                break;
            }

            // Store in Database
            const dbFile = new File({
                filename: file.filename,
                uuid: uuidv4(),
                path: file.path,
                size: file.size
            })
    
            response = await dbFile.save();
            console.log(response)

            index += 1;
        }

        // Response -> Link
        return res.status(200).json({
            file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
            progress: 100
        })
        // return res.status(200).json({
        //     success: true
        // })

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