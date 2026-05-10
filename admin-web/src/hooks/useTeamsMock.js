/** Mock rescue teams around Đà Nẵng — used until Firebase is wired */
export const MOCK_TEAMS = [
  /* ── Công an ── */
  {
    id: 'team-001',
    name: 'Công an Thành phố Đà Nẵng',
    phone: '02363822300',
    address: '80 Lê Lợi, Hải Châu, Đà Nẵng 550000',
    type: 'Công an',
    status: 'available',
    location: { lat: 16.0725, lng: 108.2188 },
  },
  {
    id: 'team-002',
    name: 'Công an Thành phố Đà Nẵng',
    phone: '02362343300',
    address: '80 Lê Lợi, Hải Châu, Đà Nẵng 550000',
    type: 'Công an',
    status: 'available',
    location: { lat: 16.0652, lng: 108.2070 },
  },
  {
    id: 'team-003',
    name: 'Công an Quận Thanh Khê',
    phone: '02363822301',
    address: '235 Điện Biên Phủ, Thanh Khê, Đà Nẵng',
    type: 'Công an',
    status: 'busy',
    location: { lat: 16.0780, lng: 108.2050 },
  },

  /* ── Cứu hỏa ── */
  {
    id: 'team-004',
    name: 'Đội Cứu hỏa Hải Châu',
    phone: '02363825555',
    address: '25 Trần Phú, Hải Châu, Đà Nẵng',
    type: 'Cứu hỏa',
    status: 'available',
    location: { lat: 16.0695, lng: 108.2155 },
  },
  {
    id: 'team-009',
    name: 'Phòng Cảnh sát PCCC số 3',
    phone: '02363826666',
    address: '112 Lê Duẩn, Hải Châu, Đà Nẵng',
    type: 'Cứu hỏa',
    status: 'available',
    location: { lat: 16.0620, lng: 108.2260 },
  },
  {
    id: 'team-010',
    name: 'Đội Cứu hỏa Thanh Khê',
    phone: '02363827777',
    address: '78 Nguyễn Tri Phương, Thanh Khê, Đà Nẵng',
    type: 'Cứu hỏa',
    status: 'available',
    location: { lat: 16.0810, lng: 108.2010 },
  },

  /* ── Quân đội ── */
  {
    id: 'team-005',
    name: 'Đội Quân sự Khu vực',
    phone: '02363820000',
    address: '1 Đinh Tiên Hoàng, Hải Châu, Đà Nẵng',
    type: 'Quân đội',
    status: 'available',
    location: { lat: 16.0600, lng: 108.2130 },
  },
  {
    id: 'team-007',
    name: 'Trung đoàn 971 Quân khu 5',
    phone: '02363830001',
    address: '10 Lý Nam Đế, Sơn Trà, Đà Nẵng',
    type: 'Quân đội',
    status: 'available',
    location: { lat: 16.0850, lng: 108.2300 },
  },
  {
    id: 'team-011',
    name: 'Lữ đoàn Công binh 270',
    phone: '02363830002',
    address: '50 Hoàng Sa, Sơn Trà, Đà Nẵng',
    type: 'Quân đội',
    status: 'available',
    location: { lat: 16.0560, lng: 108.2020 },
  },

  /* ── Bệnh viện ── */
  {
    id: 'team-006',
    name: 'Bệnh viện Đà Nẵng',
    phone: '02363821480',
    address: '124 Hải Phòng, Hải Châu, Đà Nẵng',
    type: 'Bệnh viện',
    status: 'available',
    location: { lat: 16.0745, lng: 108.2245 },
  },
  {
    id: 'team-008',
    name: 'Bệnh viện C Đà Nẵng',
    phone: '02363822040',
    address: '122 Hải Phòng, Hải Châu, Đà Nẵng',
    type: 'Bệnh viện',
    status: 'available',
    location: { lat: 16.0680, lng: 108.2300 },
  },
  {
    id: 'team-012',
    name: 'Bệnh viện Phụ sản - Nhi',
    phone: '02363821100',
    address: '402 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
    type: 'Bệnh viện',
    status: 'available',
    location: { lat: 16.0510, lng: 108.2170 },
  },
];

export function useTeamsMock() {
  return { teams: MOCK_TEAMS };
}
