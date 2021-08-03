const File = require('../models/file')

exports.getFile = async (req, res) => {
    try{
        const file = await File.findOne({ uuid: req.params.uuid })
        if(!file) {
            return res.render('download', { error: "The link has been expired!" })
        }

        // If the file is zipped, then return this
        if(file.zipName !== undefined && file.zipSize !== undefined) {
            return res.render('download', {
                uuid: file.uuid,
                fileName: file.zipName,
                fileSize: file.zipSize,
                downloadLink: `${process.env.APP_BASE_URL}/file/download/${file.uuid}`
            })
        }

        // Else, return this for normal file
        else{
            return res.render('download', {
                uuid: file.uuid,
                fileName: file.filename,
                fileSize: file.size,
                downloadLink: `${process.env.APP_BASE_URL}/file/download/${file.uuid}`
            })
        }

    }
    catch(err) {
        return res.render('download', { error: "Something went wrong!" })
    }   
}