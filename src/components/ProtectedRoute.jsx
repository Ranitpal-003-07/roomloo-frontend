import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().onboardingComplete) {
          setOnboardingComplete(true);
        }
        setIsOnboardingChecked(true);
      }
    };

    checkOnboarding();
  }, [user]);

  if (!user) return <Navigate to="/auth" replace />;
  if (user && !isOnboardingChecked) return null; 
  if (user && !onboardingComplete) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
};

export default ProtectedRoute;