import { Handler } from "@netlify/functions";
import Busboy from "busboy";

export const handler: any = async (event) => {
  const busboy = Busboy({ headers: event.headers });
  const fileUploadPromises: Promise<any>[] = [];

  return new Promise((resolve, reject) => {
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const uploadPromise = new Promise((resolveUpload) => {
        const fileData: Buffer[] = [];
        file.on("data", (data) => fileData.push(data));
        file.on("end", () => {
          const fileBuffer = Buffer.concat(fileData);
          // Process or store fileBuffer (e.g., upload to S3)
          resolveUpload({ filename, fileBuffer });
        });
      });
      fileUploadPromises.push(uploadPromise);
    });

    busboy.on("finish", async () => {
      const uploadedFiles = await Promise.all(fileUploadPromises);
      resolve({
        statusCode: 200,
        body: JSON.stringify({ uploadedFiles }),
      });
    });

    busboy.end(Buffer.from(event.body || "", "base64"));
  });
};
