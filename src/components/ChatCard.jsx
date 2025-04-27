/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import '../styles/ChatCard.css';
import { getAuth } from "firebase/auth";


const ChatCard = ({ chat, currentUser, onSelectChat, selectedChatId }) => {
  const [otherUserInfo, setOtherUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [messageLimitReached, setMessageLimitReached] = useState(false);

  const isSelected = selectedChatId === chat.id;

  if (!currentUser) return null;

  useEffect(() => {
    const fetchOtherUserInfo = async () => {
      try {
        const otherUserId = chat.participants.find(uid => uid !== currentUser.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          setOtherUserInfo(userDoc.exists() ? userDoc.data() : { displayName: 'Unknown User' });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setOtherUserInfo({ displayName: 'Error loading user' });
        setLoading(false);
      }
    };

    fetchOtherUserInfo();
  }, [chat, currentUser]);

  const getAllMessages = () => {
    return (chat.msg || []).sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return timeA - timeB;
    });
  };

  const messages = getAllMessages();

  useEffect(() => {
    // Count how many messages this user has sent
    const count = messages.filter(msg => msg.sender === currentUser.uid).length;
    setUserMessageCount(count);
    setMessageLimitReached(count >= 15);
  }, [messages, currentUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || messageLimitReached) return;

    try {
      const messageObj = {
        text: newMessage,
        sender: currentUser.uid,
        timestamp: new Date(),
      };

      // Update the message in Firebase Firestore
      await updateDoc(doc(db, 'chats', chat.id), {
        msg: arrayUnion(messageObj),
        lastUpdated: serverTimestamp(),
      });

      // Send the message data to Laravel backend
      await sendMessageToLaravel(messageObj);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  const sendMessageToLaravel = async (messageObj) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
  
      if (!currentUser) {
        console.error("No user is currently logged in.");
        return;
      }
  
      const token = await currentUser.getIdToken();  // Get the Firebase ID token
  
      const response = await axios.post('http://localhost:8000/api/chats', {
        participants: chat.participants,
        msg: [{
          sender: messageObj.sender,
          text: messageObj.text,
          timestamp: messageObj.timestamp,
        }],
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Message sent to Laravel:", response.data);
    } catch (error) {
      console.error("Error sending message to Laravel:", error);
    }
  };
  
  const getLastMessage = () => {
    return messages.length > 0 ? messages[messages.length - 1] : null;
  };

  const lastMessage = getLastMessage();

  if (!isSelected) {
    return (
      <div className="chat-card" onClick={() => onSelectChat && onSelectChat(chat.id)}>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="chat-avatar">
              {otherUserInfo?.profileImageUrl ? (
                <img src={otherUserInfo.profileImageUrl} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {otherUserInfo?.fullName?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="chat-info">
              <div className="chat-name">{otherUserInfo?.fullName || 'Unknown User'}</div>
              <div className="chat-preview">
                {lastMessage && (
                  <p className="last-message">
                    {lastMessage.sender === currentUser.uid ? 'You: ' : ''}
                    {lastMessage.text?.length > 25
                      ? `${lastMessage.text.substring(0, 25)}...`
                      : lastMessage.text}
                  </p>
                )}
              </div>
              <div className="chat-time">
                {chat.lastUpdated && (
                  <span className="time-stamp">
                    {new Date(chat.lastUpdated.toDate()).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="chat-expanded">
      <div className="chat-header">
        <div className="chat-avatar">
          {otherUserInfo?.profileImageUrl ? (
            <img src={otherUserInfo.profileImageUrl} alt="Profile" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              {otherUserInfo?.fullName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="chat-name">
          {otherUserInfo?.fullName || 'Unknown User'}
        </div>
        <button className="back-button" onClick={() => onSelectChat(null)}>Back</button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sender === currentUser.uid ? 'sent' : 'received'}`}
            >
              <div className="message-bubble">{message.text}</div>
              <div className="message-time">
                {message.timestamp
                  ? new Date(
                      message.timestamp.toDate?.() || message.timestamp
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Sending...'}
              </div>
            </div>
          ))
        )}
        {messageLimitReached && (
        <div className="limit-warning">Message limit reached (15 messages).</div>
      )}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          disabled={messageLimitReached}
        />
        <button type="submit" className="send-button" disabled={messageLimitReached}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatCard;
