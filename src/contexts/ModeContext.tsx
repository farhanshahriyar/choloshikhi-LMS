import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Mode = "student" | "teacher";

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
  canTeach: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
  const { role } = useAuth();
  const [mode, setMode] = useState<Mode>("student");
  const canTeach = role === "teacher";

  // Reset mode to student if the user loses teacher privileges
  useEffect(() => {
    if (!canTeach && mode === "teacher") {
      setMode("student");
    }
  }, [canTeach, mode]);

  const toggleMode = () => {
    if (!canTeach) return;
    setMode((m) => (m === "student" ? "teacher" : "student"));
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, canTeach }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used within ModeProvider");
  return ctx;
};
