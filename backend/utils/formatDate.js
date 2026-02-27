function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatDateTime(d) {
  if (!d) d = new Date();
  const date = new Date(d);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const hourStr = pad(hours);

  return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
}

function formatDate(d) {
  if (!d) d = new Date();
  const date = new Date(d);
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = { formatDateTime, formatDate };
