import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBox.css";

const ChatBox = ({ walletAddress }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fonction pour faire défiler automatiquement vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour envoyer un message à l'API Intuition Systems
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      console.log("Envoi de la requête à l'API avec l'adresse:", walletAddress);
      
      // Payload avec format explicite
      const payload = {
        text: input,
        walletAddress: walletAddress || "0x25d5C9DbC1E12163B973261A08739927E4F72BA8"
      };
      
      console.log("Payload:", payload);
      
      // Appel à l'API Intuition Systems
      const response = await axios.post(
        'https://chat.intuition.systems/api/completion',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'sec-ch-ua-platform': 'Windows',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'Origin': window.location.origin,
            'Referer': 'https://chat.intuition.systems/'
          }
        }
      );
      
      console.log("Réponse de l'API:", response.data);
      
      // Ajouter la réponse
      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.text || response.data,
        sender: "ai"
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Erreur détaillée lors de l'appel à l'API:", error);
      
      // Message d'erreur plus informatif
      const errorMessage = {
        id: Date.now() + 1,
        text: `Erreur: ${error.message || "Communication avec l'API impossible"}`,
        sender: "system"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // Toggle pour minimiser/maximiser
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // On ajoute un style directement dans le JSX pour s'assurer que les styles sont appliqués
  const boxStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    width: '320px',
    height: isMinimized ? '50px' : '400px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    zIndex: 9999,
    transition: 'height 0.3s ease'
  };

  const headerStyle = {
    padding: '10px 15px',
    backgroundColor: 'rgba(40, 40, 50, 0.9)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  };

  return (
    <div id="intuition-chat-container" style={boxStyle} className="intuition-chat-box">
      <div style={headerStyle} onClick={toggleMinimize}>
        <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: 600 }}>Intuition Chat</h3>
        <button 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'white', 
            fontSize: '20px', 
            cursor: 'pointer' 
          }}
        >
          {isMinimized ? '+' : '−'}
        </button>
      </div>
      
      {!isMinimized && (
        <>
          <div className="intuition-chat-messages" style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '15px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px' 
          }}>
            {messages.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '14px', 
                textAlign: 'center' 
              }}>
                <p>Commencez une conversation avec Intuition</p>
              </div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.id} 
                  style={{ 
                    maxWidth: '80%', 
                    padding: '10px 15px', 
                    borderRadius: '18px', 
                    marginBottom: '5px', 
                    wordBreak: 'break-word',
                    alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: message.sender === 'user' ? '#4A66E8' : 
                                    message.sender === 'ai' ? 'rgba(50, 50, 60, 0.9)' : 
                                    'rgba(255, 70, 70, 0.8)',
                    color: 'white',
                    borderBottomRightRadius: message.sender === 'user' ? '4px' : '18px',
                    borderBottomLeftRadius: message.sender === 'ai' ? '4px' : '18px'
                  }}
                >
                  {message.text}
                </div>
              ))
            )}
            
            {isLoading && (
              <div style={{ 
                maxWidth: '80%', 
                padding: '10px 15px', 
                borderRadius: '18px', 
                marginBottom: '5px',
                borderBottomLeftRadius: '4px',
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(50, 50, 60, 0.9)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'white',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'white',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    animationDelay: '0.2s'
                  }}></div>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: 'white',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    animationDelay: '0.4s'
                  }}></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form 
            style={{ 
              display: 'flex', 
              padding: '10px', 
              backgroundColor: 'rgba(40, 40, 50, 0.7)', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
            }} 
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Posez votre question..."
              disabled={isLoading}
              style={{ 
                flex: 1, 
                padding: '12px 15px', 
                borderRadius: '20px', 
                border: 'none', 
                backgroundColor: 'rgba(60, 60, 70, 0.7)', 
                color: 'white', 
                fontSize: '14px', 
                outline: 'none' 
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              style={{ 
                width: '36px', 
                height: '36px', 
                marginLeft: '8px', 
                borderRadius: '50%', 
                backgroundColor: isLoading || !input.trim() ? 'rgba(74, 102, 232, 0.5)' : '#4A66E8', 
                border: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', 
                color: 'white' 
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </>
      )}
      
      <style jsx="true">{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ChatBox;
