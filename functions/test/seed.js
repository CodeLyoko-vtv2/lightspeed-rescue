const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

// Kết nối emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

initializeApp({
  projectId: 'lightspeed-rescue',
  databaseURL: 'http://localhost:9000/?ns=lightspeed-rescue-default-rtdb',
});

const db = getFirestore();
const auth = getAuth();

async function seed() {
  console.log('🌱 Bắt đầu seed data...\n');

  // 1. Tạo Admin account
  let adminUser;
  try {
    adminUser = await auth.createUser({
      email: 'admin@lightspeed.rescue',
      password: 'Admin@123456',
      displayName: 'Admin Trung Tâm',
    });
    await auth.setCustomUserClaims(adminUser.uid, { role: 'admin' });
    console.log('✅ Admin account:', adminUser.email);
  } catch (e) {
    console.log('⚠️  Admin đã tồn tại, bỏ qua');
  }

  // 2. Tạo Victim account
  let victimUser;
  try {
    victimUser = await auth.createUser({
      email: 'victim1@test.com',
      password: 'Test@123456',
      displayName: 'Nguyễn Văn An',
    });
    await auth.setCustomUserClaims(victimUser.uid, { role: 'victim' });
    console.log('✅ Victim account:', victimUser.email);
  } catch (e) {
    victimUser = await auth.getUserByEmail('victim1@test.com');
    console.log('⚠️  Victim đã tồn tại, bỏ qua');
  }

  // 3. Tạo 3 đội cứu hộ
  const teams = [
    { name: 'Đội Cứu Hỏa Số 1',    type: 'Cứu hỏa',           hotline: '0901111111' },
    { name: 'Trung Đoàn 1 Quân Đội', type: 'Quân đội',          hotline: '0902222222' },
    { name: 'Đội Y Tế Dự Phòng',     type: 'Y tế',              hotline: '0903333333' },
  ];

  const teamIds = [];
  for (const team of teams) {
    const ref = await db.collection('rescue_teams').add({
      ...team,
      baseLocation: { lat: 16.047079, lng: 108.206230 }, // Đà Nẵng
      isAvailable: true,
      currentSosId: null,
      fcmToken: null,
      createdAt: new Date(),
    });
    teamIds.push(ref.id);
    console.log(`✅ Team: ${team.name} → ID: ${ref.id}`);
  }

  // Lưu teamIds và victimId ra file để integration test dùng
  const fs = require('fs');
  fs.writeFileSync(
    './test/seed-result.json',
    JSON.stringify({
      adminEmail: 'admin@lightspeed.rescue',
      adminPassword: 'Admin@123456',
      victimUid: victimUser?.uid,
      victimEmail: 'victim1@test.com',
      teamIds,
    }, null, 2)
  );

  console.log('\n✅ Seed hoàn tất! Kết quả lưu tại test/seed-result.json');
  process.exit(0);
}

seed().catch(console.error);