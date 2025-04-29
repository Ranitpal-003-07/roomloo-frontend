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
    <div className={`pgd-overlay ${pg ? 'pgd-active' : ''}`} onClick={onClose}>
      <div className="pgd-container" onClick={(e) => e.stopPropagation()}>
        <button className="pgd-close-btn" onClick={onClose}>
          <FiX />
        </button>

        <div className="pgd-content">
          {/* Image Gallery */}
          <div className="pgd-gallery">
            {pg.images && pg.images.length > 0 ? (
              <>
                <div className="pgd-main-image-wrapper">
                  <img
                    src={pg.images[currentImageIndex]}
                    alt={`${pg.title} - Image ${currentImageIndex + 1}`}
                    className="pgd-main-image"
                  />
                  
                  {pg.images.length > 1 && (
                    <>
                      <button className="pgd-nav pgd-prev" onClick={handlePrevImage}>
                        <FiChevronLeft />
                      </button>
                      <button className="pgd-nav pgd-next" onClick={handleNextImage}>
                        <FiChevronRight />
                      </button>
                      <div className="pgd-counter">
                        {currentImageIndex + 1} / {pg.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {pg.images.length > 1 && (
                  <div className="pgd-thumbnails">
                    {pg.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className={`pgd-thumb ${idx === currentImageIndex ? 'pgd-active' : ''}`}
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
              <div className="pgd-no-image">No images available</div>
            )}
          </div>

          {/* PG Details */}
          <div className="pgd-details">
            <div className="pgd-header">
              <h2 className="pgd-title">{pg.title}</h2>
              <div className="pgd-location">
                <FiMapPin className="pgd-icon" />
                <span>{pg.location} {pg.address ? `- ${pg.address}` : ''}</span>
              </div>
              {pg.googleMapLink && (
                <a 
                  href={pg.googleMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="pgd-map-link"
                >
                  View on Google Maps
                </a>
              )}
            </div>

            <div className="pgd-price-box">
              <div className="pgd-price">
                <span className="pgd-price-amount">{formatPrice(pg.price)}</span>
              </div>
              <div className="pgd-room-type">
                {pg.roomType === 'Sharing' && pg.sharingType 
                  ? pg.sharingType 
                  : pg.roomType || "Single Room"}
              </div>
            </div>

            {/* Description */}
            {pg.description && (
              <div className="pgd-section">
                <h3 className="pgd-section-title">Description</h3>
                <p className="pgd-description">{pg.description}</p>
              </div>  
            )}

            {/* Amenities */}
            <div className="pgd-section">
              <h3 className="pgd-section-title">Amenities</h3>
              <div className="pgd-amenities">
                {pg.amenities && pg.amenities.length > 0 ? (
                  pg.amenities.map((amenity, index) => (
                    <div key={index} className="pgd-amenity">
                      <span className="pgd-check">✓</span>
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="pgd-no-data">No amenities listed</p>
                )}
              </div>
            </div>

            {/* Nearby Places */}
            <div className="pgd-section">
              <h3 className="pgd-section-title">Nearby Places</h3>
              <div className="pgd-nearby">
                {pg.nearbyCollege && (
                  <div className="pgd-nearby-item">
                    <span className="pgd-nearby-label">College:</span>
                    <span className="pgd-nearby-value">{pg.nearbyCollege}</span>
                  </div>
                )}
                {pg.nearbyMetro && (
                  <div className="pgd-nearby-item">
                    <span className="pgd-nearby-label">Metro Station:</span>
                    <span className="pgd-nearby-value">{pg.nearbyMetro}</span>
                  </div>
                )}
                {pg.nearbyBusStand && (
                  <div className="pgd-nearby-item">
                    <span className="pgd-nearby-label">Bus Stand:</span>
                    <span className="pgd-nearby-value">{pg.nearbyBusStand}</span>
                  </div>
                )}
                {pg.nearbyLandmark && (
                  <div className="pgd-nearby-item">
                    <span className="pgd-nearby-label">Landmark:</span>
                    <span className="pgd-nearby-value">{pg.nearbyLandmark}</span>
                  </div>
                )}
                {!pg.nearbyCollege && !pg.nearbyMetro && !pg.nearbyBusStand && !pg.nearbyLandmark && (
                  <p className="pgd-no-data">No nearby places information available</p>
                )}
              </div>
            </div>

            {/* Rules */}
            {pg.rules && (
              <div className="pgd-section">
                <h3 className="pgd-section-title">House Rules</h3>
                <p className="pgd-rules">{pg.rules}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="pgd-section pgd-contact">
              <h3 className="pgd-section-title">Contact Information</h3>
              <div className="pgd-contact-buttons">
                {pg.ownerPhone && (
                  <a href={`tel:${pg.ownerPhone}`} className="pgd-contact-btn pgd-phone">
                    <FiPhone className="pgd-icon" /> Call Owner
                  </a>
                )}
                {pg.ownerEmail && (
                  <a href={`mailto:${pg.ownerEmail}`} className="pgd-contact-btn pgd-email">
                    <FiMail className="pgd-icon" /> Email Owner
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetailsModal;