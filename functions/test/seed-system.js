const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getDatabase } = require('firebase-admin/database');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

initializeApp({
  projectId: 'lightspeed-rescue',
  databaseURL: 'http://localhost:9000/?ns=lightspeed-rescue-default-rtdb',
});

const db = getFirestore();
const rtdb = getDatabase();

async function seedSystem() {
  console.log('Seeding rescue system data...');

  const victimRef = db.collection('Users').doc();
  await victimRef.set({
    fullName: 'Nguyen Van An',
    phoneNumber: '0900000001',
    role: 'VICTIM',
    currentLocation: { latitude: 16.0725, longitude: 108.2188 },
    lastLocationUpdate: FieldValue.serverTimestamp(),
  });

  const teams = [
    {
      fullName: 'Rescue Team Alpha',
      phoneNumber: '0901111111',
      unitCategory: 'MEDICAL',
      currentLocation: { latitude: 16.0695, longitude: 108.2155 },
      isAvailable: true,
    },
    {
      fullName: 'Rescue Team Bravo',
      phoneNumber: '0902222222',
      unitCategory: 'FIRE',
      currentLocation: { latitude: 16.0620, longitude: 108.2260 },
      isAvailable: true,
    },
  ];

  const teamIds = [];
  for (const team of teams) {
    const ref = db.collection('Users').doc();
    await ref.set({
      ...team,
      role: 'RESCUE_TEAM',
      lastLocationUpdate: FieldValue.serverTimestamp(),
    });
    teamIds.push(ref.id);
  }

  const sosRef = db.collection('sos_alerts').doc();
  await sosRef.set({
    victimId: victimRef.id,
    victimName: 'Nguyen Van An',
    victimPhone: '0900000001',
    status: 'pending',
    incidentType: 'OTHER',
    description: 'Demo SOS for system testing',
    location: { latitude: 16.0725, longitude: 108.2188 },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const missionRef = db.collection('rescue_missions').doc();
  await missionRef.set({
    sosId: sosRef.id,
    rescuerId: teamIds[0],
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    assignedAt: FieldValue.serverTimestamp(),
  });

  const locationRef = rtdb.ref(`sos_sessions/${sosRef.id}/rescuer_locations/${teamIds[0]}`);
  await locationRef.set({
    name: teams[0].fullName,
    phone: teams[0].phoneNumber,
    lat: teams[0].currentLocation.latitude,
    lng: teams[0].currentLocation.longitude,
    updatedAt: Date.now(),
  });

  console.log('Seed complete.');
  console.log(`Victim: ${victimRef.id}`);
  console.log(`SOS: ${sosRef.id}`);
  console.log(`Mission: ${missionRef.id}`);
  console.log(`Rescuer: ${teamIds[0]}`);
}

seedSystem().catch((err) => {
  console.error(err);
  process.exit(1);
});
