import React, { useState, useEffect } from "react";
import { FiX, FiChevronRight, FiChevronLeft, FiCheck } from 'react-icons/fi';
import "../styles/PostModal2.css";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import axios from "axios"; 

const PostModal = ({ isOpen, onClose, onSave, editingListing, userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    googleMapLink: '',
    address: '',
    location: '',
    roomType: 'Single',
    sharingType: '',
    amenities: [],
    nearbyMetro: '',
    nearbyBusStand: '',
    nearbyLandmark: '',
    nearbyCollege: '',
    price: '',
    ownerPhone: '',
    ownerEmail: '',
    description: '',
    rules: '',
    images: [],
    imageFiles: []
  });
  
  useEffect(() => {
    if (editingListing) {
      setFormData({
        ...editingListing,
        description: editingListing.description || '',
        rules: editingListing.rules || '',
        imageFiles: []
      });
    }
  }, [editingListing]);

  const allAmenities = [
    'AC', 'Non-AC', '24/7 Power Backup', 'WiFi', 'Parking', 'Mess/Food',
    'Elevator', 'TV', 'Gym', 'Laundry', 'Security', 'Cleaning Service',
    'Refrigerator', 'Washing Machine', 'Swimming Pool'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmenityChange = (amenity) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter(a => a !== amenity)
      : [...formData.amenities, amenity];
    
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImageFiles = [...formData.imageFiles, ...files];
      const newImageURLs = files.map(file => URL.createObjectURL(file));
      const updatedImages = [...formData.images, ...newImageURLs];
      
      setFormData({ 
        ...formData, 
        images: updatedImages,
        imageFiles: newImageFiles
      });
    }
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    const updatedImageFiles = [...formData.imageFiles];
    
    updatedImages.splice(index, 1);
    updatedImageFiles.splice(index, 1);
    
    setFormData({
      ...formData,
      images: updatedImages,
      imageFiles: updatedImageFiles
    });
  };

  const uploadImages = async (pgId) => {
    if (formData.imageFiles.length === 0) return [];
    
    const imageUrls = [];
    
    for (const file of formData.imageFiles) {
      // Create a reference with PG ID folder
      const storageRef = ref(storage, `pg_images/${pgId}/${Date.now()}_${file.name}`);
      
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
    
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // 1. Upload images and get URLs
      const imageUrls = await uploadImages();
  
      // 2. Prepare data for Firestore
      const pgData = {
        ...formData,
        images: editingListing ? [...editingListing.images || [], ...imageUrls] : imageUrls,
        createdAt: editingListing ? editingListing.createdAt : new Date(),
        updatedAt: new Date(),
        ownerId: editingListing ? editingListing.ownerId : userId,
      };
  
      // Remove temporary data
      delete pgData.imageFiles;
  
      // 3. Save to Firestore
      if (editingListing && editingListing.id) {
        await updateDoc(doc(db, "pgListings", editingListing.id), pgData);
      } else {
        await addDoc(collection(db, "pgListings"), pgData);
      }
  
      // 4. Send the data to Laravel backend
      await axios.post('http://127.0.0.1:8000/api/pgs', {
        ...pgData,
        createdAt: pgData.createdAt.toISOString(), // Convert Date object to string if needed
        updatedAt: pgData.updatedAt.toISOString(),
      });
  
      // 5. Call onSave callback
      onSave(pgData);
      setLoading(false);
  
    } catch (error) {
      console.error("Error saving PG listing:", error);
      setLoading(false);
      // Show error to user if needed
    }
  };
  

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);
  // Render the current step form
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="title">PG Name*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter PG name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="address">Full Address*</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                rows="3"
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="location">Location/Area*</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="E.g., Koramangala, Indiranagar"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="googleMapLink">Google Maps Link</label>
              <input
                type="url"
                id="googleMapLink"
                name="googleMapLink"
                value={formData.googleMapLink}
                onChange={handleChange}
                placeholder="Paste Google Maps link"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h3>Room Details</h3>
            <div className="form-group">
              <label htmlFor="roomType">Room Type*</label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
              >
                <option value="Single">Single</option>
                <option value="Sharing">Sharing</option>
              </select>
            </div>
            
            {formData.roomType === 'Sharing' && (
              <div className="form-group">
                <label htmlFor="sharingType">Sharing Type*</label>
                <select
                  id="sharingType"
                  name="sharingType"
                  value={formData.sharingType}
                  onChange={handleChange}
                  required={formData.roomType === 'Sharing'}
                >
                  <option value="">Select sharing type</option>
                  <option value="Double Sharing">Double Sharing (2 Person)</option>
                  <option value="Triple Sharing">Triple Sharing (3 Person)</option>
                  <option value="Quad Sharing">Quad Sharing (4 Person)</option>
                  <option value="Multiple Sharing">Multiple Sharing (5+ Person)</option>
                </select>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="price">Monthly Rent (₹)*</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="E.g., 10000"
                required
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h3>Amenities</h3>
            <p className="form-help">Select all amenities that apply to your PG</p>
            <div className="amenities-grid">
              {allAmenities.map((amenity) => (
                <div className="amenity-checkbox" key={amenity}>
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  <label htmlFor={`amenity-${amenity}`}>{amenity}</label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="form-step">
            <h3>Nearby Locations</h3>
            <div className="form-group">
              <label htmlFor="nearbyMetro">Nearby Metro Station</label>
              <input
                type="text"
                id="nearbyMetro"
                name="nearbyMetro"
                value={formData.nearbyMetro}
                onChange={handleChange}
                placeholder="Enter nearby metro station name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nearbyBusStand">Nearby Bus Stand</label>
              <input
                type="text"
                id="nearbyBusStand"
                name="nearbyBusStand"
                value={formData.nearbyBusStand}
                onChange={handleChange}
                placeholder="Enter nearby bus stand name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nearbyLandmark">Nearby Landmark</label>
              <input
                type="text"
                id="nearbyLandmark"
                name="nearbyLandmark"
                value={formData.nearbyLandmark}
                onChange={handleChange}
                placeholder="Enter nearby landmark"
              />
            </div>
            <div className="form-group">
              <label htmlFor="nearbyCollege">Nearby College/University</label>
              <input
                type="text"
                id="nearbyCollege"
                name="nearbyCollege"
                value={formData.nearbyCollege}
                onChange={handleChange}
                placeholder="Enter nearby college/university name"
              />
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="form-step">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label htmlFor="ownerPhone">Phone Number*</label>
              <input
                type="tel"
                id="ownerPhone"
                name="ownerPhone"
                value={formData.ownerPhone}
                onChange={handleChange}
                placeholder="Enter contact phone number"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ownerEmail">Email Address</label>
              <input
                type="email"
                id="ownerEmail"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                placeholder="Enter contact email address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your PG accommodation"
                rows="4"
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="rules">House Rules</label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                placeholder="List any house rules or restrictions"
                rows="4"
              ></textarea>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="form-step">
            <h3>Upload Images</h3>
            <div className="form-group">
              <label htmlFor="image-upload">PG Images</label>
              <div className="image-upload-container">
                <div className="upload-placeholder">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    multiple
                  />
                  <label htmlFor="image-upload" className="file-input-label">
                    Click to upload images
                  </label>
                </div>
              </div>
              <p className="upload-help">Upload clear images of your PG (exterior and interior)</p>
            </div>
            
            {formData.images.length > 0 && (
              <div className="image-preview-grid">
                {formData.images.map((image, index) => (
                  <div key={index} className="preview-image-container">
                    <img 
                      src={image} 
                      alt={`PG Preview ${index + 1}`} 
                      className="preview-image" 
                    />
                    <button 
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 7:
        return (
          <div className="form-step">
            <h3>Review & Submit</h3>
            <div className="review-section">
              <h4>Basic Information</h4>
              <div className="review-item">
                <span className="review-label">PG Name:</span>
                <span className="review-value">{formData.title}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Location:</span>
                <span className="review-value">{formData.location}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Address:</span>
                <span className="review-value">{formData.address}</span>
              </div>
            </div>
            
            <div className="review-section">
              <h4>Room Details</h4>
              <div className="review-item">
                <span className="review-label">Room Type:</span>
                <span className="review-value">{formData.roomType}</span>
              </div>
              {formData.roomType === 'Sharing' && (
                <div className="review-item">
                  <span className="review-label">Sharing Type:</span>
                  <span className="review-value">{formData.sharingType}</span>
                </div>
              )}
              <div className="review-item">
                <span className="review-label">Monthly Rent:</span>
                <span className="review-value">₹{formData.price}</span>
              </div>
            </div>
            
            <div className="review-section">
              <h4>Amenities</h4>
              <div className="review-amenities">
                {formData.amenities.length > 0 ? (
                  formData.amenities.map((amenity, index) => (
                    <span key={index} className="review-amenity">{amenity}</span>
                  ))
                ) : (
                  <span className="review-empty">No amenities selected</span>
                )}
              </div>
            </div>
            
            <div className="review-section">
              <h4>Contact Information</h4>
              <div className="review-item">
                <span className="review-label">Phone:</span>
                <span className="review-value">{formData.ownerPhone}</span>
              </div>
              {formData.ownerEmail && (
                <div className="review-item">
                  <span className="review-label">Email:</span>
                  <span className="review-value">{formData.ownerEmail}</span>
                </div>
              )}
            </div>
            
            {formData.images.length > 0 && (
              <div className="review-section">
                <h4>Images ({formData.images.length})</h4>
                <div className="review-image-grid">
                  {formData.images.slice(0, 3).map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`PG Preview ${index + 1}`} 
                      className="review-image" 
                    />
                  ))}
                  {formData.images.length > 3 && (
                    <div className="more-images">+{formData.images.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };

  // Modal title based on whether we're editing or adding
  const modalTitle = editingListing ? "Edit PG Listing" : "Add New PG Listing";

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal-container">
        <div className="modal-header">
          <h2>{modalTitle}</h2>
          <button className="close-modal-btn" onClick={onClose} type="button">
            <FiX />
          </button>
        </div>
        
        <div className="modal-progress">
          <div className="progress-steps">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div 
                key={step} 
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                {currentStep > step ? <FiCheck /> : step}
              </div>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {renderStepContent()}
          </div>
          
          <div className="modal-footer">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="prev-btn" 
                onClick={prevStep}
              >
                <FiChevronLeft /> Back
              </button>
            )}
            
            {currentStep < 7 ? (
              <button 
                type="button" 
                className="next-btn" 
                onClick={nextStep}
              >
                Next <FiChevronRight />
              </button>
            ) : (
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingListing ? 'Save Changes' : 'Create Listing')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;