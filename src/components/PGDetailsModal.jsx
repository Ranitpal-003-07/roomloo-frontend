import React, { useState } from "react";
import "../styles/PGDetailsModal.css";
import { FiX, FiPhone, FiMail, FiMapPin, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PGDetailsModal = ({ pg, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!pg) return null;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? pg.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === pg.images.length - 1 ? 0 : prev + 1
    );
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return "Price not available";
    
    // If price is already formatted with ₹, return as is
    if (typeof price === 'string' && price.includes('₹')) return price;
    
    // Otherwise format it
    return `₹${Number(price).toLocaleString('en-IN')}/month`;
  };

  return (
    <div className={`modal-overlay ${pg ? 'active' : ''}`} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="modal-content">
          {/* Image Gallery */}
          <div className="pg-gallery">
            {pg.images && pg.images.length > 0 ? (
              <>
                <div className="main-image-container">
                  <img
                    src={pg.images[currentImageIndex]}
                    alt={`${pg.title} - Image ${currentImageIndex + 1}`}
                    className="main-image"
                  />
                  
                  {pg.images.length > 1 && (
                    <>
                      <button className="gallery-nav prev" onClick={handlePrevImage}>
                        <FiChevronLeft />
                      </button>
                      <button className="gallery-nav next" onClick={handleNextImage}>
                        <FiChevronRight />
                      </button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {pg.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {pg.images.length > 1 && (
                  <div className="thumbnail-gallery">
                    {pg.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image">No images available</div>
            )}
          </div>

          {/* PG Details */}
          <div className="pg-details-content">
            <div className="pg-header">
              <h2>{pg.title}</h2>
              <div className="pg-location-display">
                <FiMapPin />
                <span>{pg.location} {pg.address ? `- ${pg.address}` : ''}</span>
              </div>
              {pg.googleMapLink && (
                <a 
                  href={pg.googleMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  View on Google Maps
                </a>
              )}
            </div>

            <div className="pg-price-section">
              <div className="price-display">
                <span className="price-amount">{formatPrice(pg.price)}</span>
              </div>
              <div className="room-type-display">
                {pg.roomType === 'Sharing' && pg.sharingType 
                  ? pg.sharingType 
                  : pg.roomType || "Single Room"}
              </div>
            </div>

            {/* Description */}
            {pg.description && (
              <div className="pg-section">
                <h3>Description</h3>
                <p>{pg.description}</p>
              </div>  
            )}

            {/* Amenities */}
            <div className="pg-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {pg.amenities && pg.amenities.length > 0 ? (
                  pg.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-check">✓</span>
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p>No amenities listed</p>
                )}
              </div>
            </div>

            {/* Nearby Places */}
            <div className="pg-section">
              <h3>Nearby Places</h3>
              <div className="nearby-places">
                {pg.nearbyCollege && (
                  <div className="nearby-item">
                    <span className="nearby-label">College:</span>
                    <span>{pg.nearbyCollege}</span>
                  </div>
                )}
                {pg.nearbyMetro && (
                  <div className="nearby-item">
                    <span className="nearby-label">Metro Station:</span>
                    <span>{pg.nearbyMetro}</span>
                  </div>
                )}
                {pg.nearbyBusStand && (
                  <div className="nearby-item">
                    <span className="nearby-label">Bus Stand:</span>
                    <span>{pg.nearbyBusStand}</span>
                  </div>
                )}
                {pg.nearbyLandmark && (
                  <div className="nearby-item">
                    <span className="nearby-label">Landmark:</span>
                    <span>{pg.nearbyLandmark}</span>
                  </div>
                )}
                {!pg.nearbyCollege && !pg.nearbyMetro && !pg.nearbyBusStand && !pg.nearbyLandmark && (
                  <p>No nearby places information available</p>
                )}
              </div>
            </div>

            {/* Rules */}
            {pg.rules && (
              <div className="pg-section">
                <h3>House Rules</h3>
                <p>{pg.rules}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="pg-section contact-section">
              <h3>Contact Information</h3>
              {pg.ownerPhone && (
                <a href={`tel:${pg.ownerPhone}`} className="contact-button phone">
                  <FiPhone /> Call Owner
                </a>
              )}
              {pg.ownerEmail && (
                <a href={`mailto:${pg.ownerEmail}`} className="contact-button email">
                  <FiMail /> Email Owner
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetailsModal;