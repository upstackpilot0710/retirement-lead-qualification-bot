import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  age_range?: string;
  retirement_status?: string;
  retirement_assets?: string;
  tax_awareness?: string;
  future_tax_expectation?: string;
  income_strategy?: string;
  strategy_interest?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [isQualified, setIsQualified] = useState<boolean | undefined>();
  const [showCalendarWidget, setShowCalendarWidget] = useState(false);
  const [showTaxVisual, setShowTaxVisual] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    const initChat = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/conversation/start`);
        setSessionId(response.data.sessionId);
        setMessages([
          {
            role: 'assistant',
            content: response.data.response,
          },
        ]);
      } catch (error) {
        console.error('Failed to start conversation:', error);
      }
    };

    initChat();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim() || !sessionId || loading) {
      return;
    }

    const userMessage = userInput.trim();
    setUserInput('');
    setLoading(true);

    try {
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

      const response = await axios.post(`${API_BASE_URL}/conversation/message`, {
        message: userMessage,
        sessionId,
        includeAudio: false,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response },
      ]);

      setUserData(response.data.userData);
      setIsQualified(response.data.isQualified);

      // Handle special actions
      if (response.data.nextAction === 'SHOW_CALENDAR') {
        setShowCalendarWidget(true);
      } else if (response.data.nextAction === 'SHOW_VISUAL') {
        setShowTaxVisual(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookCall = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE_URL}/calendar/book/${sessionId}`);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Great! Your call has been scheduled. You should receive a calendar invitation shortly. John looks forward to speaking with you!',
        },
      ]);
      setShowCalendarWidget(false);

      // Capture lead data
      await axios.post(`${API_BASE_URL}/leads/${sessionId}/capture`);
    } catch (error) {
      console.error('Failed to book call:', error);
    }
  };

  const handleQuickReply = (reply: string) => {
    setUserInput(reply);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Nash Cash Flow</h1>
          <p>Retirement Tax Strategy Assistant</p>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">
                {message.role === 'assistant' ? (
                  <>
                    <div className="avatar assistant">AI</div>
                    <p>{message.content}</p>
                  </>
                ) : (
                  <>
                    <p>{message.content}</p>
                    <div className="avatar user">You</div>
                  </>
                )}
              </div>
            </div>
          ))}

          {showCalendarWidget && (
            <div className="calendar-widget">
              <h3>Schedule Your Strategy Call</h3>
              <p>John is ready to discuss your retirement strategy.</p>
              <button onClick={handleBookCall} className="btn-primary">
                Open Calendar
              </button>
            </div>
          )}

          {showTaxVisual && (
            <div className="tax-visual-widget">
              <h3>Your Tax Avalanche Impact</h3>
              <div className="chart-placeholder">
                [Tax Avalanche Visualization Chart]
                <p>Required Distributions + Social Security + Medicare Surcharges</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="input-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="send-btn"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          <div className="quick-replies">
            {['Yes', 'No', 'Maybe', 'Not sure'].map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleQuickReply(reply)}
                className="quick-reply-btn"
              >
                {reply}
              </button>
            ))}
          </div>
        </form>
      </main>

      {isQualified !== undefined && (
        <footer className="status-bar">
          <span>
            Status: {isQualified ? '✓ Qualified' : '○ Reviewing'}
          </span>
        </footer>
      )}
    </div>
  );
}

export default App;
