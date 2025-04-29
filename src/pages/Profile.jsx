/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faCheck, 
  faPen, 
  faPlus, 
  faEdit, 
  faTimes,
  faGlobe,
  faSave,
  faTimesCircle,
  faCamera,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { 
  faLinkedinIn, 
  faGithub, 
  faInstagram, 
  faTwitter,
  faFacebook
} from '@fortawesome/free-brands-svg-icons';
import '../styles/Profile.css';

// Import your existing Firebase config
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Error alert component
const ErrorAlert = ({ message, onClose }) => (
  <div className="error-alert">
    <FontAwesomeIcon icon={faExclamationTriangle} />
    <span>{message}</span>
    <button onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
  </div>
);

const Profile = () => {
  // Add profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Error handling state
  const [error, setError] = useState(null);

  // User profile data state with default values aligned with Firestore structure
  const [userData, setUserData] = useState({
    fullName: "",
    pronouns: "",
    age: "",
    gender: "",
    hometown: "",
    collegeName: "",
    about: "",
    roomPreference: "",
    hobbies: [],
    interests: [],
    currentAddress: "",
    heartWays: [],
    favoriteFoods: [],
    currentHostel: "",
    foodPreference: "",
    socialLinks: {
      linkedin: "",
      github: "",
      instagram: "",
      twitter: "",
      facebook: ""
    },
    smokingHabit: "",
    alcoholConsumption: "",
    religion: "",
    fieldOfStudy: "",
    profileImageUrl: "",
    coverImageUrl: "",
    onboardingComplete: false
  });

  // Loading state
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Status state
  const [activeStatus, setActiveStatus] = useState('Needs Roommate');
  
  // Edit states for various sections
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [editingPreference, setEditingPreference] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingHeartWays, setEditingHeartWays] = useState(false);
  const [editingHostel, setEditingHostel] = useState(false);
  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingCollege, setEditingCollege] = useState(false);
  const [editingSmoking, setEditingSmoking] = useState(false);
  const [editingAlcohol, setEditingAlcohol] = useState(false);
  const [editingReligion, setEditingReligion] = useState(false);
  const [editingFieldOfStudy, setEditingFieldOfStudy] = useState(false);
  const [editingSocialLinks, setEditingSocialLinks] = useState(false);
  const [editingFoodPreference, setEditingFoodPreference] = useState(false);
 
  // Temporary states for editing
  const [tempName, setTempName] = useState('');
  const [tempPronouns, setTempPronouns] = useState('');
  const [tempAbout, setTempAbout] = useState('');
  const [tempPreference, setTempPreference] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempGender, setTempGender] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempCollege, setTempCollege] = useState('');
  const [tempHostel, setTempHostel] = useState('');
  const [tempSmoking, setTempSmoking] = useState('');
  const [tempAlcohol, setTempAlcohol] = useState('');
  const [tempReligion, setTempReligion] = useState('');
  const [tempFieldOfStudy, setTempFieldOfStudy] = useState('');
  const [tempFoodPreference, setTempFoodPreference] = useState('');
  const [tempSocialLinks, setTempSocialLinks] = useState({
    linkedin: "",
    github: "",
    instagram: "",
    twitter: "",
    facebook: ""
  });

  // States for new items
  const [newHobby, setNewHobby] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newFood, setNewFood] = useState('');
  const [newHeartTrait, setNewHeartTrait] = useState('');
  const [addingHobby, setAddingHobby] = useState(false);
  const [addingInterest, setAddingInterest] = useState(false);
  const [addingFood, setAddingFood] = useState(false);
  const [addingHeartTrait, setAddingHeartTrait] = useState(false);

  // Function to handle errors
  const handleError = (errorMessage, consoleError = null) => {
    setError(errorMessage);
    if (consoleError) {
      console.error(consoleError);
    }
    // Auto-dismiss error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };

  // Clear error manually
  const clearError = () => {
    setError(null);
  };

  // Profile image upload handling with error handling
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        handleError("Profile image size should be less than 5MB");
        return;
      }
      
      setProfileImage(file);
      handleImageUpload(file, 'profile');
    }
  };

  // Cover image upload handling with error handling
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        handleError("Cover image size should be less than 5MB");
        return;
      }
      
      setCoverImage(file);
      handleImageUpload(file, 'cover');
    }
  };

  const handleImageUpload = async (image, type) => {
    if (image && userId) {
      setUploading(true);
      try {
        // Create a reference to the storage location
        const storageRef = ref(storage, `${type}Images/${userId}`);
        
        // Upload the file with metadata for CORS
        const metadata = {
          contentType: image.type,
          customMetadata: {
            'Access-Control-Allow-Origin': '*'
          }
        };
        
        await uploadBytes(storageRef, image, metadata);
        
        // Get the download URL
        const url = await getDownloadURL(storageRef);
        
        // Update user profile with new image URL
        if (type === 'profile') {
          setImageUrl(url);
          
          // Update Firestore with the new image URL
          const updatedData = {
            ...userData,
            profileImageUrl: url
          };
          
          setUserData(updatedData);
          await updateUserProfile({ profileImageUrl: url });
        } else if (type === 'cover') {
          setCoverImageUrl(url);
          
          // Update Firestore with the new cover image URL
          const updatedData = {
            ...userData,
            coverImageUrl: url
          };
          
          setUserData(updatedData);
          await updateUserProfile({ coverImageUrl: url });
        }
      } catch (error) {
        handleError(`Failed to upload ${type} image. Please try again.`, error);
      } finally {
        setUploading(false);
        if (type === 'profile') {
          setProfileImage(null);
        } else {
          setCoverImage(null);
        }
      }
    }
  };

  // Add this handler function for editing social links with error handling
  const handleSaveSocialLinks = () => {
    try {
      // Validate URLs if they are not empty
      const validateUrl = (url) => {
        if (url && url.trim() !== "") {
          try {
            // Add http:// prefix if not present
            let formattedUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              formattedUrl = 'https://' + url;
            }
            new URL(formattedUrl);
            return formattedUrl;
          } catch {
            throw new Error(`Invalid URL: ${url}`);
          }
        }
        return url;
      };

      // Create a validated version of social links
      const validatedLinks = {
        linkedin: validateUrl(tempSocialLinks.linkedin),
        github: validateUrl(tempSocialLinks.github),
        instagram: validateUrl(tempSocialLinks.instagram),
        twitter: validateUrl(tempSocialLinks.twitter),
        facebook: validateUrl(tempSocialLinks.facebook)
      };

      const updatedData = {
        ...userData,
        socialLinks: validatedLinks
      };
      
      setUserData(updatedData);
      updateUserProfile({ socialLinks: validatedLinks });
      setEditingSocialLinks(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  // Add a function to handle social link changes
  const handleSocialLinkChange = (platform, value) => {
    setTempSocialLinks({
      ...tempSocialLinks,
      [platform]: value
    });
  };

  // Add function to open social links in new tab with error handling
  const openSocialLink = (url) => {
    if (url && url.trim() !== "") {
      try {
        // Add http:// prefix if not present
        let formattedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          formattedUrl = 'https://' + url;
        }
        window.open(formattedUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        handleError("Failed to open link. URL may be invalid.");
      }
    }
  };

  // Fetch user data from Firebase when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchUserProfile(user.uid);
      } else {
        // No user is signed in
        setLoading(false);
        handleError("No user signed in. Please log in to view your profile.");
        // You may want to redirect to login page here
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Fetch user profile from Firestore with error handling
  const fetchUserProfile = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // Set user data from Firestore
        const data = userDoc.data();
        setUserData(data);
        setActiveStatus(data.status || 'Needs Roommate');
        
        // Set profile image URL if exists
      if (data.profileImageUrl) {
        setImageUrl(data.profileImageUrl);
      } else {
        // Try to fetch profile image if it exists in storage but not in profile
        try {
          const storageRef = ref(storage, `profileImages/${uid}`);
          const url = await getDownloadURL(storageRef);
          setImageUrl(url);
          
          // Update profile with the image URL
          await updateDoc(userDocRef, { profileImageUrl: url });
        } catch (err) {
          // No image exists in storage, use default image from public assets
          console.log("No profile image found, using default");
          setImageUrl("/assets/usr1.jpg");
        }
      }
              
        // Set cover image URL if exists
        if (data.coverImageUrl) {
          setCoverImageUrl(data.coverImageUrl);
        } else {
          // Try to fetch cover image if it exists in storage but not in profile
          try {
            const storageRef = ref(storage, `coverImages/${uid}`);
            const url = await getDownloadURL(storageRef);
            setCoverImageUrl(url);
            
            // Update profile with the cover image URL
            await updateDoc(userDocRef, { coverImageUrl: url });
          } catch (err) {
            // No cover image exists yet, which is fine
            console.log("No cover image found");
          }
        }
        
        // Update all temp states with fetched data
        setTempName(data.fullName || '');
        setTempPronouns(data.pronouns || '');
        setTempAbout(data.about || '');
        setTempPreference(data.roomPreference || '');
        setTempAddress(data.currentAddress || '');
        setTempAge(data.age || '');
        setTempGender(data.gender || '');
        setTempLocation(data.hometown || '');
        setTempCollege(data.collegeName || '');
        setTempHostel(data.currentHostel || '');
        setTempSmoking(data.smokingHabit || '');
        setTempAlcohol(data.alcoholConsumption || '');
        setTempReligion(data.religion || '');
        setTempFieldOfStudy(data.fieldOfStudy || '');
        setTempFoodPreference(data.foodPreference || '');
        setTempSocialLinks(data.socialLinks || {
          linkedin: "",
          github: "",
          instagram: "",
          twitter: "",
          facebook: ""
        });
      
      } else {
        // Create a new user profile if it doesn't exist
        const defaultUserData = {
          fullName: "",
          pronouns: "",
          age: "",
          gender: "",
          hometown: "",
          collegeName: "",
          about: "",
          roomPreference: "",
          hobbies: [],
          interests: [],
          currentAddress: "",
          heartWays: [],
          favoriteFoods: [],
          currentHostel: "",
          foodPreference: "",
          socialLinks: {
            linkedin: "",
            github: "",
            instagram: "",
            twitter: "",
            facebook: ""
          },
          smokingHabit: "",
          alcoholConsumption: "",
          religion: "",
          fieldOfStudy: "",
          profileImageUrl: "",
          coverImageUrl: "",
          status: 'Needs Roommate',
          createdAt: new Date(),
          email: auth.currentUser.email,
          onboardingComplete: false
        };
        
        await setDoc(userDocRef, defaultUserData);
        setUserData(defaultUserData);
      }
    } catch (error) {
      handleError("Error fetching user profile. Please refresh the page.", error);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile in Firestore with error handling
  const updateUserProfile = async (updatedData) => {
    if (!userId) {
      handleError("User not authenticated. Please log in again.");
      return;
    }
    
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, updatedData);
      console.log("Profile updated successfully");
    } catch (error) {
      handleError("Error updating profile. Please try again.", error);
      // Revert local state to previous values if update fails
      if (error) {
        fetchUserProfile(userId);
      }
    }
  };

  // Handler for food preference
  const handleSaveFoodPreference = () => {
    try {
      const updatedData = {
        ...userData,
        foodPreference: tempFoodPreference
      };
      
      setUserData(updatedData);
      updateUserProfile({ foodPreference: tempFoodPreference });
      setEditingFoodPreference(false);
    } catch (error) {
      handleError("Failed to update food preference.", error);
    }
  };

  // Handler functions for editing operations with Firebase updates and error handling
  const handleSaveName = () => {
    try {
      if (!tempName.trim()) {
        throw new Error("Name cannot be empty");
      }
      
      const updatedData = {
        ...userData,
        fullName: tempName,
        pronouns: tempPronouns
      };
      
      setUserData(updatedData);
      updateUserProfile({ fullName: tempName, pronouns: tempPronouns });
      setEditingName(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  const handleSaveBasicInfo = () => {
    try {
      // Validate age if provided (must be a number)
      if (tempAge && isNaN(parseInt(tempAge))) {
        throw new Error("Age must be a number");
      }
      
      const updatedData = {
        ...userData,
        age: tempAge,
        gender: tempGender,
        hometown: tempLocation
      };
      
      setUserData(updatedData);
      updateUserProfile({ age: tempAge, gender: tempGender, hometown: tempLocation });
      setEditingBasicInfo(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  // Add these handler functions for editing operations with error handling
  const handleSaveSmoking = () => {
    try {
      const updatedData = {
        ...userData,
        smokingHabit: tempSmoking
      };
      
      setUserData(updatedData);
      updateUserProfile({ smokingHabit: tempSmoking });
      setEditingSmoking(false);
    } catch (error) {
      handleError("Failed to update smoking habit.", error);
    }
  };

  const handleSaveAlcohol = () => {
    try {
      const updatedData = {
        ...userData,
        alcoholConsumption: tempAlcohol
      };
      
      setUserData(updatedData);
      updateUserProfile({ alcoholConsumption: tempAlcohol });
      setEditingAlcohol(false);
    } catch (error) {
      handleError("Failed to update alcohol consumption.", error);
    }
  };

  const handleSaveReligion = () => {
    try {
      const updatedData = {
        ...userData,
        religion: tempReligion
      };
      
      setUserData(updatedData);
      updateUserProfile({ religion: tempReligion });
      setEditingReligion(false);
    } catch (error) {
      handleError("Failed to update religion.", error);
    }
  };

  const handleSaveFieldOfStudy = () => {
    try {
      const updatedData = {
        ...userData,
        fieldOfStudy: tempFieldOfStudy
      };
      
      setUserData(updatedData);
      updateUserProfile({ fieldOfStudy: tempFieldOfStudy });
      setEditingFieldOfStudy(false);
    } catch (error) {
      handleError("Failed to update field of study.", error);
    }
  };

  const handleSaveCollege = () => {
    try {
      const updatedData = {
        ...userData,
        collegeName: tempCollege
      };
      
      setUserData(updatedData);
      updateUserProfile({ collegeName: tempCollege });
      setEditingCollege(false);
    } catch (error) {
      handleError("Failed to update college name.", error);
    }
  };

  const handleSaveAbout = () => {
    try {
      const updatedData = {
        ...userData,
        about: tempAbout
      };
      
      setUserData(updatedData);
      updateUserProfile({ about: tempAbout });
      setEditingAbout(false);
    } catch (error) {
      handleError("Failed to update about section.", error);
    }
  };

  const handleSavePreference = () => {
    try {
      const updatedData = {
        ...userData,
        roomPreference: tempPreference
      };
      
      setUserData(updatedData);
      updateUserProfile({ roomPreference: tempPreference });
      setEditingPreference(false);
    } catch (error) {
      handleError("Failed to update room preference.", error);
    }
  };

  const handleSaveAddress = () => {
    try {
      const updatedData = {
        ...userData,
        currentAddress: tempAddress
      };
      
      setUserData(updatedData);
      updateUserProfile({ currentAddress: tempAddress });
      setEditingAddress(false);
    } catch (error) {
      handleError("Failed to update address.", error);
    }
  };

  const handleSaveHostel = () => {
    try {
      const updatedData = {
        ...userData,
        currentHostel: tempHostel
      };
      
      setUserData(updatedData);
      updateUserProfile({ currentHostel: tempHostel });
      setEditingHostel(false);
    } catch (error) {
      handleError("Failed to update hostel information.", error);
    }
  };

  // Update status and save to Firebase with error handling
  const handleStatusChange = (status) => {
    try {
      setActiveStatus(status);
      updateUserProfile({ status });
    } catch (error) {
      handleError("Failed to update status.", error);
    }
  };

  // Functions to add new items with Firebase updates and error handling
  const addHobby = () => {
    try {
      if (!newHobby.trim()) {
        throw new Error("Hobby cannot be empty");
      }
      
      // Check if hobby already exists
      if (userData.hobbies.includes(newHobby.trim())) {
        throw new Error("This hobby already exists in your profile");
      }
      
      const updatedHobbies = [...userData.hobbies, newHobby.trim()];
      setUserData(prev => ({
        ...prev,
        hobbies: updatedHobbies
      }));
      updateUserProfile({ hobbies: updatedHobbies });
      setNewHobby('');
      setAddingHobby(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  const addInterest = () => {
    try {
      if (!newInterest.trim()) {
        throw new Error("Interest cannot be empty");
      }
      
      // Check if interest already exists
      if (userData.interests.includes(newInterest.trim())) {
        throw new Error("This interest already exists in your profile");
      }
      
      const updatedInterests = [...userData.interests, newInterest.trim()];
      setUserData(prev => ({
        ...prev,
        interests: updatedInterests
      }));
      updateUserProfile({ interests: updatedInterests });
      setNewInterest('');
      setAddingInterest(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  const addFood = () => {
    try {
      if (!newFood.trim()) {
        throw new Error("Food cannot be empty");
      }
      
      // Check if food already exists
      if (userData.favoriteFoods.includes(newFood.trim())) {
        throw new Error("This food already exists in your favorites");
      }
      
      const updatedFoods = [...userData.favoriteFoods, newFood.trim()];
      setUserData(prev => ({
        ...prev,
        favoriteFoods: updatedFoods
      }));
      updateUserProfile({ favoriteFoods: updatedFoods });
      setNewFood('');
      setAddingFood(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  const addHeartTrait = () => {
    try {
      if (!newHeartTrait.trim()) {
        throw new Error("Heart trait cannot be empty");
      }
      
      // Check if trait already exists
      if (userData.heartWays.includes(newHeartTrait.trim())) {
        throw new Error("This trait already exists in your profile");
      }
      
      const updatedHeartWays = [...userData.heartWays, newHeartTrait.trim()];
      setUserData(prev => ({
        ...prev,
        heartWays: updatedHeartWays
      }));
      updateUserProfile({ heartWays: updatedHeartWays });
      setNewHeartTrait('');
      setAddingHeartTrait(false);
    } catch (error) {
      handleError(error.message);
    }
  };

  // Functions to remove items with Firebase updates and error handling
  const removeHobby = (hobbyToRemove) => {
    try {
      const updatedHobbies = userData.hobbies.filter(hobby => hobby !== hobbyToRemove);
      setUserData(prev => ({
        ...prev,
        hobbies: updatedHobbies
      }));
      updateUserProfile({ hobbies: updatedHobbies });
    } catch (error) {
      handleError("Failed to remove hobby.", error);
    }
  };

  const removeInterest = (interestToRemove) => {
    try {
      const updatedInterests = userData.interests.filter(interest => interest !== interestToRemove);
      setUserData(prev => ({
        ...prev,
        interests: updatedInterests
      }));
      updateUserProfile({ interests: updatedInterests });
    } catch (error) {
      handleError("Failed to remove interest.", error);
    }
  };

  const removeFood = (foodToRemove) => {
    try {
      const updatedFoods = userData.favoriteFoods.filter(food => food !== foodToRemove);
      setUserData(prev => ({
        ...prev,
        favoriteFoods: updatedFoods
      }));
      updateUserProfile({ favoriteFoods: updatedFoods });
    } catch (error) {
      handleError("Failed to remove food.", error);
    }
  };

  const removeHeartTrait = (traitToRemove) => {
    try {
      const updatedHeartWays = userData.heartWays.filter(trait => trait !== traitToRemove);
      setUserData(prev => ({
        ...prev,
        heartWays: updatedHeartWays
      }));
      updateUserProfile({ heartWays: updatedHeartWays });
    } catch (error) {
      handleError("Failed to remove heart trait.", error);
    }
  };

  if (loading) {
    return <div className="pr-loading">Loading profile...</div>;
  }
  
  return (
    <div className="pr-container">
      {/* Header Section */}
      <div className="pr-header">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt="Cover" className="pr-cover-photo" />
        ) : (
          <div className="pr-cover-photo-placeholder"></div>
        )}
        
        <div className="pr-photo-wrapper">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="pr-profile-photo" />
          ) : (
            <div className="pr-profile-photo-placeholder">
              {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          
          {/* Profile Image Upload Button */}
          <label htmlFor="profile-image-upload" className="pr-image-upload-btn">
            <FontAwesomeIcon icon={faCamera} />
          </label>
          <input 
            type="file" 
            id="profile-image-upload" 
            accept="image/*" 
            onChange={handleProfileImageChange} 
            style={{ display: 'none' }} 
          />
        </div>
        
        {/* Cover Image Upload Button */}
        <label htmlFor="cover-image-upload" className="pr-cover-upload-btn">
          <FontAwesomeIcon icon={faCamera} />
          <span>Update Cover</span>
        </label>
        <input 
          type="file" 
          id="cover-image-upload" 
          accept="image/*" 
          onChange={handleCoverImageChange} 
          style={{ display: 'none' }} 
        />
  
  {/* Upload Progress Indicator (shows only during upload) */}
  {uploading && (
    <div className="pr-upload-progress">
      <div className="pr-upload-progress-inner"></div>
    </div>
  )}
        {/* Replace the existing social icons section in the pr-connect div with this code */}
        <div className="pr-connect">
          <div className="pr-connect-header">
            <h4>Connect with me</h4>
            {!editingSocialLinks ? (
              <button 
                className="pr-edit-btn" 
                onClick={() => {
                  setEditingSocialLinks(true);
                  setTempSocialLinks({...userData.socialLinks});
                }}
              >
                <FontAwesomeIcon icon={faPen} />
              </button>
            ) : null}
          </div>
          
          {!editingSocialLinks ? (
            <div className="pr-social-icons">
              <button 
                className={`pr-icon-btn ${userData.socialLinks?.linkedin ? 'active' : ''}`}
                onClick={() => openSocialLink(userData.socialLinks?.linkedin)}
                disabled={!userData.socialLinks?.linkedin}
              >
                <FontAwesomeIcon icon={faLinkedinIn} />
              </button>
              <button 
                className={`pr-icon-btn ${userData.socialLinks?.github ? 'active' : ''}`}
                onClick={() => openSocialLink(userData.socialLinks?.github)}
                disabled={!userData.socialLinks?.github}
              >
                <FontAwesomeIcon icon={faGithub} />
              </button>
              <button 
                className={`pr-icon-btn ${userData.socialLinks?.instagram ? 'active' : ''}`}
                onClick={() => openSocialLink(userData.socialLinks?.instagram)}
                disabled={!userData.socialLinks?.instagram}
              >
                <FontAwesomeIcon icon={faInstagram} />
              </button>
              <button 
                className={`pr-icon-btn ${userData.socialLinks?.twitter ? 'active' : ''}`}
                onClick={() => openSocialLink(userData.socialLinks?.twitter)}
                disabled={!userData.socialLinks?.twitter}
              >
                <FontAwesomeIcon icon={faTwitter} />
              </button>
              <button 
                className={`pr-icon-btn ${userData.socialLinks?.facebook ? 'active' : ''}`}
                onClick={() => openSocialLink(userData.socialLinks?.facebook)}
                disabled={!userData.socialLinks?.facebook}
              >
                <FontAwesomeIcon icon={faGlobe} />
              </button>
            </div>
          ) : (
            <div className="pr-social-links-form">
              <div className="pr-social-input-group">
                <label>
                  <FontAwesomeIcon icon={faLinkedinIn} />
                  <input 
                    type="text" 
                    value={tempSocialLinks.linkedin} 
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                </label>
              </div>
              <div className="pr-social-input-group">
                <label>
                  <FontAwesomeIcon icon={faGithub} />
                  <input 
                    type="text" 
                    value={tempSocialLinks.github} 
                    onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                    placeholder="GitHub URL"
                  />
                </label>
              </div>
              <div className="pr-social-input-group">
                <label>
                  <FontAwesomeIcon icon={faInstagram} />
                  <input 
                    type="text" 
                    value={tempSocialLinks.instagram} 
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="Instagram URL"
                  />
                </label>
              </div>
              <div className="pr-social-input-group">
                <label>
                  <FontAwesomeIcon icon={faTwitter} />
                  <input 
                    type="text" 
                    value={tempSocialLinks.twitter} 
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="Twitter URL"
                  />
                </label>
              </div>
              <div className="pr-social-input-group">
                <label>
                  <FontAwesomeIcon icon={faGlobe} />
                  <input 
                    type="text" 
                    value={tempSocialLinks.facebook} 
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    placeholder="Facebook URL"
                  />
                </label>
              </div>
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSaveSocialLinks}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingSocialLinks(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Profile Header Info */}
      <div className="pr-header-info">
        <div className="pr-name-row">
          {!editingName ? (
            <>
              <h1 className="pr-user-name">{userData.fullName}</h1>
              <span className="pr-verified" title="Verified">
                <FontAwesomeIcon icon={faShieldAlt} className="pr-shield-icon" />
                <FontAwesomeIcon icon={faCheck} className="pr-check-icon" />
              </span>
              <p className="pr-pronouns">{userData.pronouns}</p>
              <button className="pr-edit-btn" title="Edit Profile" onClick={() => {
                setEditingName(true);
                setTempName(userData.fullName);
                setTempPronouns(userData.pronouns);
              }}>
                <FontAwesomeIcon icon={faPen} />
              </button>
            </>
          ) : (
            <div className="pr-edit-form">
              <input 
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
                className="pr-edit-input"
                placeholder="Name"
              />
              <input 
                type="text" 
                value={tempPronouns} 
                onChange={(e) => setTempPronouns(e.target.value)}
                className="pr-edit-input"
                placeholder="Pronouns"
              />
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSaveName}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingName(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* User Basic Info */}
      <div className="pr-info">
        <div className="pr-basic-info">
          {!editingBasicInfo ? (
            <>
              <div className="pr-info-row">
                <span className="pr-info-item">{userData.age}, {userData.gender}</span>
              </div>
              <div className="pr-info-row">
                <span className="pr-info-item">{userData.hometown}</span>
              </div>
              <button className="pr-edit-btn" onClick={() => {
                setEditingBasicInfo(true);
                setTempAge(userData.age);
                setTempGender(userData.gender);
                setTempLocation(userData.hometown);
              }}>
                <FontAwesomeIcon icon={faPen} />
              </button>
            </>
          ) : (
            <div className="pr-edit-form">
              <div className="pr-edit-row">
                <input 
                  type="text" 
                  value={tempAge} 
                  onChange={(e) => setTempAge(e.target.value)}
                  className="pr-edit-input-small"
                  placeholder="Age"
                />
                <input 
                  type="text" 
                  value={tempGender} 
                  onChange={(e) => setTempGender(e.target.value)}
                  className="pr-edit-input"
                  placeholder="Gender"
                />
              </div>
              <input 
                type="text" 
                value={tempLocation} 
                onChange={(e) => setTempLocation(e.target.value)}
                className="pr-edit-input"
                placeholder="Location"
              />
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSaveBasicInfo}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingBasicInfo(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="pr-college">
          {!editingCollege ? (
            <>
              <img 
                src="/assets/bg3.jpg" 
                alt="College Logo" 
                className="pr-college-logo" 
              />
              <span className="pr-college-name">{userData.collegeName}</span>
              <button className="pr-edit-btn" onClick={() => {
                setEditingCollege(true);
                setTempCollege(userData.collegeName);
              }}>
                <FontAwesomeIcon icon={faPen} />
              </button>
            </>
          ) : (
            <div className="pr-edit-form">
              <input 
                type="text" 
                value={tempCollege} 
                onChange={(e) => setTempCollege(e.target.value)}
                className="pr-edit-input"
                placeholder="College"
              />
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSaveCollege}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingCollege(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Status Buttons */}
      <div className="pr-status">
        {[
          'Needs Roommate', 
          'Needs Place to Stay', 
          'Has Roommate', 
          'Has Place to Stay'
        ].map(status => (
          <button 
            key={status}
            className={`pr-status-btn ${activeStatus === status ? 'active' : ''}`}
            onClick={() => handleStatusChange(status)}
          >
            {status}
          </button>
        ))}
      </div>
  
      {/* About and Preference Section */}
      <div className="pr-about-section">
        <div className="pr-about">
          <div className="pr-section-header">
            <h3>About Me</h3>
            {!editingAbout ? (
              <FontAwesomeIcon 
                icon={faEdit} 
                className="pr-edit-icon" 
                onClick={() => {
                  setEditingAbout(true);
                  setTempAbout(userData.about);
                }}
              />
            ) : null}
          </div>
          {!editingAbout ? (
            <p className="pr-about-text">
              {userData.about}
            </p>
          ) : (
            <div className="pr-edit-form">
              <textarea 
                value={tempAbout} 
                onChange={(e) => setTempAbout(e.target.value)}
                className="pr-edit-textarea"
                placeholder="About me"
              />
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSaveAbout}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingAbout(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="pr-preference">
          <div className="pr-section-header">
            <h3>Preference</h3>
            {!editingPreference ? (
              <FontAwesomeIcon 
                icon={faEdit} 
                className="pr-edit-icon" 
                onClick={() => {
                  setEditingPreference(true);
                  setTempPreference(userData.roomPreference);
                }}
              />
            ) : null}
          </div>
          {!editingPreference ? (
            <p className="pr-preference-value">Prefers: {userData.roomPreference}</p>
          ) : (
            <div className="pr-edit-form">
              <select 
                value={tempPreference} 
                onChange={(e) => setTempPreference(e.target.value)}
                className="pr-edit-select"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="any">Any</option>
              </select>
              <div className="pr-edit-actions">
                <button className="pr-save-btn" onClick={handleSavePreference}>
                  <FontAwesomeIcon icon={faSave} />
                </button>
                <button className="pr-cancel-btn" onClick={() => setEditingPreference(false)}>
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Personal Preferences Section */}
        <div className="pr-personal-preferences">
          <h3 className="pr-section-title">Personal Preferences</h3>
          <div className="pr-preferences-grid">
            {/* Smoking Habits */}
            <div className="pr-preference-box">
              <div className="pr-box-header">
                <h4>Smoking Habits</h4>
                {!editingSmoking ? (
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    className="pr-edit-icon" 
                    onClick={() => {
                      setEditingSmoking(true);
                      setTempSmoking(userData.smokingHabit);
                    }}
                  />
                ) : null}
              </div>
              {!editingSmoking ? (
                <p className="pr-preference-value">{userData.smokingHabit}</p>
              ) : (
                <div className="pr-edit-form">
                  <select 
                    value={tempSmoking} 
                    onChange={(e) => setTempSmoking(e.target.value)}
                    className="pr-edit-select"
                  >
                    <option value="Non-smoker">Non-smoker</option>
                    <option value="Occasional smoker">Occasional smoker</option>
                    <option value="Regular smoker">Regular smoker</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="pr-edit-actions">
                    <button className="pr-save-btn" onClick={handleSaveSmoking}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button className="pr-cancel-btn" onClick={() => setEditingSmoking(false)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alcohol Habits */}
            <div className="pr-preference-box">
              <div className="pr-box-header">
                <h4>Alcohol Habits</h4>
                {!editingAlcohol ? (
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    className="pr-edit-icon" 
                    onClick={() => {
                      setEditingAlcohol(true);
                      setTempAlcohol(userData.alcoholConsumption);
                    }}
                  />
                ) : null}
              </div>
              {!editingAlcohol ? (
                <p className="pr-preference-value">{userData.alcoholConsumption}</p>
              ) : (
                <div className="pr-edit-form">
                  <select 
                    value={tempAlcohol} 
                    onChange={(e) => setTempAlcohol(e.target.value)}
                    className="pr-edit-select"
                  >
                    <option value="Non-drinker">Non-drinker</option>
                    <option value="Social drinker">Social drinker</option>
                    <option value="Regular drinker">Regular drinker</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="pr-edit-actions">
                    <button className="pr-save-btn" onClick={handleSaveAlcohol}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button className="pr-cancel-btn" onClick={() => setEditingAlcohol(false)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Religion */}
            <div className="pr-preference-box">
              <div className="pr-box-header">
                <h4>Religion</h4>
                {!editingReligion ? (
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    className="pr-edit-icon" 
                    onClick={() => {
                      setEditingReligion(true);
                      setTempReligion(userData.religion);
                    }}
                  />
                ) : null}
              </div>
              {!editingReligion ? (
                <p className="pr-preference-value">{userData.religion}</p>
              ) : (
                <div className="pr-edit-form">
                  <select 
                    value={tempReligion} 
                    onChange={(e) => setTempReligion(e.target.value)}
                    className="pr-edit-select"
                  >
                    <option value="Christianity">Christianity</option>
                    <option value="Islam">Islam</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Buddhism">Buddhism</option>
                    <option value="Judaism">Judaism</option>
                    <option value="Sikhism">Sikhism</option>
                    <option value="Atheist">Atheist</option>
                    <option value="Agnostic">Agnostic</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <div className="pr-edit-actions">
                    <button className="pr-save-btn" onClick={handleSaveReligion}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button className="pr-cancel-btn" onClick={() => setEditingReligion(false)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Field of Study */}
            <div className="pr-preference-box">
              <div className="pr-box-header">
                <h4>Field of Study</h4>
                {!editingFieldOfStudy ? (
                  <FontAwesomeIcon 
                    icon={faEdit} 
                    className="pr-edit-icon" 
                    onClick={() => {
                      setEditingFieldOfStudy(true);
                      setTempFieldOfStudy(userData.fieldOfStudy);
                    }}
                  />
                ) : null}
              </div>
              {!editingFieldOfStudy ? (
                <p className="pr-preference-value">{userData.fieldOfStudy}</p>
              ) : (
                <div className="pr-edit-form">
                  <input 
                    type="text" 
                    value={tempFieldOfStudy} 
                    onChange={(e) => setTempFieldOfStudy(e.target.value)}
                    className="pr-edit-input"
                    placeholder="Field of Study"
                  />
                  <div className="pr-edit-actions">
                    <button className="pr-save-btn" onClick={handleSaveFieldOfStudy}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button className="pr-cancel-btn" onClick={() => setEditingFieldOfStudy(false)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  
      {/* Content Layout */}
      <div className="pr-content-grid">
        {/* Hobbies Section */}
        <div className="pr-hobbies">
          <div className="pr-hobbies-header">
            <h3>Hobbies</h3>
            {!addingHobby ? (
              <button className="pr-add-btn" onClick={() => setAddingHobby(true)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            ) : (
              <div className="pr-add-form">
                <input 
                  type="text" 
                  value={newHobby} 
                  onChange={(e) => setNewHobby(e.target.value)}
                  className="pr-add-input"
                  placeholder="New hobby"
                />
                <div className="pr-add-actions">
                  <button className="pr-save-btn" onClick={addHobby}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="pr-cancel-btn" onClick={() => setAddingHobby(false)}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="pr-hobby-list">
            {userData.hobbies && userData.hobbies.map(hobby => (
              <div key={hobby} className="pr-hobby-chip">
                {hobby}
                <span className="pr-remove-btn" onClick={() => removeHobby(hobby)}>
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </div>
            ))}
          </div>
        </div>
  
        {/* Right Section Boxes */}
        <div className="pr-right-content">
          <div className="pr-box">
            <div className="pr-box-header">
              <h4>Interests</h4>
              {!addingInterest ? (
                <button className="pr-add-btn" onClick={() => setAddingInterest(true)}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              ) : (
                <div className="pr-add-form">
                  <input 
                    type="text" 
                    value={newInterest} 
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="pr-add-input"
                    placeholder="New interest"
                  />
                  <div className="pr-add-actions">
                    <button className="pr-save-btn" onClick={addInterest}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button className="pr-cancel-btn" onClick={() => setAddingInterest(false)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="pr-capsule-container">
              {userData.interests && userData.interests.map(interest => (
                <span key={interest} className="pr-capsule">
                  {interest}
                  <span className="pr-remove-btn" onClick={() => removeInterest(interest)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="pr-box">
            <div className="pr-box-header">
              <h4>Address</h4>
              {!editingAddress ? (
                <FontAwesomeIcon 
                  icon={faEdit} 
                  className="pr-edit-icon" 
                  onClick={() => {
                    setEditingAddress(true);
                    setTempAddress(userData.currentAddress);
                  }}
                />
              ) : null}
            </div>
            {!editingAddress ? (
              <p className="pr-address-text">{userData.currentAddress}</p>
            ) : (
              <div className="pr-edit-form">
                <textarea 
                  value={tempAddress} 
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="pr-edit-textarea"
                  placeholder="Address"
                />
                <div className="pr-edit-actions">
                  <button className="pr-save-btn" onClick={handleSaveAddress}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="pr-cancel-btn" onClick={() => setEditingAddress(false)}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  
      {/* Favorites Section */}
      <div className="pr-favorites">
        <div className="pr-favorite-box">
          <div className="pr-box-header">
            <h4>Way to Your Heart</h4>
            {!addingHeartTrait ? (
              <button className="pr-add-btn" onClick={() => setAddingHeartTrait(true)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            ) : (
              <div className="pr-add-form">
                <input 
                  type="text" 
                  value={newHeartTrait} 
                  onChange={(e) => setNewHeartTrait(e.target.value)}
                  className="pr-add-input"
                  placeholder="New trait"
                />
                <div className="pr-add-actions">
                  <button className="pr-save-btn" onClick={addHeartTrait}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="pr-cancel-btn" onClick={() => setAddingHeartTrait(false)}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="pr-food-tags">
            {userData.heartWays && userData.heartWays.map(trait => (
              <span key={trait} className="pr-food-tag">
                {trait}
                <span className="pr-remove-btn" onClick={() => removeHeartTrait(trait)}>
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="pr-favorite-box">
          <div className="pr-box-header">
            <h4>Your Tummy Chargers</h4>
            {!addingFood ? (
              <button className="pr-add-btn" onClick={() => setAddingFood(true)}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            ) : (
              <div className="pr-add-form">
                <input 
                  type="text" 
                  value={newFood} 
                  onChange={(e) => setNewFood(e.target.value)}
                  className="pr-add-input"
                  placeholder="New food"
                />
                <div className="pr-add-actions">
                  <button className="pr-save-btn" onClick={addFood}>
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button className="pr-cancel-btn" onClick={() => setAddingFood(false)}>
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="pr-food-tags">
            {userData.favoriteFoods && userData.favoriteFoods.map(food => (
              <span key={food} className="pr-food-tag">
                {food}
                <span className="pr-remove-btn" onClick={() => removeFood(food)}>
                  <FontAwesomeIcon icon={faTimes} />
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
  
      {/* Current Hostel */}
      <div className="pr-hostel">
        <h4>Current Hostel</h4>
        {!editingHostel ? (
          <>
            <h2 className="pr-hostel-name">{userData.currentHostel}</h2>
            <button className="pr-edit-btn" onClick={() => {
              setEditingHostel(true);
              setTempHostel(userData.currentHostel);
            }}>
              <FontAwesomeIcon icon={faPen} />
            </button>
          </>
        ) : (
          <div className="pr-edit-form">
            <input 
              type="text" 
              value={tempHostel} 
              onChange={(e) => setTempHostel(e.target.value)}
              className="pr-edit-input"
              placeholder="Hostel"
            />
            <div className="pr-edit-actions">
              <button className="pr-save-btn" onClick={handleSaveHostel}>
                <FontAwesomeIcon icon={faSave} />
              </button>
              <button className="pr-cancel-btn" onClick={() => setEditingHostel(false)}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;