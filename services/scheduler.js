const File = require('../models/file')
const fs = require('fs');

exports.deleteUploads = async () => {
    const pastDate = new Date(Date.now() - ( 1000 * 60 * 60 * 24 ))

    const files = await File.find({ createdAt: { $lt : pastDate }});

    if(files.length > 0) {

        for (const file of files) {
            try{
                if(file.zipName !== undefined && file.zipSize !== undefined) {
                    // delete zipped file
                    fs.unlinkSync(file.zipPath);
                    // delete file
                    fs.unlinkSync(file.path);
                    
                    await File.deleteOne({path: file.zipPath});
                    console.log("Successfully deleted file -> ", file.zipName)
                }
                else{
                    fs.unlinkSync(file.path);
                    await File.deleteOne({path: file.path});
                    console.log("Successfully deleted file -> ", file.filename)
                }
            }
            catch(err) {
                console.log("Error while deleting files \n", err)
            }
        }

    }
    console.log("Job Done")
}