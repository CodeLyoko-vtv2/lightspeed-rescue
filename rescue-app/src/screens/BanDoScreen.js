import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useRouter,
  usePathname,
} from "expo-router";
import BottomNavbar from "../components/navigation/NavigationBarMobile";
import MainActions from "../components/map/MainActions";
import SecondaryActions from "../components/map/SecondaryActions";
import SearchBar from "../components/map/SearchBar";
import FilterPills from "../components/map/FilterPills";

export default function BanDoScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Map */}
      <Image
        source={require("../../assets/images/Map View.png")}
        style={styles.map}
        resizeMode="cover"
      />

      {/* Search */}
      <SearchBar onPress={() =>
    router.push("/BanDoTimKiem")
  }/>

      {/* Filter */}
      <FilterPills />

      {/* Secondary buttons */}
      <SecondaryActions />

      {/* Main actions */}
      <MainActions />

      {/* Marker */}
      <View style={styles.marker} />

      {/* Bottom Navbar */}
      <BottomNavbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  searchContainer: {
    position: "absolute",
    top: 60,
    width: "100%",
    paddingHorizontal: 15,
  },

  searchBar: {
    height: 55,
    backgroundColor: "#FFF",
    borderRadius: 40,
    paddingHorizontal: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },

  searchText: {
    fontSize: 18,
    color: "#707070",
  },

  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  filterWrapper: {
    position: "absolute",
    top: 130,
    paddingLeft: 10,
  },

  filterButton: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  filterText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "500",
  },

  marker: {
    position: "absolute",
    top: "45%",
    left: "50%",

    width: 28,
    height: 28,
    borderRadius: 20,

    backgroundColor: "#FF8852",
    borderWidth: 4,
    borderColor: "#FFF",

    marginLeft: -14,
    marginTop: -14,
  },
});