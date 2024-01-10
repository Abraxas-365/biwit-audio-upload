import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { handlerMiddleware } from "./shared/middleware/handlerMiddleware";
import { internalServerError } from "./shared";

const s3Client = new S3Client({ region: process.env.REGION });

const getPresignedUrlHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const key = uuidv4() + ".mp3";
    const bucketName = process.env.BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "audio/mpeg",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ presignedUrl, key }),
    };
  } catch (error) {
    console.error(error);
    throw internalServerError("Error generating presigned URL");
  }
};

export const handler = handlerMiddleware(getPresignedUrlHandler);
