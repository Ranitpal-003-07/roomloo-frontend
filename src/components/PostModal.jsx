/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../styles/PostModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faTimes, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { storage, db } from "../firebase"; // Removed unused auth import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import axios from "axios"; // Import axios for HTTP requests

const PostModal = ({ onClose, onSave }) => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { user } = useAuth();

  // Handle object URL cleanup
  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (description.trim() || image) {
      setIsUploading(true);
      try {
        let imageUrl = null;
        if (image) {
          const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
          await uploadBytes(imageRef, image);
          imageUrl = await getDownloadURL(imageRef);
        }
  
        const userId = user?.uid || "unknown";
        const userName = user?.fullName || "Anonymous";
  
        const postData = {
          user: userName,
          userId: userId,
          content: description,
          image: imageUrl || null,
          likes: 0,
          comments: [],
          shares: 0,
          timestamp: new Date().toISOString(),
        };
  
        // Save to Firestore
        await addDoc(collection(db, "posts"), {
          ...postData,
          timestamp: serverTimestamp(), // Firestore timestamp
        });
  
        // Send to Laravel backend
        await sendPostToLaravel(postData);
  
        onClose();
      } catch (error) {
        console.error("Error creating post:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };
  

  const sendPostToLaravel = async (postData) => {
    try {
      await axios.post("http://localhost:8000/api/posts", postData);
      console.log("Post data sent to Laravel successfully");
    } catch (error) {
      console.error("Error sending post to Laravel:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="post-modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <h2>Create a Post</h2>

        <textarea
          placeholder="What's on your mind? Share with your roommates..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div 
          className={`image-preview ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {image ? (
            <img src={URL.createObjectURL(image)} alt="Preview" className="preview-image" />
          ) : (
            <p>Drag and drop an image or click "Add Image"</p>
          )}
        </div>

        <label className="upload-btn12">
          <FontAwesomeIcon icon={faImage} /> Add Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </label>

        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={isUploading || (!description.trim() && !image)}
        >
          {isUploading ? "Uploading..." : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px' }} /> 
              Post Update
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PostModal;