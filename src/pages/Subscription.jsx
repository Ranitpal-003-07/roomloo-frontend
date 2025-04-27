/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { FiCheck, FiX, FiCreditCard } from "react-icons/fi";
import "../styles/Subscription.css";

const Subscription = () => {
  const { user } = useAuth();
  const currentUser = user;
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    isSubscribed: false,
    plan: null,
    expiryDate: null
  });
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: 4,
      duration: 1, // months
      features: [
        "Post up to 2 PG listings",
        "Basic listing visibility",
        "Email support",
        "30 days validity"
      ],
      notIncluded: [
        "Featured listings",
        "Priority customer support",
        "Advanced analytics"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: 999,
      duration: 3, // months
      features: [
        "Post up to 5 PG listings",
        "Enhanced listing visibility",
        "Featured listings",
        "Priority email support",
        "Basic analytics dashboard",
        "90 days validity"
      ],
      notIncluded: [
        "Phone support",
        "Advanced analytics"
      ]
    },
    {
      id: "unlimited",
      name: "Unlimited",
      price: 1999,
      duration: 12, // months
      features: [
        "Unlimited PG listings",
        "Maximum listing visibility",
        "Featured listings",
        "Priority phone & email support",
        "Advanced analytics dashboard",
        "365 days validity"
      ],
      notIncluded: []
    }
  ];

  // Fetch current subscription
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const subscription = userData.subscription || {};

          const isActive = subscription.status === "active";
          const expiryDate = subscription.expiryDate
            ? new Date(subscription.expiryDate.seconds * 1000)
            : null;
          const isExpired = expiryDate ? expiryDate < new Date() : true;

          setSubscriptionData({
            isSubscribed: isActive && !isExpired,
            plan: subscription.plan,
            expiryDate: expiryDate
          });
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser]);

  // Handle subscription statically
  const handleStaticSubscription = async (plan) => {
    setProcessing(true);
    try {
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + plan.duration);

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        subscription: {
          status: "active",
          plan: plan.id,
          startDate: serverTimestamp(),
          expiryDate: Timestamp.fromDate(expiryDate)
        }
      });

      setSubscriptionData({
        isSubscribed: true,
        plan: plan.id,
        expiryDate: expiryDate
      });

      alert(`You have successfully subscribed to the ${plan.name} plan! 🎉`);
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const renderCurrentSubscription = () => {
    if (!subscriptionData.isSubscribed) return null;

    return (
      <div className="current-subscription">
        <h3>Your Current Plan</h3>
        <p><strong>Plan:</strong> {subscriptionData.plan}</p>
        <p><strong>Expires on:</strong> {subscriptionData.expiryDate?.toLocaleDateString()}</p>
      </div>
    );
  };

  const renderPlans = () => {
    return (
      <div className="subscription-plans">
        <h2>{subscriptionData.isSubscribed ? "Upgrade or Renew Your Plan" : "Choose a Subscription Plan"}</h2>
        <div className="plans-container">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? "selected" : ""} ${
                subscriptionData.plan === plan.id ? "current-plan" : ""
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {subscriptionData.plan === plan.id && (
                <div className="current-plan-badge">Current Plan</div>
              )}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">₹</span>
                  <span className="amount">{plan.price}</span>
                  <span className="duration">/{plan.duration} month{plan.duration > 1 ? "s" : ""}</span>
                </div>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-included">
                    <FiCheck className="feature-icon included" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, index) => (
                  <li key={index} className="feature-not-included">
                    <FiX className="feature-icon not-included" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="select-plan-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStaticSubscription(plan);
                }}
                disabled={processing && selectedPlan === plan.id}
              >
                <FiCreditCard />
                {processing && selectedPlan === plan.id ? "Processing..." : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="subscription-container loading">
        <div className="loading-spinner"></div>
        <p>Loading subscription information...</p>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <div className="subscription-header">
        <h1>Subscription Plans</h1>
        <p>Choose the perfect plan for your PG listing needs</p>
      </div>

      {renderCurrentSubscription()}
      {renderPlans()}

      <div className="subscription-footer">
        <div className="payment-security">
          <FiCreditCard className="security-icon" />
          <div>
            <h4>Simple Activation</h4>
            <p>No payment required for now. Plans are activated instantly!</p>
          </div>
        </div>

        <div className="subscription-faq">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-items">
            <div className="faq-item">
              <h4>How do I cancel my subscription?</h4>
              <p>You can cancel your subscription anytime from your account settings. Your benefits will continue until the end of your billing period.</p>
            </div>
            <div className="faq-item">
              <h4>Will my subscription auto-renew?</h4>
              <p>No, subscriptions don't auto-renew. You'll need to manually renew your subscription before it expires.</p>
            </div>
            <div className="faq-item">
              <h4>Can I upgrade my plan?</h4>
              <p>Yes, you can upgrade your plan at any time. Your new subscription will start after your current plan expires.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
