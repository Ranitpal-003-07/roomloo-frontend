/* eslint-disable no-useless-catch */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (currentUser) => {
    if (!currentUser) return null;
    
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Combine Firebase Auth user with Firestore data
        return { 
          ...currentUser, 
          ...userDoc.data() 
        };
      } else {
        console.log("No user document found in Firestore");
        return currentUser;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return currentUser;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch additional user data from Firestore
        const userData = await fetchUserData(currentUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const signup = async (email, password, userData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        displayName: userCredential.user.displayName || '',
        isPgOwner: userData.isPgOwner || false,
        createdAt: new Date(),
        ...userData
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const logout = () => signOut(auth);

  // Helper function to update user data in Firestore
  const updateUserData = async (data) => {
    if (!user || !user.uid) return;
    
    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      // Update local user state with new data
      setUser(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      signup, 
      login, 
      logout,
      updateUserData 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);