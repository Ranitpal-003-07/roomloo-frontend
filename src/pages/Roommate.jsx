/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../styles/RoommateFinder.css";
import RoommateCard from "../components/RoommateCard";
import { FaSearch, FaFilter, FaMapMarkerAlt, FaUniversity, FaVenusMars, FaUtensils, FaBookOpen, FaSmoking, FaWineGlass, FaHome, FaPray, FaTimes } from "react-icons/fa";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const RoommateFinder = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [locationFilter, setLocationFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState([]);
  const [hasPGFilter, setHasPGFilter] = useState(false);
  const [religionFilter, setReligionFilter] = useState([]);
  const [genderFilter, setGenderFilter] = useState([]);
  const [roommatePreferenceFilter, setRoommatePreferenceFilter] = useState([]);
  const [foodPreferenceFilter, setFoodPreferenceFilter] = useState([]);
  const [fieldFilter, setFieldFilter] = useState([]);
  const [smokingFilter, setSmokingFilter] = useState([]);
  const [alcoholFilter, setAlcoholFilter] = useState([]);
  
  // Original unfiltered roommates data
  const [allRoommates, setAllRoommates] = useState([]);

  // Colleges list for checkboxes
  const colleges = [
    "IIT Delhi",
    "Delhi University",
    "Jamia Millia Islamia",
    "NSUT",
    "IIIT Delhi",
    "DTU",
    "Ambedkar University",
    "IP University",
    "JNU",
    "AIIMS Delhi",
    "Hansraj College",
    "Lady Shri Ram College",
    "Shri Ram College of Commerce",
    "St. Stephen's College",
    "Miranda House",
    "Lovely Professional University"
  ];

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isFilterVisible) {
        // Keep filters visible on larger screens
      } else if (window.innerWidth <= 768) {
        // Close filters when resizing to mobile if they're open
        // We keep this behavior optional
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFilterVisible]);

  // Close filter overlay when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && isFilterVisible) {
        const filterContainer = document.querySelector('.roommate-right');
        if (filterContainer && !filterContainer.contains(event.target) && 
            !event.target.closest('.filters-toggle')) {
          setIsFilterVisible(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterVisible]);

 // Fetch users from Firebase
  useEffect(() => {
    const fetchRoommates = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error("No user is logged in");
          setLoading(false);
          return;
        }

        const usersRef = collection(db, "users");
        // Query to get all users except the current one
        const q = query(usersRef, where("email", "!=", currentUser.email));
        const querySnapshot = await getDocs(q);
        
        const roommateData = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          // Transform Firebase data to match our roommate structure
          roommateData.push({
            id: doc.id,
            name: userData.fullName || "Anonymous",
            age: userData.age || "20",
            college: userData.collegeName || "Unknown",
            gender: userData.gender || "Not specified",
            matchPercentage: calculateMatchPercentage(userData, currentUser),
            image: userData.profileImage || "/assets/usr1.jpg",
            about: userData.about || "No description available",
            preference: userData.roomPreference || "Not specified",
            address: userData.currentAddress || "Not specified",
            currentHostel: userData.currentHostel || "Not specified",
            hobbies: userData.hobbies || [],
            interests: userData.interests || [],
            wayToHeart: userData.heartWays || [],
            foodsLove: userData.favoriteFoods || [],
            email: userData.email || "Not available",
            field: userData.fieldOfStudy || "Not specified",
            hasPG: userData.currentHostel.length > 0,
            religion: userData.religion || "Not specified",
            foodPreference: userData.foodPreference || "Not specified",
            smokingHabit: userData.smokingHabit || "Not specified",
            alcoholPreference: userData.alcoholConsumption || "Not specified",
            socialLinks: userData.socialLinks || {},
            hometown: userData.hometown || "Not specified",
            createdAt: userData.createdAt || null,
            isPgOwner: userData.isPgOwner || false, // Add this line
          });
        });

        setAllRoommates(roommateData);
        setRoommates(roommateData);
      } catch (error) {
        console.error("Error fetching roommates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoommates();
  }, []);
  // Calculate match percentage function
  const calculateMatchPercentage = (userData, currentUser) => {
    let matchScore = 0;
    let totalFactors = 0;
    
    // Get current user data from auth
    const getCurrentUserData = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists() ? userSnap.data() : null;
    };

    const currentUserData = getCurrentUserData();
    
    // Compare fields that contribute to compatibility
    
    // Same college bonus
    if (currentUserData && userData.collegeName === currentUserData.collegeName) {
      matchScore += 15;
    }
    totalFactors += 15;
    
    // Gender preference match
    if (userData.roomPreference === currentUserData?.gender || 
        userData.roomPreference === "any") {
      matchScore += 20;
    }
    totalFactors += 20;
    
    // Same field of study
    if (currentUserData && userData.fieldOfStudy === currentUserData.fieldOfStudy) {
      matchScore += 10;
    }
    totalFactors += 10;
    
    // Smoking habits compatibility
    if (currentUserData && userData.smokingHabit === currentUserData.smokingHabit) {
      matchScore += 10;
    }
    totalFactors += 10;
    
    // Alcohol compatibility
    if (currentUserData && userData.alcoholConsumption === currentUserData.alcoholConsumption) {
      matchScore += 10;
    }
    totalFactors += 10;
    
    // Food preference compatibility
    if (currentUserData && userData.foodPreference === currentUserData.foodPreference) {
      matchScore += 5;
    }
    totalFactors += 5;
    
    // Religion compatibility
    if (currentUserData && userData.religion === currentUserData.religion) {
      matchScore += 10;
    }
    totalFactors += 10;
    
    // Calculate shared hobbies
    let sharedHobbies = 0;
    if (currentUserData?.hobbies && userData.hobbies) {
      userData.hobbies.forEach(hobby => {
        if (currentUserData.hobbies.includes(hobby)) {
          sharedHobbies++;
        }
      });
      if (sharedHobbies > 0) {
        matchScore += Math.min(10, sharedHobbies * 2); // Max 10 points
      }
    }
    totalFactors += 10;
    
    // Calculate shared interests
    let sharedInterests = 0;
    if (currentUserData?.interests && userData.interests) {
      userData.interests.forEach(interest => {
        if (currentUserData.interests.includes(interest)) {
          sharedInterests++;
        }
      });
      if (sharedInterests > 0) {
        matchScore += Math.min(10, sharedInterests * 2); // Max 10 points
      }
    }
    totalFactors += 10;
    
    // Calculate final percentage
    const finalPercentage = totalFactors > 0 ? Math.round((matchScore / totalFactors) * 100) : 75;
    
    // Ensure we have at least 50% match and max 99%
    return Math.max(50, Math.min(99, finalPercentage));
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Close filters (for mobile after applying)
  const closeFilters = () => {
    if (window.innerWidth <= 768) {
      setIsFilterVisible(false);
    }
  };

  // Handle checkbox changes for multi-select filters
  const handleCheckboxChange = (value, currentSelections, setSelectionFunction) => {
    if (currentSelections.includes(value)) {
      setSelectionFunction(currentSelections.filter(item => item !== value));
    } else {
      setSelectionFunction([...currentSelections, value]);
    }
  };

  // Apply all filters
  useEffect(() => {
    let filteredResults = allRoommates.filter(roommate => !roommate.isPgOwner);
    // Apply search term filter (across name, college, location)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredResults = filteredResults.filter(roommate => 
        roommate.name.toLowerCase().includes(searchLower) ||
        roommate.college.toLowerCase().includes(searchLower) ||
        roommate.address.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply location filter
    if (locationFilter) {
      filteredResults = filteredResults.filter(roommate =>
        roommate.address.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Apply college filter
    if (collegeFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        collegeFilter.includes(roommate.college)
      );
    }

    // Apply PG filter
    if (hasPGFilter) {
      filteredResults = filteredResults.filter(roommate => roommate.hasPG);
    }
    
    // Apply religion filter
    if (religionFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        religionFilter.includes(roommate.religion)
      );
    }
    
    // Apply gender filter
    if (genderFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        genderFilter.some(gender => 
          roommate.gender.toLowerCase().includes(gender.toLowerCase())
        )
      );
    }
    
    // Apply roommate preference filter
    if (roommatePreferenceFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate => {
        // Check if preference contains any of the selected filter values
        return roommatePreferenceFilter.some(pref => 
          roommate.preference.toLowerCase().includes(pref.toLowerCase())
        );
      });
    }
    
    // Apply food preference filter
    if (foodPreferenceFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        foodPreferenceFilter.includes(roommate.foodPreference)
      );
    }
    
    // Apply field of study filter
    if (fieldFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        fieldFilter.includes(roommate.field)
      );
    }
    
    // Apply smoking habits filter
    if (smokingFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        smokingFilter.includes(roommate.smokingHabit)
      );
    }
    
    // Apply alcohol preference filter
    if (alcoholFilter.length > 0) {
      filteredResults = filteredResults.filter(roommate =>
        alcoholFilter.includes(roommate.alcoholPreference)
      );
    }
    
    setRoommates(filteredResults);
  }, [
    searchTerm, 
    allRoommates, 
    locationFilter, 
    collegeFilter, 
    hasPGFilter, 
    religionFilter, 
    genderFilter, 
    roommatePreferenceFilter, 
    foodPreferenceFilter, 
    fieldFilter, 
    smokingFilter, 
    alcoholFilter
  ]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setCollegeFilter([]);
    setHasPGFilter(false);
    setReligionFilter([]);
    setGenderFilter([]);
    setRoommatePreferenceFilter([]);
    setFoodPreferenceFilter([]);
    setFieldFilter([]);
    setSmokingFilter([]);
    setAlcoholFilter([]);
  };

  // Apply filters and close on mobile
  const applyFilters = () => {
    closeFilters();
  };

  return (
    <div className="roommate-page">
      {/* Search & Filter Header */}
      <div className="roommate-header">
        <h1>Find Your Perfect Roommate</h1>
        <div className="search-filter-container">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, college or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className={`filters-toggle ${isFilterVisible ? 'active' : ''}`} 
            onClick={toggleFilters}
            aria-label="Toggle filters"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="roommate-content">
        {/* Left Side - Results */}
        <div className="roommate-left">
          <div className="results-header">
            <h2>Matching Roommates</h2>
            <span className="results-count">{roommates.length} results</span>
          </div>
          
          {loading ? (
            <div className="loading-container">Loading roommates...</div>
          ) : roommates.length === 0 ? (
            <div className="no-results">No matching roommates found. Try adjusting your filters.</div>
          ) : (
            <div className="roommate-grid">
              {roommates.map((roommate) => (
                <div key={roommate.id}>
                  <RoommateCard roommate={roommate} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Filters */}
        <div className={`roommate-right ${isFilterVisible ? 'visible' : ''}`}>
          <div className="roommate-filters">
            <div className="filter-header">
              <h3 className="filter-title">Filter Roommates</h3>
              <div className="filter-actions">
                <button className="clear-filters" onClick={clearAllFilters}>Clear All</button>
                <button className="close-filters-mobile" onClick={closeFilters}>
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="filter-group location-filter">
              <div className="filter-group-header">
                <FaMapMarkerAlt className="filter-icon" />
                <h4>Location</h4>
              </div>
              <input 
                type="text" 
                placeholder="Search locations..." 
                className="filter-search"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>

            <div className="filter-group college-filter">
              <div className="filter-group-header">
                <FaUniversity className="filter-icon" />
                <h4>College</h4>
              </div>
              <input
                type="text"
                placeholder="Search colleges..."
                className="filter-search"
                onChange={(e) => {
                  // This could be used to filter the college checkbox list
                  // For now we'll just keep it as is
                }}
              />
              <div className="college-checkboxes">
                {colleges.map((college, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={collegeFilter.includes(college)}
                      onChange={() => handleCheckboxChange(college, collegeFilter, setCollegeFilter)}
                    />
                    <span className="checkbox-text">{college}</span>
                  </label>
                ))}
                <button className="show-more-btn">Show more</button>
              </div>
            </div>

            <div className="filter-group accommodation-filter">
              <div className="filter-group-header">
                <FaHome className="filter-icon" />
                <h4>Accommodation</h4>
              </div>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  className="styled-checkbox"
                  checked={hasPGFilter}
                  onChange={() => setHasPGFilter(!hasPGFilter)}
                />
                <span className="checkbox-text">Has PG Available</span>
              </label>
            </div>

            <div className="filter-group religion-filter">
              <div className="filter-group-header">
                <FaPray className="filter-icon" />
                <h4>Religion</h4>
              </div>
              <div className="checkbox-grid">
                {["Hindu", "Muslim", "Christian", "Others"].map((religion, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={religionFilter.includes(religion)}
                      onChange={() => handleCheckboxChange(religion, religionFilter, setReligionFilter)}
                    />
                    <span className="checkbox-text">{religion}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group gender-filter">
              <div className="filter-group-header">
                <FaVenusMars className="filter-icon" />
                <h4>Gender</h4>
              </div>
              <div className="checkbox-grid">
                {["Male", "Female", "Other"].map((gender, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={genderFilter.includes(gender)}
                      onChange={() => handleCheckboxChange(gender, genderFilter, setGenderFilter)}
                    />
                    <span className="checkbox-text">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group preference-filter">
              <div className="filter-group-header">
                <FaVenusMars className="filter-icon" />
                <h4>Roommate Preference</h4>
              </div>
              <div className="checkbox-grid">
                {["Male", "Female", "Any"].map((pref, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={roommatePreferenceFilter.includes(pref)}
                      onChange={() => handleCheckboxChange(pref, roommatePreferenceFilter, setRoommatePreferenceFilter)}
                    />
                    <span className="checkbox-text">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group food-filter">
              <div className="filter-group-header">
                <FaUtensils className="filter-icon" />
                <h4>Food Preference</h4>
              </div>
              <div className="checkbox-grid">
                {["Vegetarian", "Non-Vegetarian", "Eggetarian"].map((food, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={foodPreferenceFilter.includes(food)}
                      onChange={() => handleCheckboxChange(food, foodPreferenceFilter, setFoodPreferenceFilter)}
                    />
                    <span className="checkbox-text">{food}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group field-filter">
              <div className="filter-group-header">
                <FaBookOpen className="filter-icon" />
                <h4>Field of Study</h4>
              </div>
              <div className="checkbox-grid">
                {["Computer Science", "Engineering", "Arts", "Medical", "Business", "Science"].map((field, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={fieldFilter.includes(field)}
                      onChange={() => handleCheckboxChange(field, fieldFilter, setFieldFilter)}
                    />
                    <span className="checkbox-text">{field}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group habits-filter">
              <div className="filter-group-header">
                <FaSmoking className="filter-icon" />
                <h4>Smoking Habits</h4>
              </div>
              <div className="checkbox-grid">
                {["Smoker", "Non-Smoker"].map((habit, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={smokingFilter.includes(habit)}
                      onChange={() => handleCheckboxChange(habit, smokingFilter, setSmokingFilter)}
                    />
                    <span className="checkbox-text">{habit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group alcohol-filter">
              <div className="filter-group-header">
                <FaWineGlass className="filter-icon" />
                <h4>Alcohol Preference</h4>
              </div>
              <div className="checkbox-grid">
                {["Drinks", "Non-Drinker"].map((alcohol, idx) => (
                  <label key={idx} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="styled-checkbox"
                      checked={alcoholFilter.includes(alcohol)}
                      onChange={() => handleCheckboxChange(alcohol, alcoholFilter, setAlcoholFilter)}
                    />
                    <span className="checkbox-text">{alcohol}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              className="apply-filters-btn"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when filters are visible */}
      {isFilterVisible && window.innerWidth <= 768 && (
        <div className="filter-overlay" onClick={closeFilters}></div>
      )}
    </div>
  );
};

export default RoommateFinder;