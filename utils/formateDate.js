export default function formatDate(isoDate) {
  const date = new Date(isoDate);

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  return date.toLocaleString("es-ES", options).replace(".", "");
}
