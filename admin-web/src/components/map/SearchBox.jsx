import PropTypes from 'prop-types';
import { useCallback, useRef, useState } from 'react';
import { COLORS } from '../../constants/colors.js';

function getInitials(name) {
  if (!name) {
    return 'A';
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0].toUpperCase()).join('');
}

export function SearchBox({ adminName, mapRef }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=vn&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'vi' },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (mapRef?.current) {
          mapRef.current.setView([parseFloat(lat), parseFloat(lon)], 16, { animate: true });
        }
      } else {
        setError('Không tìm thấy địa điểm');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  }, [query, mapRef]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      handleSearch();
    }
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
    setError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {}, 500);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: COLORS.palette.hex_ffffff_095,
        borderRadius: '999px',
        padding: '0 16px',
        height: '48px',
        width: '400px',
        border: `1px solid ${COLORS.palette.hex_e5e7eb_100}`,
        boxShadow: `0 10px 15px -3px ${COLORS.palette.hex_000000_010}, 0 4px 6px -4px ${COLORS.palette.hex_000000_010}`,
        backdropFilter: 'blur(2px)',
        position: 'relative',
      }}
    >
      <input
        className="map-search-input"
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={error || (loading ? 'Đang tìm kiếm...' : 'Tìm kiếm địa điểm')}
        style={{
          border: 'none',
          outline: 'none',
          width: '100%',
          fontSize: '14px',
          color: error ? COLORS.palette.hex_e02424_100 : COLORS.palette.hex_111827_100,
          fontFamily: 'Roboto, sans-serif',
          background: 'transparent',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginLeft: 'auto',
        }}
      >
        <button
          type="button"
          onClick={handleSearch}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
          aria-label="Tìm kiếm"
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke={COLORS.palette.hex_6b7280_100} strokeWidth="3" fill="none" strokeDasharray="31.4" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                fill={COLORS.palette.hex_6b7280_100}
                d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79L20 20.5 21.5 19 15.5 14Zm-5.5 0a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z"
              />
            </svg>
          )}
        </button>
        <div
          style={{
            width: '1px',
            height: '24px',
            background: COLORS.palette.hex_d1d5db_100,
          }}
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path
            fill={COLORS.palette.hex_2563eb_100}
            d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
          />
        </svg>
      </div>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: COLORS.palette.hex_15803d_100,
          display: 'grid',
          placeItems: 'center',
          color: COLORS.neutral.surface,
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: 'Roboto, sans-serif',
          flexShrink: 0,
        }}
      >
        {getInitials(adminName)}
      </div>
    </div>
  );
}

SearchBox.propTypes = {
  adminName: PropTypes.string,
  mapRef: PropTypes.shape({ current: PropTypes.object }),
};

SearchBox.defaultProps = {
  adminName: 'Admin',
  mapRef: null,
};
