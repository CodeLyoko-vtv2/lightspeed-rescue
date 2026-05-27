import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  getIdTokenResult,
  inMemoryPersistence,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
} from 'firebase/auth';
import { auth } from '../firebase.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthLayout } from '../components/layout/AuthLayout.jsx';
import logo from '../assets/img/svg.logo-svg.png';
import eyeIcon from '../assets/img/eye.svg';
import eyeOffIcon from '../assets/img/eye-off.svg';
import lockIcon from '../assets/img/lock.svg';

const ERROR_MESSAGES = {
  'auth/user-not-found': 'Tài khoản không tồn tại',
  'auth/wrong-password': 'Mật khẩu không chính xác',
  'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ',
  'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau',
};

export function LoginPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Đăng nhập | Lightspeed Rescue';
  }, []);

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const normalizedEmail = email.trim();
    const emailToLogin = normalizedEmail.includes('@')
      ? normalizedEmail
      : `${normalizedEmail}@lightspeed.rescue`;

    setLoading(true);
    try {
      await setPersistence(auth, inMemoryPersistence);
      const credential = await signInWithEmailAndPassword(
        auth,
        emailToLogin,
        password,
      );
      const idTokenResult = await getIdTokenResult(
        credential.user,
        true,
      );

      if (idTokenResult?.claims?.role !== 'admin') {
        await signOut(auth);
        setError('Tài khoản không có quyền Admin');
        return;
      }

      navigate('/');
    } catch (loginError) {
      const message =
        ERROR_MESSAGES[loginError?.code] ||
        'Đã có lỗi xảy ra. Vui lòng thử lại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <img
        src={logo}
        alt=""
        style={{
          width: '80px',
          marginBottom: '24px',
          filter:
            'brightness(0) saturate(100%) invert(70%) sepia(44%) saturate(682%) hue-rotate(329deg) brightness(102%) contrast(97%)',
        }}
      />
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#FF8852',
          fontFamily: 'Inter, sans-serif',
          marginBottom: '8px',
        }}
      >
        Lightspeed Rescue
      </div>
      <div
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '48px',
        }}
      >
        "Tốc độ ánh sáng! Giải cứu!"
      </div>
      <div
        style={{
          border: '1.5px solid rgba(255, 255, 255, 0.4)',
          color: 'rgba(255, 255, 255, 0.85)',
          borderRadius: '999px',
          padding: '10px 24px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '1px',
        }}
      >
        TRUNG TÂM CHỈ HUY &amp; ĐIỀU PHỐI
      </div>
    </div>
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#020000',
            marginBottom: '8px',
          }}
        >
          Đăng nhập hệ thống
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#6B7280',
            maxWidth: '320px',
            marginBottom: '32px',
          }}
        >
          Cổng truy cập dành riêng cho Quản trị viên Trung tâm cứu hộ.
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#313A51',
                marginBottom: '6px',
              }}
            >
              Tài khoản Admin (ID cấp phép)
            </label>
            <input
              id="admin-email"
              type="text"
              className="auth-input"
              placeholder="admin_danang_01"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#313A51',
                marginBottom: '6px',
              }}
            >
              Mật khẩu truy cập
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <img
                  src={showPassword ? eyeOffIcon : eyeIcon}
                  alt=""
                  style={{ width: '20px', height: '20px' }}
                />
              </button>
            </div>
          </div>
          <div style={{ marginBottom: '24px' }} />
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? 'ĐANG XÁC THỰC...' : 'TRUY CẬP TRUNG TÂM ĐIỀU PHỐI'}
          </button>
          {error ? (
            <div
              style={{
                marginTop: '12px',
                color: '#FF3A52',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          ) : null}
        </form>
        <div
          style={{
            marginTop: '24px',
            background: '#FFF3F3',
            border: '1px solid #FFCDD2',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <img
            src={lockIcon}
            alt=""
            style={{ width: '16px', height: '16px', marginTop: '2px' }}
          />
          <div style={{ color: '#FF3A52' }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              Khu vực hạn chế:
            </div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>
              Hệ thống dành riêng cho các cơ quan chức năng. Mọi hành vi cố
              tình truy cập trái phép sẽ bị ghi log IP và xử lý theo quy định
              của pháp luật.
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
