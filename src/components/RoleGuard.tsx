import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  role: "student" | "teacher";
  children: ReactNode;
}

const RoleGuard = ({ role, children }: RoleGuardProps) => {
  const { role: userRole, loading, session } = useAuth();

  // Still loading auth or role data
  if (loading || (session && userRole === null)) return null;

  if (userRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
