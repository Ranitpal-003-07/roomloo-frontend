import React, { useState, useEffect } from "react";
import "../styles/PGpage.css";
import PGCard from "../components/PGCard";
import PGDetailsModal from "../components/PGDetailsModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const PGs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [selectedPG, setSelectedPG] = useState(null);
  const [pgList, setPgList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: 1000, max: 25000 });
  const [currentPriceRange, setCurrentPriceRange] = useState(25000);
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
        console.log("Fetched PG Data:", pgData); // Debugging
        
        // Extract unique locations (case-sensitive)
        const uniqueLocations = [...new Set(pgData.map(pg => pg.location).filter(Boolean))];
        setLocations(uniqueLocations);
        
        // Extract unique colleges (case-sensitive)
        const uniqueColleges = [...new Set(pgData
          .map(pg => pg.nearbyCollege)
          .filter(college => college && college.trim() !== '')
        )];
        setColleges(uniqueColleges);
        
        // Determine min and max price
        if (pgData.length > 0) {
          const prices = pgData.map(pg => {
            const price = parseInt(pg.price, 10);
            return isNaN(price) ? 0 : price;
          });
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange({ min: minPrice, max: maxPrice });
          setCurrentPriceRange(maxPrice);
        }
        
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
    // Filter by search term (case-insensitive)
    const matchesSearch = 
      (pg.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pg.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pg.address?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      searchTerm === "";
    
    // Filter by location (case-insensitive)
    const matchesLocation = selectedLocations.length === 0 || 
      (pg.location && selectedLocations.some(loc => 
        loc.toLowerCase() === pg.location.toLowerCase()
      ));
    
    // Filter by college (case-insensitive)
    const matchesCollege = selectedColleges.length === 0 || 
      (pg.nearbyCollege && selectedColleges.some(college => 
        college.toLowerCase() === pg.nearbyCollege.toLowerCase()
      ));
    
    // Filter by price
    const pgPrice = parseInt(pg.price, 10) || 0;
    const matchesPrice = pgPrice <= currentPriceRange;
    
    // Filter by room type
    const getSharingCount = (sharingType) => {
      if (!sharingType) return 0;
      const match = sharingType.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    
    let matchesRoomType;
    if (roomCount === 1) {
      matchesRoomType = pg.roomType === 'Single';
    } else {
      if (pg.roomType === 'Sharing') {
        const sharingCount = getSharingCount(pg.sharingType);
        matchesRoomType = sharingCount === roomCount;
      } else {
        matchesRoomType = false;
      }
    }
    
    // Filter by amenities
    const hasAC = amenityFilters["AC"];
    const hasNonAC = amenityFilters["Non-AC"];
    let matchesAC = true;
    
    // Handle AC/Non-AC conflict
    if (hasAC && hasNonAC) {
      matchesAC = false;
    } else if (hasAC) {
      matchesAC = pg.amenities?.includes("AC");
    } else if (hasNonAC) {
      matchesAC = !pg.amenities?.includes("AC");
    }
    
    // Other amenities
    const otherAmenities = Object.keys(amenityFilters).filter(
      amenity => amenity !== "AC" && amenity !== "Non-AC"
    );
    const matchesOtherAmenities = otherAmenities.every(amenity => 
      !amenityFilters[amenity] || pg.amenities?.includes(amenity)
    );
    
    const matchesAmenities = matchesAC && matchesOtherAmenities;
    
    return (
      matchesSearch &&
      matchesLocation &&
      matchesCollege &&
      matchesPrice &&
      matchesRoomType &&
      matchesAmenities
    );
  });

  // Toggle selection for locations and colleges
  const toggleSelection = (value, setFunction, stateArray) => {
    const newArray = stateArray.includes(value)
      ? stateArray.filter(item => item !== value)
      : [...stateArray, value];
    setFunction(newArray);
  };

  const handleAmenityChange = (amenity) => {
    // Handle AC/Non-AC mutual exclusivity
    if (amenity === "AC" && amenityFilters["Non-AC"]) {
      setAmenityFilters(prev => ({ ...prev, "Non-AC": false, [amenity]: !prev[amenity] }));
    } else if (amenity === "Non-AC" && amenityFilters["AC"]) {
      setAmenityFilters(prev => ({ ...prev, "AC": false, [amenity]: !prev[amenity] }));
    } else {
      setAmenityFilters(prev => ({ ...prev, [amenity]: !prev[amenity] }));
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLocations([]);
    setSelectedColleges([]);
    setCurrentPriceRange(priceRange.max);
    setRoomCount(1);
    setAmenityFilters({
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

          {/* Price Slider */}
          <div className="filter-group">
            <h4>Price Range: ₹{currentPriceRange.toLocaleString()}</h4>
            <input 
              type="range" 
              min={priceRange.min} 
              max={priceRange.max} 
              value={currentPriceRange}
              onChange={(e) => setCurrentPriceRange(parseInt(e.target.value, 10))}
              className="price-slider" 
            />
            <div className="price-range-labels">
              <span>₹{priceRange.min.toLocaleString()}</span>
              <span>₹{priceRange.max.toLocaleString()}</span>
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
                  disabled={
                    (amenity === "AC" && isChecked && amenityFilters["Non-AC"]) ||
                    (amenity === "Non-AC" && isChecked && amenityFilters["AC"])
                  }
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
              onChange={(e) => setRoomCount(parseInt(e.target.value, 10))}
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