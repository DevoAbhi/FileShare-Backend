const File = require('../models/file')

exports.downloadFile = async (req, res) => {
    try{
        const file = await File.findOne({ uuid: req.params.uuid });
        if(!file) {
            return res.render("download", {error: "Link has been expired!"})
        }

        if('zipPath' in file){
            // download zip
            const filePath = `${__dirname}/../${file.zipPath}`;
            res.download(filePath);
        }
        else{
            // download file
            const filePath = `${__dirname}/../${file.path}`;
            res.download(filePath);
        }
    }
    catch(err) {
        return res.render("download", {error: "Something went wrong"})
    }
}