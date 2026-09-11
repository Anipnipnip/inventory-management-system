// Shared display formatters so every page renders numbers, currency,
// and dates the same way instead of each component rolling its own.
// Locale is 'id-ID' since this system's audience is Indonesian.

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('id-ID');

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatCurrency = (value) => currencyFormatter.format(value || 0);

export const formatNumber = (value) => numberFormatter.format(value || 0);

export const formatDateTime = (value) => dateTimeFormatter.format(new Date(value));
