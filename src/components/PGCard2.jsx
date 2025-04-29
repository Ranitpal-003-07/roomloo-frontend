/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import "../styles/PGCard2.css";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";

const PGCard2 = ({ listing, onEdit, onDelete }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
 
  const {
    id,
    description,
    location,
    address,
    amenities,
    images = [],
    price = "Contact for price",
    occupancy = "Available",
    status = "active"
  } = listing;
  
  useEffect(() => {
    const fetchFirstImage = async () => {
      setLoadingImage(true);
      try {
        const storage = getStorage();        
        // Reference to the pg_images/{id} folder
        const pgImagesRef = ref(storage, `pg_images/${id}`);        
        // List all items in the folder
        const result = await listAll(pgImagesRef);
        
        if (result.items.length > 0) {
          // Get the first image in the folder
          const firstImageRef = result.items[0];
          const url = await getDownloadURL(firstImageRef);
          setImageUrl(url);
        } else {
          // No images found in the folder
          setImageUrl(null);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setImageUrl(null);
      } finally {
        setLoadingImage(false);
      }
    };
    
    fetchFirstImage();
  }, [id]);
  
  return (
    <div className="pg2-card">
      <div className="pg2-card-image-container">
        <div
          className="pg2-card-image"
        >
          <img src={imageUrl} alt="pg-image" />
        </div>
        <div className={`pg2-card-status ${status}`}>{status}</div>
        <div className="pg2-card-occupancy">{occupancy}</div>
      </div>
     
      <div className="pg2-card-content">
        <h3 className="pg2-title">{description || "PG Accommodation"}</h3>
        <p className="pg2-location">{location} - {address || ""}</p>
        <div className="pg2-price">{price}</div>
       
        <div className="pg2-amenities">
          {amenities && amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
        </div>
       
        <div className="pg2-card-actions">
          <button className="pg2-action-btn view-btn" title="View Details">
            <FiEye />
          </button>
          <button
            className="pg2-action-btn edit-btn"
            title="Edit Listing"
            onClick={() => onEdit(id)}
          >
            <FiEdit2 />
          </button>
          <button
            className="pg2-action-btn delete-btn"
            title="Delete Listing"
            onClick={() => onDelete(id)}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PGCard2;