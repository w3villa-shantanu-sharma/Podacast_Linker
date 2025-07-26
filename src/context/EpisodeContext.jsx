// context/EpisodeContext.jsx
import { createContext, useContext, useState } from "react";
const EpisodeContext = createContext();
export const EpisodeProvider = ({ children }) => {
  const [episodes, setEpisodes] = useState([]);
  return (
    <EpisodeContext.Provider value={{ episodes, setEpisodes }}>
      {children}
    </EpisodeContext.Provider>
  );
};
export const useEpisodes = () => useContext(EpisodeContext);
