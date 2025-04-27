/* eslint-disable no-unused-vars */
import React from "react";
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import "../styles/PGCard2.css";

const PGCard2 = ({ listing, onEdit, onDelete }) => {
  const { id, title, location, price, amenities, occupancy, image, status } = listing;

  return (
    <div className="pg-card">
      <div className="pg-card-image-container">
        <div 
          className="pg-card-image" 
          style={{ backgroundImage: `url(${image || '/images/placeholder.jpg'})` }}
        ></div>
        <div className={`pg-card-status ${status}`}>{status}</div>
        <div className="pg-card-occupancy">{occupancy}</div>
      </div>
      
      <div className="pg-card-content">
        <h3 className="pg-title">{title}</h3>
        <p className="pg-location">{location}</p>
        <div className="pg-price">{price}</div>
        
        <div className="pg-amenities">
          {amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
        </div>
        
        <div className="pg-card-actions">
          <button className="pg-action-btn view-btn" title="View Details">
            <FiEye />
          </button>
          <button 
            className="pg-action-btn edit-btn" 
            title="Edit Listing"
            onClick={onEdit}
          >
            <FiEdit2 />
          </button>
          <button 
            className="pg-action-btn delete-btn" 
            title="Delete Listing"
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PGCard2;