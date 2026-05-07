export function formatCurrency(value, currency = "USD") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function monthInputValue(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthToApiDate(monthValue) {
  return `${monthValue}-01`;
}

export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export function formatApiError(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (!data) return error?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const flatten = (value, prefix = "") => {
    if (Array.isArray(value)) return [`${prefix}${value.join(" ")}`];
    if (value && typeof value === "object") {
      return Object.entries(value).flatMap(([key, child]) => flatten(child, `${prefix}${key}: `));
    }
    return [`${prefix}${String(value)}`];
  };

  return flatten(data).join(" ") || fallback;
}
