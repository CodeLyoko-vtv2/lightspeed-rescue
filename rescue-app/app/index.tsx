import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

export default function Index() {
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      if (!user) {
        await AsyncStorage.multiRemove([
          "rescuerUid",
          "rescuerPhone",
          "rescuerRole",
        ]);
        router.replace("/DangNhap");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "Users", user.uid));
        let rescuerUid = user.uid;
        let userData = userSnap.exists() ? userSnap.data() : null;
        let role = userData?.role;
        let isRescueTeam = role === "RESCUE_TEAM" || role === "rescuer";

        if (!isRescueTeam && user.email) {
          const accountSnap = await getDocs(query(
            collection(db, "Users"),
            where("authEmail", "==", user.email),
          ));
          const rescueDoc = accountSnap.docs.find((item) => {
            const itemRole = item.data().role;
            return itemRole === "RESCUE_TEAM" || itemRole === "rescuer";
          });

          if (rescueDoc) {
            rescuerUid = rescueDoc.id;
            userData = rescueDoc.data();
            role = userData?.role;
            isRescueTeam = true;
          }
        }

        if (!isRescueTeam && user.phoneNumber) {
          const accountSnap = await getDocs(query(
            collection(db, "Users"),
            where("phoneNumber", "==", user.phoneNumber),
          ));
          const rescueDoc = accountSnap.docs.find((item) => {
            const itemRole = item.data().role;
            return itemRole === "RESCUE_TEAM" || itemRole === "rescuer";
          });

          if (rescueDoc) {
            rescuerUid = rescueDoc.id;
            userData = rescueDoc.data();
            role = userData?.role;
            isRescueTeam = true;
          }
        }

        if (!userData || userData.disabled || userData.deletedAt || !isRescueTeam) {
          await signOut(auth);
          await AsyncStorage.multiRemove([
            "rescuerUid",
            "rescuerPhone",
            "rescuerRole",
          ]);
          router.replace("/DangNhap");
          return;
        }

        await AsyncStorage.multiSet([
          ["rescuerUid", rescuerUid],
          ["rescuerPhone", userData.phoneNumber || ""],
          ["rescuerRole", role],
        ]);

        router.replace("/TrangChu");
      } catch {
        router.replace("/DangNhap");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#FF8852" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
});
