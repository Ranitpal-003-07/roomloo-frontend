import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiCreditCard } from 'react-icons/fi';
import PGCard2 from "../components/PGCard2";
import PostModal2 from "../components/PostModal2";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const currentUser = user;
  const [userListings, setUserListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    plan: null,
    expiryDate: null,
    loading: true
  });

  // Fetch user's subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!currentUser || !currentUser.uid) {
        setSubscriptionStatus({
          isSubscribed: false,
          plan: null,
          expiryDate: null,
          loading: false
        });
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const subscriptionData = userData.subscription || {};
          
          // Check if subscription is active
          const isActive = subscriptionData.status === 'active';
          const expiryDate = subscriptionData.expiryDate ? new Date(subscriptionData.expiryDate.seconds * 1000) : null;
          const isExpired = expiryDate ? expiryDate < new Date() : true;
          
          setSubscriptionStatus({
            isSubscribed: isActive && !isExpired,
            plan: subscriptionData.plan,
            expiryDate: expiryDate,
            loading: false
          });
        } else {
          setSubscriptionStatus({
            isSubscribed: false,
            plan: null,
            expiryDate: null,
            loading: false
          });
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser]);

  // Fetch user's PG listings from Firebase
  useEffect(() => {
    const fetchUserListings = async () => {
      setIsLoading(true);
      try {
        if (currentUser && currentUser.uid) {
          const listingsRef = collection(db, "pgListings");
          const q = query(listingsRef, where("ownerId", "==", currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          const listings = [];
          querySnapshot.forEach((doc) => {
            listings.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setUserListings(listings);
        } else {
          setUserListings([]);
        }
      } catch (error) {
        console.error("Error fetching listings from Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserListings();
  }, [currentUser]);

  // Navigate to subscription page
  const handleNavigateToSubscription = () => {
    // Navigate to subscription page
    window.location.href = "/subscription"; // Replace with your routing logic
  };

  // Handler for opening the add/edit PG modal
  const handleOpenPostModal = (listing = null) => {
    // Check if user is subscribed before allowing to add new listing
    if (!listing && !subscriptionStatus.isSubscribed) {
      // Show subscription required message or redirect to subscription page
      handleNavigateToSubscription();
      return;
    }

    if (listing) {
      setEditingListing(listing);
    } else {
      setEditingListing(null);
    }
    setShowPostModal(true);
  };

  // Handler for closing the modal
  const handleClosePostModal = () => {
    setShowPostModal(false);
    setEditingListing(null);
  };

  // Handler for saving a new or edited PG listing
  const handleSaveListing = (listingData) => {
    if (editingListing) {
      // Update existing listing in UI after Firebase update is done in modal
      const updatedListings = userListings.map(listing => 
        listing.id === editingListing.id ? { ...listing, ...listingData } : listing
      );
      setUserListings(updatedListings);
    } else {
      // Add new listing UI update after Firebase create is done in modal
      if (listingData.id) {
        setUserListings([...userListings, listingData]);
      }
    }
    handleClosePostModal();
  };

  // Handler for deleting a PG listing
  const handleDeleteListing = async (listingId) => {
    try {
      // Delete from Firebase
      await deleteDoc(doc(db, "pgListings", listingId));
      
      // Update UI
      setUserListings(userListings.filter(listing => listing.id !== listingId));
    } catch (error) {
      console.error("Error deleting listing:", error);
      // Handle error (show notification, etc.)
    }
  };

  // Render subscription status banner
  const renderSubscriptionBanner = () => {
    if (subscriptionStatus.loading) return null;

    if (subscriptionStatus.isSubscribed) {
      return (
        <div className="subscription-banner subscription-active">
          <p>
            <span className="subscription-plan">{subscriptionStatus.plan}</span> subscription active
            {subscriptionStatus.expiryDate && (
              <span className="expiry-date"> until {subscriptionStatus.expiryDate.toLocaleDateString()}</span>
            )}
          </p>
        </div>
      );
    } else {
      return (
        <div className="subscription-banner subscription-inactive">
          <p>You need an active subscription to post PG listings</p>
          <button 
            className="subscribe-btn" 
            onClick={handleNavigateToSubscription}
          >
            <FiCreditCard /> Subscribe Now
          </button>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container">
      {renderSubscriptionBanner()}
      
      <div className="dashboard-header">
        <h1>Your PG Listings</h1>
        <button 
          className={`add-pg-btn ${!subscriptionStatus.isSubscribed ? 'disabled' : ''}`}
          onClick={() => handleOpenPostModal()}
          disabled={!subscriptionStatus.isSubscribed && subscriptionStatus.loading === false}
        >
          <FiPlus /> Add New PG
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading your listings...</p>
        </div>
      ) : userListings.length > 0 ? (
        <div className="pg-listings-grid">
          {userListings.map(listing => (
            <PGCard2 
              key={listing.id}
              listing={listing}
              onEdit={() => handleOpenPostModal(listing)}
              onDelete={() => handleDeleteListing(listing.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No PG Listings Yet</h3>
            <p>
              {subscriptionStatus.isSubscribed 
                ? "Add your first PG listing to get started."
                : "Subscribe to our service to start posting PG listings."}
            </p>
            {subscriptionStatus.isSubscribed ? (
              <button 
                className="add-first-pg-btn" 
                onClick={() => handleOpenPostModal()}
              >
                <FiPlus /> Add PG Listing
              </button>
            ) : (
              <button 
                className="subscribe-first-btn" 
                onClick={handleNavigateToSubscription}
              >
                <FiCreditCard /> Subscribe Now
              </button>
            )}
          </div>
        </div>
      )}

      {showPostModal && (
        <PostModal2
          isOpen={showPostModal}
          onClose={handleClosePostModal}
          onSave={handleSaveListing}
          editingListing={editingListing}
          userId={currentUser?.uid}
        />
      )}
    </div>
  );
};

export default Dashboard;