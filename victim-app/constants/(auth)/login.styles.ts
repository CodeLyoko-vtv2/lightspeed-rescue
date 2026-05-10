import { Dimensions, Platform, StyleSheet } from "react-native";
import { COLORS } from "../colors";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  inner: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "space-between",
    paddingTop: 30,
    paddingBottom: 20,
  },
  topSection: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 0 : 20,
    position: "relative",
    width: "100%",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
  },
  middleSection: {
    alignItems: "center",
    flex: 1,
    marginTop: 20,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 30,
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 22,
    color: COLORS.textNormal,
    marginBottom: 20,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 16,
    height: 70,
    paddingHorizontal: 15,
    backgroundColor: "#FFF",
    marginBottom: 10,
  },
  countryCode: {
    fontSize: 20,
    color: COLORS.textNormal,
    fontWeight: "500",
    marginRight: 5,
  },
  separator: {
    height: 24,
    width: 1.5,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "500",
    color: COLORS.textNormal,
  },
  eyeButton: {
    padding: 5,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 10 : 0,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    width: "100%",
    height: 80,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#FFFFFFB3",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  actionButtonTextActive: {
    color: "#FFFFFF",
  },
});
