import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

const containerName = process.env.AZURE_STORAGE_CONTAINER;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection string not found");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

const containerClient = blobServiceClient.getContainerClient(containerName);

async function createContainerIfNotExists() {
  try {
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`Creating container ${containerName}...`);
      const createContainerResponse = await containerClient.create();
      console.log(`Container was created successfully.\n\trequestId: ${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`);
    } else {
      console.log(`Container ${containerName} already exists.`);
    }
  } catch (error) {
    console.error("Error creating container:", error);
    throw error; // Re-throw the error after logging it
  }
}

await createContainerIfNotExists();

export default containerClient;
