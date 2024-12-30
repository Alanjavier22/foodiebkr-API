import containerClient from "../connection/azure.js";

async function uploadImg({ imagen, blob_name }) {
  try {
    if (!imagen) {
      // throw new Error("No image provided");
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
    const newblob_name = `img-${Date.now().toString()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(newblob_name);

    // Convertir el string Base64 a un Buffer
    const buffer = Buffer.from(imagen.split(",")[1], "base64");

    // Obtener el tipo de contenido de la imagen (MIME type)
    const contentType = imagen.substring(
      "data:".length,
      imagen.indexOf(";base64")
    );

    // Subir el blob
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType || "image/jpeg" }, // Ajustar el tipo de contenido si es necesario
    });

    const url = blockBlobClient.url;
    return { url, blob_name: newblob_name };
  } catch (error) {
    console.error("Error uploading image to Azure Blob Storage:", error);
    throw error; // Re-lanzar el error después de registrarlo
  }
}

export { uploadImg };
