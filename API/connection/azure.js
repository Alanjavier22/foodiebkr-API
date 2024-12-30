import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
const containerName = process.env.AZURE_STORAGE_CONTAINER;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection string not found");
}

console.log("Using Azure Storage Connection String:", AZURE_STORAGE_CONNECTION_STRING);
console.log("Using Azure Storage Container:", containerName);

try {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  async function createContainerIfNotExists() {
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`Creating container ${containerName}...`);
      const createResponse = await containerClient.create();
      console.log(`Container created: ${createResponse.requestId}`);
    } else {
      console.log(`Container ${containerName} already exists.`);
    }
  }

  await createContainerIfNotExists();
} catch (error) {
  console.error("Error connecting to Azure Blob Storage:", error);
  throw error;
}
