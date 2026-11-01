import multer from "multer";
import { env } from "../config/env.js";
import { Request } from "express";
import fs from "fs";
import { BadRequestError } from "../shared/utils/error/app.error.js";
import {
  FileType,
  MulterUploadOptions,
  StoreInEnum,
} from "../shared/types/multer.upload.types.js";

export const multerUpload = ({
  sendedFileDest = "general",
  sendedFileType = FileType.image,
  storeIn = StoreInEnum.DISK,
}: MulterUploadOptions): multer.Multer => {
  const storage =
    storeIn == StoreInEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          // destination: (req: any, file, cb) => {
          //   const fullDest = `uploads/${sendedFileDest}/${req.user._id}`;
          //   if (!fs.existsSync(fullDest)) {
          //     fs.mkdirSync(fullDest, { recursive: true });
          //   }
          //   cb(null, fullDest);
          // },
          // filename: (req: any, file, cb) => {
          //   cb(null, `${file.originalname}`);
          // },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: CallableFunction,
  ) => {
    if (
      file.size > env.MULTER_MAX_FILE_SIZE_MB * 1024 * 1024 &&
      storeIn == StoreInEnum.MEMORY
    ) {
      return cb(new BadRequestError(), false);
    } else if (!sendedFileType.includes(file.mimetype)) {
      return cb(new BadRequestError(), false);
    }
    cb(null, true);
  };
  return multer({ storage, fileFilter });
};
