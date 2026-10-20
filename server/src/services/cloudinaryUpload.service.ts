
import cloudinary from "../config/cloudinary.ts";

type PhotoFolder = "professors" | "school-teachers";

export async function uploadPhotoToCloudinary(
  file: Express.Multer.File,
  folder: PhotoFolder
): Promise<string> {
  if (!file?.buffer) {
    throw new Error("Image buffer is missing");
  }

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `professordex/${folder}`,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(
            new Error("Cloudinary did not return an image URL")
          );
        }

        resolve(result.secure_url);
      }
    );

    stream.on("error", reject);
    stream.end(file.buffer);
  });
}
