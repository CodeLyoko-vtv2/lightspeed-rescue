import React, {
  createContext,
  useContext,
  useState,
} from "react";

const MissionContext =
  createContext();

export function MissionProvider({
  children,
}) {

  const [
    missionStatus,
    setMissionStatus,
  ] = useState("accepted");

  /*
    dispatch
    accepted
    completed
    onMission
    idle
  */

  return (
    <MissionContext.Provider
      value={{
        missionStatus,
        setMissionStatus,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  return useContext(
    MissionContext
  );
}