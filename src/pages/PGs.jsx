/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../styles/PGpage.css";
import PGCard from "../components/PGCard";
import PGDetailsModal from "../components/PGDetailsModal";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const PGs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [pgList, setPgList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Set fixed price range from 0 to 40000
  const [priceRange] = useState({ min: 0, max: 40000 });
  const [currentPriceRange, setCurrentPriceRange] = useState(40000);
  
  const [amenityFilters, setAmenityFilters] = useState({
    "WiFi": false,
    "AC": false,
    "Non-AC": false,
    "TV": false,
    "Laundry": false,
    "Parking": false,
    "Mess/Food": false,
    "Gym": false,
    "Power Backup": false,
    "24/7 Water": false,
    "Security": false,
    "Cleaning Service": false,
    "Refrigerator": false,
    "Washing Machine": false,
    "Swimming Pool": false,
    "Elevator": false
  });
  
  const [locations, setLocations] = useState([]);
  const [colleges, setColleges] = useState([]);

  // Fetch PG listings from Firestore
  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
        const pgCollectionRef = collection(db, "pgListings");
        const pgSnapshot = await getDocs(pgCollectionRef);
        
        const pgData = pgSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPgList(pgData);
        
        // Extract unique locations from fetched data
        const uniqueLocations = [...new Set(pgData.map(pg => pg.location).filter(Boolean))];
        setLocations(uniqueLocations);
        
        // Extract unique colleges from fetched data
        const uniqueColleges = [...new Set(pgData
          .map(pg => pg.nearbyCollege)
          .filter(college => college && college.trim() !== '')
        )];
        setColleges(uniqueColleges);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching PG listings:", error);
        setLoading(false);
      }
    };
    
    fetchPGs();
  }, []);

  // Filter PGs based on search term and selected filters
  const filteredPGs = pgList.filter(pg => {
    // Filter by search term
    const matchesSearch = 
      (pg.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       pg.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       pg.address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      searchTerm === "";
    
    // Filter by location
    const matchesLocation = selectedLocations.length === 0 || 
                          (pg.location && selectedLocations.includes(pg.location));
    
    // Filter by nearby college
    const matchesCollege = selectedColleges.length === 0 || 
                          (pg.nearbyCollege && selectedColleges.includes(pg.nearbyCollege));
    
    // Filter by price - parse price safely
    const pgPrice = parseInt(pg.price) || 0;
    const matchesPrice = pgPrice <= currentPriceRange;
    
    // Filter by room type
    let matchesRoomType = true;
    
    if (roomCount === 1) {
      matchesRoomType = pg.roomType === 'Single';
    } else if (pg.roomType === 'Sharing') {
      // Improved sharing type check
      if (pg.sharingType) {
        // Convert to string to ensure safe operations
        const sharingTypeStr = String(pg.sharingType).trim();
        matchesRoomType = 
          sharingTypeStr === String(roomCount) || 
          sharingTypeStr.startsWith(`${roomCount} `) || 
          sharingTypeStr.includes(`(${roomCount})`) ||
          sharingTypeStr.includes(`(${roomCount} `);
      } else {
        matchesRoomType = false;
      }
    } else {
      matchesRoomType = false;
    }
    
    // Filter by amenities
    const matchesAmenities = Object.keys(amenityFilters).every(amenity => {
      // Only check amenities that are selected (true)
      if (!amenityFilters[amenity]) return true;
      
      // Safely check if amenities exists and contains the amenity
      return pg.amenities && 
             Array.isArray(pg.amenities) && 
             pg.amenities.includes(amenity);
    });
    
    return matchesSearch && matchesLocation && matchesCollege && 
           matchesPrice && matchesRoomType && matchesAmenities;
  });

  const toggleSelection = (value, setFunction, stateArray) => {
    if (stateArray.includes(value)) {
      setFunction(stateArray.filter((item) => item !== value));
    } else {
      setFunction([...stateArray, value]);
    }
  };

  const handleAmenityChange = (amenity) => {
    setAmenityFilters({
      ...amenityFilters,
      [amenity]: !amenityFilters[amenity]
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocations([]);
    setSelectedColleges([]);
    setCurrentPriceRange(priceRange.max);
    setRoomCount(1);
    // Reset all amenity filters to false
    const resetAmenities = {};
    Object.keys(amenityFilters).forEach(key => {
      resetAmenities[key] = false;
    });
    setAmenityFilters(resetAmenities);
  };

  return (
    <div className="pg-container">
      {/* Search Bar */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search PGs by name, location or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="pg-content">
        {/* Left Filter Section */}
        <aside className="filter-section">
          <h3>Filters</h3>
          <button 
            onClick={resetFilters}
            className="reset-filters-button"
          >
            Reset All Filters
          </button>

          {/* Live Map Placeholder */}
          <div className="map-placeholder">📍 Live Map Here</div>

          {/* Price Slider - now fixed from 0 to 40000 */}
          <div className="filter-group">
            <h4>Price Range: ₹{currentPriceRange}</h4>
            <input 
              type="range" 
              min={priceRange.min} 
              max={priceRange.max} 
              value={currentPriceRange}
              onChange={(e) => setCurrentPriceRange(parseInt(e.target.value))}
              className="price-slider" 
            />
            <div className="price-range-labels">
              <span>₹{priceRange.min}</span>
              <span>₹{priceRange.max}</span>
            </div>
          </div>

          {/* Amenities */}
          <div className="filter-group">
            <h4>Amenities</h4>
            {Object.entries(amenityFilters).map(([amenity, isChecked]) => (
              <label key={amenity} className="amenity-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAmenityChange(amenity)}
                />{" "}
                {amenity === "Mess/Food" ? "Meals Included" : amenity}
              </label>
            ))}
          </div>

          {/* Number of Rooms - Slider */}
          <div className="filter-group">
            <h4>Room Type: {roomCount === 1 ? 'Single' : `${roomCount} Sharing`}</h4>
            <input
              type="range"
              min="1"
              max="4"
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value))}
              className="room-slider"
            />
            <div className="room-type-labels">
              <span>Single</span>
              <span>4 Sharing</span>
            </div>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <h4>Location</h4>
            {locations.map((location) => (
              <label key={location} className="location-checkbox">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location)}
                  onChange={() => toggleSelection(location, setSelectedLocations, selectedLocations)}
                />{" "}
                {location}
              </label>
            ))}
          </div>

          {/* Nearby Colleges Filter */}
          <div className="filter-group">
            <h4>Nearby College</h4>
            {colleges.map((college) => (
              <label key={college} className="college-checkbox">
                <input
                  type="checkbox"
                  checked={selectedColleges.includes(college)}
                  onChange={() => toggleSelection(college, setSelectedColleges, selectedColleges)}
                />{" "}
                {college}
              </label>
            ))}
          </div>
        </aside>

        {/* Right PG Listings Section */}
        <section className="pg-listings">
          {loading ? (
            <div className="loading-spinner">Loading PG listings...</div>
          ) : filteredPGs.length > 0 ? (
            filteredPGs.map((pg) => (
              <PGCard key={pg.id} pg={pg} onClick={setSelectedPG} />
            ))
          ) : (
            <div className="no-results">
              <p>No PG listings match your search criteria.</p>
              <button onClick={resetFilters}>Reset Filters</button>
            </div>
          )}
        </section>

        {/* PG Details Modal */}
        {selectedPG && <PGDetailsModal pg={selectedPG} onClose={() => setSelectedPG(null)} />}
      </div>
    </div>
  );
};

export default PGs;