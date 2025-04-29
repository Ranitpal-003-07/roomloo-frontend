import React, { useState } from "react";
import "../styles/RoommateCard.css";
import RoommateDetailsModal from "./RoommateDetailsModal";

const RoommateCard = ({ roommate }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="roommate-card" onClick={handleClick}>
        <img src={roommate.image} alt={roommate.name} className="roommate-img" />
        <div className="roommate-info-container">
          <div className="roommate-info">
            <h3>{roommate.name}, {roommate.age}</h3>
            <p><strong>College:</strong> {roommate.college}</p>
            <p><strong>Gender:</strong> {roommate.gender}</p>
          </div>
          <div className="match-badge">
            <div className="match-circle">{roommate.matchPercentage}%</div>
          </div>
        </div>
      </div>

      {showModal && (
        <RoommateDetailsModal roommate={roommate} onClose={handleClose} />
      )}
    </>
  );
};

export default RoommateCard;