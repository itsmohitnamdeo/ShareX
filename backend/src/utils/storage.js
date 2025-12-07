const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

const allowedMime = [
  'application/pdf',
  'image/png','image/jpeg','image/jpg','image/gif',
  'text/csv','application/vnd.ms-excel',
  'application/zip'
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  }
});

function fileFilter (req, file, cb) {
  if (!allowedMime.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'), false);
  }
  cb(null, true);
}

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE }, fileFilter });

module.exports = { upload, allowedMime };
