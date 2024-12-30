import containerClient from "../connection/azure.js";

async function uploadImg({ imagen, blob_name }) {
  try {
    if (!imagen) {
      return { imagen, blob_name };
    }

    if (!imagen.startsWith("data:image/")) {
      return { url: imagen, blob_name };
    }

    // Eliminar el blob existente si se proporciona blob_name
    if (blob_name) {
      const blockBlobClient = containerClient.getBlockBlobClient(blob_name);
      await blockBlobClient.deleteIfExists();
    }

    // Generar un nuevo nombre de blob
    const newBlobName = `img-${Date.now().toString()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(newBlobName);

    // Convertir el string Base64 a un Buffer
    const buffer = Buffer.from(imagen.split(",")[1], "base64");

    // Obtener el tipo de contenido de la imagen (MIME type)
    const contentType = imagen.substring(
      "data:".length,
      imagen.indexOf(";base64")
    );

    // Subir el blob
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType || "image/jpeg" },
    });

    const url = blockBlobClient.url;
    return { url, blob_name: newBlobName };
  } catch (error) {
    console.error("Error uploading image to Azure Blob Storage:", error.message);
    throw error;
  }
}

export { uploadImg };
