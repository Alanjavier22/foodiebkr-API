import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING?.trim();
const containerName = process.env.AZURE_STORAGE_CONTAINER?.trim();

// Validar que las variables de entorno requeridas estén definidas
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error("Azure Storage Connection String is missing.");
}

if (!containerName) {
  throw new Error("Azure Storage Container name is missing.");
}

// Crear el cliente del servicio Blob
let blobServiceClient;
try {
  blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
} catch (error) {
  console.error("Invalid Azure Storage Connection String:", error.message);
  throw error;
}

// Crear el cliente del contenedor
const containerClient = blobServiceClient.getContainerClient(containerName);

console.log(`Connected to Azure Blob Storage container: ${containerName}`);

/**
 * Crear el contenedor si no existe.
 */
async function createContainerIfNotExists() {
  try {
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`Creating container ${containerName}...`);
      const createContainerResponse = await containerClient.create();
      console.log(
        `Container was created successfully.\n\trequestId: ${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`
      );
    } else {
      console.log(`Container ${containerName} already exists.`);
    }
  } catch (error) {
    console.error("Error creating or accessing the container:", error.message);
    throw error;
  }
}

// Ejecutar la creación del contenedor en un bloque de ejecución asincrónica
(async () => {
  try {
    await createContainerIfNotExists();
  } catch (error) {
    console.error("Unhandled error:", error.message);
  }
})();

// Exportar el cliente del contenedor para su uso en otros módulos
export default containerClient;
