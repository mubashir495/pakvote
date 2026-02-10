// import multer from "multer";
// import path from "path";
// import fs from "fs";


// const degreeDir = "./uploads/degrees";
// if (!fs.existsSync(degreeDir)) {
//   fs.mkdirSync(degreeDir, { recursive: true });
// }

// const degreeStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, degreeDir);
//   },
//   filename: (req, file, cb) => {
//     const unique =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const degreeFileFilter = (req, file, cb) => {
//   const allowedTypes = /pdf|doc|docx/;
//   const ext = path.extname(file.originalname).toLowerCase();

//   if (allowedTypes.test(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, DOC, DOCX files are allowed"));
//   }
// };

// export const upload = multer({
//   storage: degreeStorage,
//   fileFilter: degreeFileFilter,
// });

// const symbolDir = "./uploads/symbols";
// if (!fs.existsSync(symbolDir)) fs.mkdirSync(symbolDir, { recursive: true });

// const symbolStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, symbolDir),
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// const symbolFileFilter = (req, file, cb) => {
//   const allowedTypes = /jpg|jpeg|png|webp/;
//   const ext = path.extname(file.originalname).toLowerCase();
//   if (allowedTypes.test(ext)) cb(null, true);
//   else cb(new Error("Only JPG, JPEG, PNG, WEBP images are allowed"));
// };

// export const symbolUpload = multer({
//   storage: symbolStorage,
//   fileFilter: symbolFileFilter,
// });
import multer from "multer";
import path from "path";
import fs from "fs";

// ========== DEGREES UPLOAD ==========
const degreeDir = "./uploads/degrees";
if (!fs.existsSync(degreeDir)) {
  fs.mkdirSync(degreeDir, { recursive: true });
}

const degreeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, degreeDir);
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const degreeFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX files are allowed"));
  }
};

export const upload = multer({
  storage: degreeStorage,
  fileFilter: degreeFileFilter,
});

// ========== SYMBOLS UPLOAD ==========
const symbolDir = "./uploads/symbols";
if (!fs.existsSync(symbolDir)) {
  fs.mkdirSync(symbolDir, { recursive: true });
}

const symbolStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, symbolDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const symbolFileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) cb(null, true);
  else cb(new Error("Only JPG, JPEG, PNG, WEBP images are allowed"));
};

export const symbolUpload = multer({
  storage: symbolStorage,
  fileFilter: symbolFileFilter,
});

const uploadDir = "uploads/party";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // create folder if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|pdf|doc|docx/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extName) cb(null, true);
  else cb(new Error("Only images, PDF or DOC files are allowed"));
};

export const partyUpload = multer({
  storage,
  fileFilter,
});
