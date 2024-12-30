function formatDatev2(isoDate) {
  const date = new Date(isoDate);

  // Extraer el año, mes y día
  const year = date.getFullYear().toString(); // Obtener los últimos 3 dígitos del año
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Mes es 0-indexed, por lo que se suma 1
  const day = String(date.getDate()).padStart(2, "0"); // Día del mes

  return `${year}-${month}-${day}`;
}

export default formatDatev2;
