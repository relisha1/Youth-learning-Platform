// words shown on screen for the application status (the database keeps the old words)
export const statusLabel = (status) => {
  if (status === 'accepted') return 'Shortlisted';
  if (status === 'hired') return 'Hired';
  if (status === 'rejected') return 'Not selected';
  return 'Applied';
};

// colour of the little label
export const statusClass = (status) => {
  if (status === 'accepted' || status === 'hired') return 'pg-badge pg-badge-green';
  if (status === 'rejected') return 'pg-badge pg-badge-red';
  return 'pg-badge pg-badge-yellow';
};
