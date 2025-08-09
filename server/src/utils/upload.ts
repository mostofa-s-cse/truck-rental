import multer from 'multer';
import fs from 'fs';
import path from 'path';

/**
 * Create a multer upload middleware for a specific subfolder under server/uploads.
 * Files are named using the authenticated userId and current timestamp.
 */
export function createMulterUpload(subfolder: string) {
  const uploadDir = path.join(process.cwd(),'uploads', subfolder);
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req: any, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const userId = req?.user?.userId || 'unknown';
      cb(null, `${userId}-${Date.now()}${ext}`);
    }
  });

  return multer({ storage });
}
