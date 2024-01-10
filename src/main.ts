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
    const region = process.env.REGION;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "audio/mpeg",
      ACL: "public-read", // Set ACL to public-read
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Construct the file's HTTP URL
    const fileHttpUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Adjust as needed for security
        // Include other CORS headers if necessary
      },
      body: JSON.stringify({ presignedUrl, fileHttpUrl }),
    };
  } catch (error) {
    console.error(error);
    throw internalServerError("Error generating presigned URL");
  }
};

export const handler = handlerMiddleware(getPresignedUrlHandler);
