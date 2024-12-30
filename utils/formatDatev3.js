function formatDatev3(isoDate, requiredHours = true) {
  const date = new Date(isoDate);
  const offsetInMinutes = date.getTimezoneOffset(); // Diferencia en minutos con UTC

  // Ajustar la fecha para reflejar la hora local
  const fechaLocal = new Date(date.getTime() - offsetInMinutes * 60000);

  let options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  if (requiredHours)
    options = {
      ...options,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Formato de 24 horas
    };

  return fechaLocal.toLocaleString("en-GB", options);
}

export default formatDatev3;
