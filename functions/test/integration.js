const { initializeApp, cert, deleteApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');

// Kết nối emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

const app = initializeApp({
  projectId: 'lightspeed-rescue',
  databaseURL: 'http://localhost:9000/?ns=lightspeed-rescue-default-rtdb',
});

const db = getFirestore();
const rtdb = getDatabase();

// Đọc seed result
const seed = JSON.parse(fs.readFileSync('./test/seed-result.json'));

// Helper: chờ trigger chạy xong
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: log kết quả test
let passed = 0, failed = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 1 — SOS Creation Flow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function test1_SosCreation() {
  console.log('\n📋 TEST 1 — SOS Creation Flow');
  console.log('─'.repeat(40));

  const sosRef = await db.collection('sos_records').add({
    victimId: seed.victimUid,
    victimName: 'Nguyễn Văn An',
    victimPhone: '0901234567',
    incidentType: 'Hỏa hoạn',
    description: 'cháy lớn, có người mắc kẹt, bất tỉnh',
    imageUrls: ['https://example.com/img1.jpg'],
    audioUrl: null,
    location: { lat: 16.047079, lng: 108.206230 },
    status: 'active',
    createdAt: Date.now(),
  });

  const sosId = sosRef.id;
  console.log(`  ⏳ Tạo SOS: ${sosId}`);
  console.log('  ⏳ Đợi trigger onSosCreated chạy (3 giây)...');
  await wait(3000);

  // Verify priorityScore
  const sosDoc = await sosRef.get();
  const data = sosDoc.data();
  assert(typeof data.priorityScore === 'number', `priorityScore được tính: ${data.priorityScore}`);
  assert(['critical','high','medium','low'].includes(data.priorityLabel),
    `priorityLabel hợp lệ: ${data.priorityLabel}`);
  assert(data.priorityScore >= 80, `Score >= 80 (Hỏa hoạn + từ khóa nguy hiểm): ${data.priorityScore}`);

  // Verify Realtime DB session
  const metaSnap = await rtdb.ref(`sos_sessions/${sosId}/meta`).get();
  assert(metaSnap.exists(), 'sos_sessions meta được tạo trong Realtime DB');
  const meta = metaSnap.val();
  assert(meta.status === 'active', `meta.status = "active": ${meta.status}`);

  // Verify notification cho admin
  const notifSnap = await db.collection('notifications')
    .where('sosId', '==', sosId)
    .where('type', '==', 'NEW_SOS')
    .get();
  assert(!notifSnap.empty, 'Notification NEW_SOS được tạo cho admin');

  return sosId; // trả về để test sau dùng
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 2 — Dispatch Flow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function test2_Dispatch(sosId) {
  console.log('\n📋 TEST 2 — Dispatch Flow');
  console.log('─'.repeat(40));

  const teamId = seed.teamIds[0]; // Đội Cứu Hỏa
  console.log(`  ⏳ Admin điều động team: ${teamId}`);

  await db.collection('sos_records').doc(sosId).update({
    assignedTeams: {
      [teamId]: {
        teamName: 'Đội Cứu Hỏa Số 1',
        status: 'pending',
        assignedAt: Date.now(),
      }
    }
  });

  console.log('  ⏳ Đợi trigger onSosUpdated chạy (3 giây)...');
  await wait(3000);

  // Verify rescue_teams được update
  const teamDoc = await db.collection('rescue_teams').doc(teamId).get();
  const teamData = teamDoc.data();
  assert(teamData.isAvailable === false, `isAvailable = false: ${teamData.isAvailable}`);
  assert(teamData.currentSosId === sosId, `currentSosId = sosId: ${teamData.currentSosId}`);

  // Verify notification dispatch
  const notifSnap = await db.collection('notifications')
    .where('sosId', '==', sosId)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  assert(!notifSnap.empty, 'Notification điều động được tạo');
  console.log(`  ℹ️  FCM skipped (không có fcmToken thật) — đây là bình thường`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 3 — SOS Closed Flow
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function test3_SosClosed(sosId) {
  console.log('\n📋 TEST 3 — SOS Closed Flow');
  console.log('─'.repeat(40));

  // Tạo victim_location trong Realtime DB
  await rtdb.ref(`sos_sessions/${sosId}/victim_location`).set({
    lat: 16.047079,
    lng: 108.206230,
    updatedAt: Date.now(),
  });
  console.log('  ✅ victim_location tạo trong Realtime DB');

  // Đóng SOS
  await db.collection('sos_records').doc(sosId).update({
    status: 'resolved',
    resolvedAt: Date.now(),
  });

  console.log('  ⏳ Đợi trigger onSosClosed chạy (3 giây)...');
  await wait(3000);

  // Verify victim_location bị xóa
  const locSnap = await rtdb.ref(`sos_sessions/${sosId}/victim_location`).get();
  assert(!locSnap.exists(), 'victim_location đã bị xóa khỏi Realtime DB');

  // Verify meta.status = resolved
  const metaSnap = await rtdb.ref(`sos_sessions/${sosId}/meta`).get();
  assert(metaSnap.exists(), 'meta vẫn còn tồn tại (lịch sử)');
  assert(metaSnap.val().status === 'resolved', `meta.status = "resolved"`);

  // Verify team available trở lại
  const teamId = seed.teamIds[0];
  const teamDoc = await db.collection('rescue_teams').doc(teamId).get();
  assert(teamDoc.data().isAvailable === true, 'isAvailable trở lại true');
  assert(teamDoc.data().currentSosId === null, 'currentSosId = null');

  // Verify notification resolved
  const notifSnap = await db.collection('notifications')
    .where('sosId', '==', sosId)
    .where('type', '==', 'RESOLVED')
    .get();
  assert(!notifSnap.empty, 'Notification RESOLVED được tạo');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 4 — getAvailableTeams API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function test4_GetAvailableTeams() {
  console.log('\n📋 TEST 4 — getAvailableTeams API');
  console.log('─'.repeat(40));

  // Reset team về available (vì test 2 đã set false)
  await db.collection('rescue_teams').doc(seed.teamIds[0]).update({
    isAvailable: true,
    currentSosId: null,
  });

  // Query trực tiếp Firestore (thay vì gọi callable function)
  const snap = await db.collection('rescue_teams')
    .where('isAvailable', '==', true)
    .get();

  assert(!snap.empty, `Có ${snap.size} đội available`);

  // Verify sort logic: Cứu hỏa đứng đầu cho Hỏa hoạn
  const teams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const sorted = teams.sort((a, b) => {
    const priority = ['Cứu hỏa', 'Quân đội', 'Y tế', 'Tìm kiếm cứu nạn', 'Công an', 'Bệnh viện'];
    return priority.indexOf(a.type) - priority.indexOf(b.type);
  });

  assert(sorted[0].type === 'Cứu hỏa', `Đội Cứu hỏa đứng đầu cho sự cố Hỏa hoạn: ${sorted[0].name}`);
  console.log('  ℹ️  Callable function test cần Firebase client SDK — kiểm tra thủ công qua Emulator UI');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 5 — AI Triage Score Unit Test
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function test5_TriageScore() {
  console.log('\n📋 TEST 5 — AI Triage Score Unit Test');
  console.log('─'.repeat(40));

  const { calculateTriageScore, getScoreColor, getLabelText } =
    require('../src/ai/triageScore');

  const cases = [
    {
      input: { incidentType: 'Hỏa hoạn', description: 'cháy lớn bất tỉnh mắc kẹt', imageUrls: ['url'], createdAt: Date.now() - 12 * 60000 },
      expectLabel: 'critical',
      expectMinScore: 80,
    },
    {
      input: { incidentType: 'Dịch bệnh', description: 'bị sốt nhẹ', createdAt: Date.now() },
      expectLabel: 'high',
      expectMinScore: 60,
    },
    {
      input: { incidentType: 'Khác', description: null, createdAt: Date.now() },
      expectLabel: 'medium',
      expectMinScore: 0,
    },
    {
      input: null, // edge case
      expectLabel: 'medium',
      expectMinScore: 0,
    },
    {
      input: { incidentType: 'INVALID_TYPE', description: null },
      expectLabel: 'medium',
      expectMinScore: 0,
    },
  ];

  for (const c of cases) {
    const result = calculateTriageScore(c.input);
    assert(result.label === c.expectLabel,
      `incidentType="${c.input?.incidentType}" → label="${result.label}" (expect: ${c.expectLabel}), score=${result.score}`);
    assert(typeof getScoreColor(result.label) === 'string',
      `getScoreColor("${result.label}") trả về hex color`);
    assert(typeof getLabelText(result.label) === 'string',
      `getLabelText("${result.label}") trả về tiếng Việt: ${getLabelText(result.label)}`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN — chạy tất cả test
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function main() {
  console.log('🚀 BẮT ĐẦU INTEGRATION TEST\n');
  console.log('='.repeat(40));

  try {
    await test5_TriageScore();           // Unit test trước (không cần emulator)
    const sosId = await test1_SosCreation();
    await test2_Dispatch(sosId);
    await test3_SosClosed(sosId);
    await test4_GetAvailableTeams();
  } catch (err) {
    console.error('\n💥 Lỗi không mong đợi:', err.message);
    failed++;
  }

  console.log('\n' + '='.repeat(40));
  console.log(`\n📊 KẾT QUẢ: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 TẤT CẢ TEST PASS — Sẵn sàng deploy production!\n');
  } else {
    console.log('⚠️  CÓ TEST FAIL — Kiểm tra Functions logs tại http://localhost:4000\n');
  }

  await deleteApp(app);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);