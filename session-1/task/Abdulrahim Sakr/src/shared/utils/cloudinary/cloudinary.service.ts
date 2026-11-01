import { cloudinaryConfig } from "./cloudinary.config.js";
import { env } from "../../../config/env.js";

// ============================ uploadSingleFile ============================
export const uploadSingleFile = async ({
  fileLocation,
  storagePathOnCloudinary = `${env.APP_NAME}`,
}: {
  fileLocation: string;
  storagePathOnCloudinary: string;
}) => {
  const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
    fileLocation,
    {
      folder: `${env.APP_NAME}/${storagePathOnCloudinary}`,
      resource_type: "auto",
    },
  );

  return { public_id, secure_url };
};

// ============================ uploadManyFiles ============================
export const uploadManyFiles = async ({
  fileLocationArr = [],
  storagePathOnCloudinary = `${env.APP_NAME}`,
}: {
  fileLocationArr: string[];
  storagePathOnCloudinary: string;
}) => {
  const files = [];
  for (const item of fileLocationArr) {
    const { public_id, secure_url } = await uploadSingleFile({
      fileLocation: item,
      storagePathOnCloudinary,
    });
    files.push({ public_id, secure_url });
  }
  return files;
};

// ============================ destroySingleFile ============================
export const destroySingleFile = async ({
  public_id,
}: {
  public_id: string;
}) => {
  await cloudinaryConfig().uploader.destroy(public_id);
};

// ============================ destroyManyFiles ============================
export const destroyManyFiles = async ({
  public_ids = [],
}: {
  public_ids: string[];
}) => {
  await cloudinaryConfig().api.delete_resources(public_ids);
};

// ============================ deleteByPrefix ============================
export const deleteByPrefix = async ({
  storagePathOnCloudinary,
}: {
  storagePathOnCloudinary: string;
}) => {
  await cloudinaryConfig().api.delete_resources_by_prefix(
    `${env.APP_NAME}/${storagePathOnCloudinary}`,
  );
};

// ============================ deleteFolder ============================
export const deleteFolder = async ({
  storagePathOnCloudinary,
}: {
  storagePathOnCloudinary: string;
}) => {
  await cloudinaryConfig().api.delete_folder(
    `${env.APP_NAME}/${storagePathOnCloudinary}`,
  );
};
