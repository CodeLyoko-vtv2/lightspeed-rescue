/** Mock rescue teams around Đà Nẵng — used until Firebase is wired */
export const MOCK_TEAMS = [
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
    name: 'Công an Thành phố Đà Nẵng',
    phone: '02363822301',
    address: '80 Lê Lợi, Hải Châu, Đà Nẵng 550000',
    type: 'Công an',
    status: 'busy',
    location: { lat: 16.0780, lng: 108.2210 },
  },
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
    id: 'team-005',
    name: 'Đội Quân sự Khu vực',
    phone: '02363820000',
    address: '1 Đinh Tiên Hoàng, Hải Châu, Đà Nẵng',
    type: 'Quân đội',
    status: 'available',
    location: { lat: 16.0600, lng: 108.2130 },
  },
  {
    id: 'team-006',
    name: 'Bệnh viện Đà Nẵng',
    phone: '02363821480',
    address: '124 Hải Phòng, Hải Châu, Đà Nẵng',
    type: 'Bệnh viện',
    status: 'available',
    location: { lat: 16.0745, lng: 108.2245 },
  },
];

export function useTeamsMock() {
  return { teams: MOCK_TEAMS };
}
