/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faTimes } from '@fortawesome/free-solid-svg-icons';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import ChatCard from '../components/ChatCard.jsx';
import '../styles/chat.css';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Fetch all chats where currentUser is a participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        chatData.push({
          id: doc.id,
          ...data,
          otherParticipants: data.participants.filter(id => id !== currentUser.uid)
        });
      });

      // Sort chats by lastUpdated (most recent first)
      chatData.sort((a, b) => b.lastUpdated?.toDate() - a.lastUpdated?.toDate());

      setChatList(chatData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Close chat when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Don't render chat component if not logged in
  if (!currentUser) return null;

  return (
    <div className={`chat-container ${isOpen ? 'open' : ''}`} ref={chatRef}>
      <div className="chat-body">
      <div className="chat-sidebar">
          <h2>Your Chats</h2>

          {/* Disclaimer message */}
          <div className="chat-disclaimer">
            ⚠️ You can send a maximum of <strong>15 messages</strong> per chat. Use your messages wisely!
          </div>

          {loading ? (
            <p>Loading chats...</p>
          ) : chatList.length === 0 ? (
            <p>No chats found</p>
          ) : (
            chatList.map(chat => (
              <ChatCard
                key={chat.id}
                chat={chat}
                currentUser={currentUser}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
              />
            ))
          )}
        </div>

      </div>

      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        <FontAwesomeIcon icon={isOpen ? faTimes : faCommentDots} />
      </button>
    </div>
  );
};

export default Chat;