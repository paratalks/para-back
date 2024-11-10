import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

export const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

export const bucketName = process.env.AWS_S3_BUCKET_NAME!;

export const uploadfileToS3 = async (localFilePath: string, pathName: string): Promise<string> => {
  const fileContent = fs.readFileSync(localFilePath);
  const filename = path.basename(localFilePath);
  const contentType = "application/octet-stream"; 
  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: `uploads/${pathName}/${filename}`,
    Body: fileContent,
    ContentType: contentType,
    ACL: "public-read",
  });

  const s3Client: S3Client = createS3Client();
  await s3Client.send(putCommand);

  fs.unlinkSync(localFilePath);

  return `https://${bucketName}.s3.${process.env.AWS_REGION!}.amazonaws.com/uploads/${pathName}/${filename}`;
};
