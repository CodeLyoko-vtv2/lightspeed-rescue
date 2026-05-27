const INCIDENTS = {
  FIRE: { label: 'Hỏa hoạn', color: '#EF4444', soft: '#FEE2E2', icon: 'fire' },
  NUCLEAR: { label: 'Hạt nhân', color: '#111827', soft: '#E5E7EB', icon: 'nuclear' },
  EARTHQUAKE: { label: 'Động đất', color: '#059669', soft: '#D1FAE5', icon: 'earthquake' },
  NATURAL_DISASTER: { label: 'Động đất', color: '#059669', soft: '#D1FAE5', icon: 'earthquake' },
  DISEASE: { label: 'Dịch bệnh', color: '#7C3AED', soft: '#EDE9FE', icon: 'virus' },
  FLOOD: { label: 'Bão lũ', color: '#2563EB', soft: '#DBEAFE', icon: 'flood' },
  OTHER: { label: 'Khác', color: '#F97316', soft: '#FFEDD5', icon: 'other' },
  ACCIDENT: { label: 'Tai nạn', color: '#F97316', soft: '#FFEDD5', icon: 'other' },
};

export function hasIncidentDetails(sos) {
  return Boolean(sos?.detailsSubmitted || sos?.incidentSubmitted || sos?.incidentTypeUpdated);
}

export function getIncidentMeta(type, sos) {
  if (!hasIncidentDetails(sos)) return null;
  const key = String(type || '').toUpperCase();
  return INCIDENTS[key] || null;
}
