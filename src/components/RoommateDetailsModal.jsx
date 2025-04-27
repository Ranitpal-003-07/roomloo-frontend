/* eslint-disable no-unused-vars */
import React, { useEffect,useState } from "react";
import { 
  FaHeart, FaUtensils, FaHome, FaUser, FaSchool, 
  FaMapMarkerAlt, FaInfo, FaUserFriends, FaGuitar, 
  FaCommentDots, FaPaperPlane 
} from "react-icons/fa";
import "../styles/RoommateModal.css";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { db } from "../firebase"; 


const RoommateDetailsModal = ({ roommate, onClose }) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const safeGet = (value) => (value ? value : "N/A");

 
  
  // Inside the component
  const { user: currentUser } = useAuth();
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;
  
    try {
      const senderUid = currentUser.uid;
      const recipientUid = roommate.id;
  
      if (!senderUid || !recipientUid) {
        toast.error("Missing user information");
        return;
      }
  
      const sortedUids = [senderUid, recipientUid].sort();
      const chatId = `${sortedUids[0]}_${sortedUids[1]}`;
      const chatRef = doc(db, "chats", chatId);
  
      const chatDocSnap = await getDoc(chatRef);
  
      const newMessage = {
        sender: senderUid,
        text: message.trim(),
        timestamp: new Date(), // Optional: for sorting
      };
  
      if (!chatDocSnap.exists()) {
        // Create new chat document
        await setDoc(chatRef, {
          participants: sortedUids,
          msg: [newMessage],
          lastUpdated: new Date()
        });
      } else {
        // Add message to existing chat
        await updateDoc(chatRef, {
          msg: [newMessage, ...chatDocSnap.data().msg],
          lastUpdated: new Date()
        });
      }
  
      setMessage("");
      setIsMessageOpen(false);
      toast.success("Message sent!");
    } catch (error) {
      console.error("Message send error:", error);
      toast.error("Failed to send message");
    }
  };
  
  
  // Close modal when clicking outside
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  useEffect(() => {
    document.body.style.overflow = "hidden"; // Prevent background scrolling when modal is open
    return () => {
      document.body.style.overflow = "auto"; // Re-enable scrolling when modal is closed
    };
  }, []);
  
  return (
    <div className="rm-modal-overlay" onClick={handleOverlayClick}>
      <div className="rm-modal-content">
        {/* Add message icon in header */}
        <button 
          className="rm-message-icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsMessageOpen(!isMessageOpen);
          }}
        >
          <FaCommentDots />
        </button>

        {/* Message composition section */}
        {isMessageOpen && (
          <div className="rm-message-section" onClick={(e) => e.stopPropagation()}>
            <h4>Message {roommate.name?.split(" ")[0] || "them"}</h4>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows="3"
              />
              <button type="submit" className="rm-send-button">
                <FaPaperPlane /> Send
              </button>
            </form>
          </div>
        )}
        {/* Header with profile image and basic info */}
        <div className="rm-profile-header">
          <div className="rm-profile-image-container">
            <img
              src={safeGet(roommate.image)}
              alt={roommate.name}
              className="rm-profile-img"
            />
          </div>
          
          <div className="rm-profile-title-info">
            <h1 className="rm-profile-name">{roommate.name}</h1>
            <div className="rm-profile-badges">
              <span className="rm-badge badge-age">{roommate.age} years</span>
              <span className="rm-badge badge-gender">{safeGet(roommate.gender)}</span>
            </div>
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="rm-profile-grid">
          {/* Education & Location */}
          <div className="rm-grid-item rm-education-location">
            <div className="rm-card-header">
              <FaSchool className="rm-section-icon" />
              <h3>Education</h3>
            </div>
            <p><strong>College:</strong> {safeGet(roommate.college)}</p>
            <div className="rm-card-header rm-location-header">
              <FaMapMarkerAlt className="rm-section-icon" />
              <h3>Location</h3>
            </div>
            <p><strong>Address:</strong> {safeGet(roommate.address)}</p>
            <p><strong>Current Hostel:</strong> {safeGet(roommate.currentHostel)}</p>
          </div>
          
          {/* About Me */}
          <div className="rm-grid-item rm-about-me">
            <div className="rm-card-header">
              <FaUser className="rm-section-icon" />
              <h3>About Me</h3>
            </div>
            <p>{safeGet(roommate.about)}</p>
          </div>
          
          {/* Roommate Preferences */}
          <div className="rm-grid-item rm-roommate-preferences">
            <div className="rm-card-header">
              <FaUserFriends className="rm-section-icon" />
              <h3>Roommate Preferences</h3>
            </div>
            <p>{safeGet(roommate.preference)}</p>
          </div>
          
          {/* Hobbies & Interests */}
          <div className="rm-grid-item rm-hobbies-interests">
            <div className="rm-card-header">
              <FaGuitar className="rm-section-icon" />
              <h3>Hobbies & Interests</h3>
            </div>
            <div className="rm-tags-container">
              {roommate.hobbies && roommate.hobbies.map((hobby, index) => (
                <span key={`hobby-${index}`} className="rm-tag rm-tag-hobby">{hobby}</span>
              ))}
              {roommate.interests && roommate.interests.map((interest, index) => (
                <span key={`interest-${index}`} className="rm-tag rm-tag-interest">{interest}</span>
              ))}
            </div>
          </div>
          
          {/* Way to Heart */}
          <div className="rm-grid-item rm-way-to-heart">
            <div className="rm-card-header">
              <FaHeart className="rm-section-icon" />
              <h3>Way to My Heart</h3>
            </div>
            <p>{safeGet(roommate.wayToHeart)}</p>
          </div>
          
          {/* Foods I Love */}
          <div className="rm-grid-item rm-foods-love">
            <div className="rm-card-header">
              <FaUtensils className="rm-section-icon" />
              <h3>Foods I Love</h3>
            </div>
            <div className="rm-foods-container">
              {roommate.foodsLove && roommate.foodsLove.map((food, index) => (
                <span key={`food-${index}`} className="rm-food-item">{food}</span>
              ))}
            </div>
          </div>
          
          {/* Contact */}
          <div className="rm-grid-item rm-contact-info">
            <div className="rm-card-header">
              <FaInfo className="rm-section-icon" />
              <h3>Contact</h3>
            </div>
            <p><strong>Email:</strong> {safeGet(roommate.email)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoommateDetailsModal;