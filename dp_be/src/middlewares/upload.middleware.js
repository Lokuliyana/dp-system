const multer = require('multer')

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.includes('excel') ||
    file.mimetype.includes('spreadsheetml') ||
    file.mimetype.includes('csv')
  ) {
    cb(null, true)
  } else {
    cb(new Error('Please upload only excel or csv file.'), false)
  }
}

const upload = multer({ storage, fileFilter })

module.exports = upload
