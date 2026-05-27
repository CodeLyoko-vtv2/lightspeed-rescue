import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { auth, firestore } from '../firebase.js';
import {
  createRescueTeamAccount,
  deleteRescueTeamAccount,
} from '../services/rescueTeams.js';

const initialForm = {
  phoneNumber: '',
  fullName: '',
};

const normalizeSearch = (value) =>
  String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function AdminTeamsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [createdAccount, setCreatedAccount] = useState(null);

  useEffect(() => {
    document.title = 'Quản lý nhân sự | Lightspeed Rescue';

    const unsubscribe = onSnapshot(
      collection(firestore, 'rescue_teams'),
      (snapshot) => {
        const nextTeams = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((team) => !team.deletedAt)
          .sort((a, b) =>
            String(a.name || a.fullName || '').localeCompare(
              String(b.name || b.fullName || ''),
              'vi',
            ),
          );
        setTeams(nextTeams);
        setLoading(false);
      },
      () => {
        setMessage({ type: 'error', text: 'Không thể tải danh sách đội cứu hộ.' });
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const filteredTeams = useMemo(() => {
    const keyword = normalizeSearch(query);
    if (!keyword) {
      return teams;
    }

    return teams.filter((team) => {
      const haystack = normalizeSearch([
        team.name,
        team.fullName,
        team.phoneNumber,
        team.hotline,
        team.type,
      ].filter(Boolean).join(' '));
      return haystack.includes(keyword);
    });
  }, [query, teams]);

  const handleNavigate = (page) => {
    if (page === 'menu') {
      navigate('/');
      return;
    }
    if (page === 'teams') {
      navigate('/teams');
      return;
    }
    if (page === 'logout') {
      signOut(auth).then(() => navigate('/login', { replace: true }));
      return;
    }
    navigate('/');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setCreatedAccount(null);

    if (!form.phoneNumber.trim() || !form.fullName.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số điện thoại và tên người dùng.' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await createRescueTeamAccount({
        phoneNumber: form.phoneNumber.trim(),
        fullName: form.fullName.trim(),
      });
      setCreatedAccount(result);
      setMessage({ type: 'success', text: 'Đã tạo tài khoản đội cứu hộ.' });
      setForm(initialForm);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.message || 'Không thể tạo tài khoản đội cứu hộ.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (team) => {
    const teamName = team.name || team.fullName || 'đội cứu hộ này';
    if (!window.confirm(`Xóa tài khoản ${teamName}?`)) {
      return;
    }

    setDeletingId(team.id);
    setMessage(null);
    try {
      await deleteRescueTeamAccount(team);
      setMessage({ type: 'success', text: 'Đã xóa tài khoản đội cứu hộ.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error?.message || 'Không thể xóa tài khoản đội cứu hộ.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F7F8' }}>
      <Sidebar activePage="teams" onNavigate={handleNavigate} />
      <main style={{ flex: 1, padding: '28px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#111827', font: '700 24px/32px Inter, sans-serif' }}>
              Quản lý nhân sự
            </h1>
            <p style={{ margin: '6px 0 0', color: '#6B7280', font: '400 14px/20px Roboto, sans-serif' }}>
              Tạo, tìm kiếm, xem và xóa tài khoản đội cứu hộ.
            </p>
          </div>
          <button type="button" onClick={() => signOut(auth).then(() => navigate('/login', { replace: true }))} style={secondaryButtonStyle}>
            Đăng xuất
          </button>
        </header>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Tạo tài khoản đội cứu hộ</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '220px minmax(260px, 1fr) auto', gap: '12px', alignItems: 'end' }}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Số điện thoại</span>
              <input
                value={form.phoneNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                placeholder="0123456789"
                style={inputStyle}
              />
            </label>
            <label style={fieldStyle}>
              <span style={labelStyle}>Tên người dùng</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Đội cứu hộ Công an Thành phố Đà Nẵng"
                style={inputStyle}
              />
            </label>
            <button type="submit" disabled={submitting} style={primaryButtonStyle}>
              {submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>

          {createdAccount ? (
            <div style={credentialStyle}>
              <strong>Thông tin đăng nhập App:</strong>
              <span>SĐT: {createdAccount.phoneNumber || form.phoneNumber}</span>
              <span>Mật khẩu mặc định: {createdAccount.password}</span>
            </div>
          ) : null}
          {message ? (
            <div style={{ ...messageStyle, color: message.type === 'error' ? '#B91C1C' : '#166534', background: message.type === 'error' ? '#FEF2F2' : '#F0FDF4' }}>
              {message.text}
            </div>
          ) : null}
        </section>

        <section style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={sectionTitleStyle}>Danh sách đội cứu hộ ({filteredTeams.length})</h2>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, SĐT, loại đội..."
              style={{ ...inputStyle, width: '320px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Roboto, sans-serif' }}>
              <thead>
                <tr style={{ color: '#6B7280', fontSize: '12px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={thStyle}>Tên đội</th>
                  <th style={thStyle}>Số điện thoại</th>
                  <th style={thStyle}>Loại</th>
                  <th style={thStyle}>Trạng thái</th>
                  <th style={thStyle}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={emptyStyle}>Đang tải dữ liệu...</td></tr>
                ) : null}
                {!loading && filteredTeams.length === 0 ? (
                  <tr><td colSpan="5" style={emptyStyle}>Không có đội cứu hộ phù hợp.</td></tr>
                ) : null}
                {filteredTeams.map((team) => (
                  <tr key={team.id} style={{ borderBottom: '1px solid #EEF2F8' }}>
                    <td style={tdStyle}>{team.name || team.fullName || 'Đội cứu hộ'}</td>
                    <td style={tdStyle}>{team.phoneNumber || team.hotline || '-'}</td>
                    <td style={tdStyle}>{team.type || '-'}</td>
                    <td style={tdStyle}>{team.currentSosId ? 'Đang xử lý SOS' : 'Sẵn sàng'}</td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handleDelete(team)}
                        disabled={deletingId === team.id}
                        style={dangerButtonStyle}
                      >
                        {deletingId === team.id ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

const panelStyle = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
};

const sectionTitleStyle = {
  margin: '0 0 16px',
  color: '#111827',
  font: '700 18px/24px Inter, sans-serif',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle = {
  color: '#313A51',
  font: '500 13px/18px Roboto, sans-serif',
};

const inputStyle = {
  height: '42px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  padding: '0 12px',
  color: '#111827',
  font: '400 14px/20px Roboto, sans-serif',
  outline: 'none',
  background: '#FFFFFF',
};

const primaryButtonStyle = {
  height: '42px',
  border: 'none',
  borderRadius: '8px',
  padding: '0 16px',
  color: '#FFFFFF',
  background: '#FF8852',
  cursor: 'pointer',
  font: '700 13px/18px Roboto, sans-serif',
};

const secondaryButtonStyle = {
  height: '40px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  padding: '0 14px',
  color: '#313A51',
  background: '#FFFFFF',
  cursor: 'pointer',
  font: '600 13px/18px Roboto, sans-serif',
};

const dangerButtonStyle = {
  border: '1px solid #FCA5A5',
  borderRadius: '8px',
  padding: '8px 12px',
  color: '#B91C1C',
  background: '#FEF2F2',
  cursor: 'pointer',
  font: '600 13px/18px Roboto, sans-serif',
};

const credentialStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  marginTop: '14px',
  padding: '12px',
  borderRadius: '8px',
  background: '#FFF7ED',
  color: '#9A3412',
  font: '500 13px/18px Roboto, sans-serif',
};

const messageStyle = {
  marginTop: '12px',
  borderRadius: '8px',
  padding: '10px 12px',
  font: '500 13px/18px Roboto, sans-serif',
};

const thStyle = { padding: '10px 12px', fontWeight: 700 };
const tdStyle = { padding: '12px', color: '#111827', fontSize: '14px', verticalAlign: 'middle' };
const emptyStyle = { padding: '28px 12px', textAlign: 'center', color: '#6B7280' };
