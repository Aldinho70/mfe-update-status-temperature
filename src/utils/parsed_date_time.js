export const parsedTimestampWialon = (timestamp) => {
  return new Date(timestamp * 1000);
}

export function parseWialonTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);

  const pad = n => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${
    pad(date.getMonth() + 1)
  }-${
    pad(date.getDate())
  } ${
    pad(date.getHours())
  }:${
    pad(date.getMinutes())
  }:${
    pad(date.getSeconds())
  }`;
}