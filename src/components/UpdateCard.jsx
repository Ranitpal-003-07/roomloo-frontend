/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faCommentDots, faShareAlt } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faRegularHeart } from "@fortawesome/free-regular-svg-icons";
import { storage, db } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/UpdateCard.css";

const UpdateCard = ({ update }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(update?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(update?.comments?.length || 0);
  const [shares, setShares] = useState(update?.shares || 0);
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState(update?.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [userPic, setUserPic] = useState("");

  useEffect(() => {
    const fetchUserPic = async () => {
      try {
        if (!update?.userId) return;
        
        const userRef = doc(db, "users", update.userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.profileImageUrl) {
            const imageUrl = userData.profileImageUrl;
            setUserPic(imageUrl);
          } else if (userData.photoURL) {
            setUserPic(userData.photoURL);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserPic();
  }, [update?.userId]);

  const handleLike = async () => {
    try {
      const newLikeState = !liked;
      setLiked(newLikeState);
      const updatedLikes = newLikeState ? likes + 1 : likes - 1;
      setLikes(updatedLikes);

      if (update?.id) {
        const postRef = doc(db, "posts", update.id);
        await updateDoc(postRef, { likes: updatedLikes });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      setLiked(!liked); // Revert state on error
    }
  };

  const handleComment = async () => {
    try {
      if (newComment.trim() && update?.id) {
        const updatedCommentList = [...commentList, newComment];
        const updatedCount = updatedCommentList.length;
        
        setCommentList(updatedCommentList);
        setCommentsCount(updatedCount);
        setNewComment("");

        const postRef = doc(db, "posts", update.id);
        await updateDoc(postRef, {
          comments: updatedCommentList,
          commentsCount: updatedCount,
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (update?.id) {
        const updatedShares = shares + 1;
        setShares(updatedShares);
        const postRef = doc(db, "posts", update.id);
        await updateDoc(postRef, { shares: updatedShares });
      }
    } catch (error) {
      console.error("Error updating shares:", error);
    }
  };

  return (
    <div className="update-card">
      <div className="update-header">
        <img 
          src={userPic || "/assets/usr1.jpg"} 
          alt="User" 
          className="user-avatar" 
        />
        <h3 className="username">{update?.user || "Unknown User"}</h3>
      </div>
      <p className="update-content">{update?.content}</p>
      {update?.image && <img src={update.image} alt="update" className="update-image" />}

      <div className="actions">
        <button className={`like-btn ${liked ? "liked" : ""}`} onClick={handleLike}>
          <FontAwesomeIcon 
            icon={liked ? faHeart : faRegularHeart} 
            className="icon" 
            color={liked ? "red" : "white"} 
          />
          {likes}
        </button>

        <button className="comment-btn" onClick={() => setShowComments(!showComments)}>
          <FontAwesomeIcon icon={faCommentDots} className="icon" color="#00bfff" /> 
          {commentsCount}
        </button>

        <button className="share-btn" onClick={() => setShowShareOptions(!showShareOptions)}>
          <FontAwesomeIcon icon={faShareAlt} className="icon" color="#2ecc71" /> 
          {shares}
        </button>
      </div>

      {showComments && (
        <div className="comment-section">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleComment}>Post</button>
          {commentList.map((cmt, index) => (
            <p key={index} className="comment">{cmt}</p>
          ))}
        </div>
      )}

      {showShareOptions && (
        <div className="share-options">
          <button onClick={handleShare}>📲 WhatsApp</button>
          <button onClick={handleShare}>📘 Facebook</button>
          <button onClick={handleShare}>🐦 Twitter</button>
          <button onClick={() => setShowShareOptions(false)}>❌ Cancel</button>
        </div>
      )}
    </div>
  );
};

export default UpdateCard;