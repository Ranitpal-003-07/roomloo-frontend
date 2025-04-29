import React from 'react';
import '../styles/PGCard.css';

const PGCard = ({ pg, onClick }) => {
  // Format price with rupee symbol
  const formatPrice = (price) => {
    if (!price) return "Price not available";
   
    // If price is already formatted with ₹, return as is
    if (typeof price === 'string' && price.includes('₹')) return price;
   
    // Otherwise format it
    return `₹${parseFloat(price).toLocaleString('en-IN')}/month`;
  };

  // Get first image or placeholder
  const cardImage = pg.images && pg.images.length > 0
    ? pg.images[0]
    : "https://via.placeholder.com/400x300?text=No+Image+Available";

  // Generate amenity icons
  const getAmenityIcons = (amenities) => {
    if (!amenities || !Array.isArray(amenities) || amenities.length === 0)
      return null;
   
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
   
    return amenities.slice(0, 4).map(amenity => (
      <span key={amenity} className="pg1-amenity-icon" title={amenity}>
        {amenityIcons[amenity] || '✓'}
      </span>
    ));
  };

  // Room type display
  const roomTypeDisplay = pg.roomType === 'Sharing' && pg.sharingType
    ? pg.sharingType
    : pg.roomType || "Single";

  return (
    <div className="pg1-card" onClick={() => onClick(pg)}>
      <div className="pg1-image-container">
        <img src={cardImage} alt={pg.title || "PG"} className="pg1-image" />
        <div className="pg1-badge">{roomTypeDisplay}</div>
      </div>
      <div className="pg1-info">
        <h3 className="pg1-title">{pg.title || "Unnamed PG"}</h3>
        <p className="pg1-location">
          <span className="pg1-location-icon">📍</span>
          {pg.location || "Location not specified"}
        </p>
        <div className="pg1-amenities">
          {getAmenityIcons(pg.amenities)}
          {pg.amenities && pg.amenities.length > 4 &&
            <span className="pg1-more-amenities">+{pg.amenities.length - 4}</span>
          }
        </div>
        <div className="pg1-footer">
          <p className="pg1-price">{formatPrice(pg.price)}</p>
          <button className="pg1-view-details-button">Details</button>
        </div>
      </div>
    </div>
  );
};

export default PGCard;