import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";
dotenv.config();

// Cargar la cadena de conexión desde las variables de entorno
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection String is missing.");
}

if (!containerName) {
  throw new Error("Azure Storage Container name is missing.");
}

// Crear el cliente del servicio Blob
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

// Crear el cliente del contenedor
const containerClient = blobServiceClient.getContainerClient(containerName);

console.log(`Connected to Azure Blob Container: ${containerName}`);

// Exportación por defecto
export default containerClient;
