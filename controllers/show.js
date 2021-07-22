const File = require('../models/file')

exports.getFile = async (req, res) => {
    try{
        const file = await File.findOne({ uuid: req.params.uuid })
        if(!file) {
            return res.render('download', { error: "The link has been expired!" })
        }
        return res.render('download', {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/file/download/${file.uuid}`
        })

    }
    catch(err) {
        return res.render('download', { error: "Something went wrong!" })
    }   
}