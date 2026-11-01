export enum StoreInEnum {
  DISK = "disk",
  MEMORY = "memory",
}

export const FileType = {
  image: ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm"],
};

export interface MulterUploadOptions {
  sendedFileDest?: string;
  sendedFileType?: string[];
  storeIn?: StoreInEnum;
}
