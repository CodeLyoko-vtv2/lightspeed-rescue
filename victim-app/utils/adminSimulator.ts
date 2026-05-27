import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Thuật toán Haversine: Tính khoảng cách đường chim bay giữa 2 tọa độ GPS (km)
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180); 
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export const simulateAdminDispatch = async (currentRequestId: string | null) => {
  if (!currentRequestId) return; // Chạy ngầm nên nếu lỗi thì im lặng thoát luôn

  try {
    const sosRef = doc(db, "sos_alerts", currentRequestId);
    const sosSnap = await getDoc(sosRef);
    if (!sosSnap.exists()) return;
    if (sosSnap.data().status !== "pending") return;
    const sosLocation = sosSnap.data().location;

    const q = query(
      collection(db, "Users"), 
      where("role", "==", "RESCUE_TEAM"), 
      where("isAvailable", "==", true)
    );
    const teamSnaps = await getDocs(q);

    let closestTeamId: string | null = null;

    // Nếu không có đội nào, TỰ ĐỘNG TẠO VÀ LẤY LUÔN ĐỘI ĐÓ (Không bắt bấm lại)
    if (teamSnaps.empty) {
        const newTeamRef = await addDoc(collection(db, "Users"), {
            role: "RESCUE_TEAM",
            fullName: "Tổ Y Tế Phản Ứng Nhanh 01",
            phoneNumber: "+84999999999",
            fcmToken: "dummy_token",
            unitCategory: "MEDICAL",
            isAvailable: true,
            currentLocation: { latitude: 16.0544, longitude: 108.2022 },
            lastLocationUpdate: serverTimestamp()
        });
        closestTeamId = newTeamRef.id;
    } else {
        // Thuật toán tìm đội gần nhất
        let minDistance = Infinity;
        teamSnaps.forEach((teamDoc) => {
          const teamData = teamDoc.data();
          if (teamData.currentLocation) {
            const dist = getDistanceFromLatLonInKm(
              sosLocation.latitude, sosLocation.longitude,
              teamData.currentLocation.latitude, teamData.currentLocation.longitude
            );
            if (dist < minDistance) {
              minDistance = dist;
              closestTeamId = teamDoc.id;
            }
          }
        });
        if (!closestTeamId) closestTeamId = teamSnaps.docs[0].id;
    }

    // Tạo lệnh điều động (Dispatch) với trạng thái ACCEPTED
    await addDoc(collection(db, "rescue_missions"), {
      dispatchId: `DISP_SIM_${Date.now()}`,
      requestId: currentRequestId,
      rescueTeamId: closestTeamId,
      sosId: currentRequestId,
      rescuerId: closestTeamId,
      status: "accepted",
      createdAt: serverTimestamp(),
      dispatchedAt: serverTimestamp(),
      respondedAt: serverTimestamp(),
    });

    // Cập nhật đội cứu hộ thành "Đang bận"
    if (closestTeamId) {
      await updateDoc(doc(db, "Users", closestTeamId), {
        isAvailable: false
      });
    }

    // Không bật bất cứ Alert nào lên màn hình, để app tự xử lý onSnapshot

  } catch (error) {
    console.error("Lỗi giả lập:", error);
  }
};
