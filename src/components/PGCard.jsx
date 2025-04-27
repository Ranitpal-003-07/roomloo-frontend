import React from 'react';
import '../styles/PGCard.css';

const PGCard = ({ pg, onClick }) => {
  // Format price with rupee symbol
  const formatPrice = (price) => {
    if (!price) return "Price not available";
    
    // If price is already formatted with ₹, return as is
    if (typeof price === 'string' && price.includes('₹')) return price;
    
    // Otherwise format it
    return `₹${price.toLocaleString('en-IN')}/month`;
  };

  // Get first image or placeholder
  const cardImage = pg.images && pg.images.length > 0
    ? pg.images[0]
    : "https://via.placeholder.com/400x300?text=No+Image+Available";

  // Generate amenity icons
  const getAmenityIcons = (amenities) => {
    if (!amenities || !Array.isArray(amenities)) return "";
    
    const amenityIcons = {
      "WiFi": "📶",
      "AC": "❄️",
      "Non-AC": "🌡️",
      "TV": "📺",
      "Laundry": "👕",
      "Parking": "🅿️",
      "Mess/Food": "🍽️",
      "Gym": "💪",
      "Power Backup": "🔋",
      "24/7 Water": "💧",
      "Security": "🔒",
      "Cleaning Service": "🧹",
      "Refrigerator": "❄️",
      "Washing Machine": "🧺",
      "Swimming Pool": "🏊",
      "Elevator": "🛗"
    };
    
    return amenities.slice(0, 4).map(amenity => 
      <span key={amenity} className="amenity-icon" title={amenity}>
        {amenityIcons[amenity] || '✓'} 
      </span>
    );
  };

  // Room type display
  const roomTypeDisplay = pg.roomType === 'Sharing' && pg.sharingType 
    ? pg.sharingType 
    : pg.roomType || "Single";

  return (
    <div className="pg-card" onClick={() => onClick(pg)}>
      <div className="pg-image">
        <img src={cardImage} alt={pg.title || "PG"} />
      </div>
      <div className="pg-info">
        <h3>{pg.title || "Unnamed PG"}</h3>
        <p className="pg-location">{pg.location || "Location not specified"}</p>
        <p className="pg-price">{formatPrice(pg.price)}</p>
        <div className="pg-details">
          <span className="room-type">{roomTypeDisplay}</span>
          <div className="amenities-preview">
            {getAmenityIcons(pg.amenities)}
            {pg.amenities && pg.amenities.length > 4 && 
              <span className="more-amenities">+{pg.amenities.length - 4}</span>
            }
          </div>
        </div>
      </div>
      <div className="view-details-button">View Details</div>
    </div>
  );
};

export default PGCard;