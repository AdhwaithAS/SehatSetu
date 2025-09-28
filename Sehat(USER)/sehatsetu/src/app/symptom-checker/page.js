'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from './symptoms.module.css';

const questions = [
  { key: 'symptoms', text: '🩺 What symptoms are you experiencing?' },
  { key: 'duration', text: '⏱️ How long have you had these symptoms?' },
  { key: 'fever_body_aches', text: '🌡️ Do you have a fever or body aches?' },
  { key: 'travel_history', text: '🧳 Have you traveled recently?' },
  { key: 'age', text: '🎂 What is your age?' },
  { key: 'gender', text: '👤 What is your gender? (male/female/other)' }
];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: questions[0].text }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [showFollowup, setShowFollowup] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const clearChat = () => {
    setMessages([{ sender: 'bot', text: questions[0].text }]);
    setStep(0);
    setAnswers({});
    setShowResults(false);
    setAiResponse(null);
    setShowFollowup(false);
    setInput('');
    setImage(null);
  };

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !image) return;

    const userMessage = { sender: 'user', text: input.trim() };
    
    // Handle follow-up responses
    if (showFollowup) {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setImage(null);
      
      const response = input.toLowerCase().trim();
      if (response.includes('close') || response.includes('no') || response.includes('done') || response.includes('finish')) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Thank you for using our symptom checker! Redirecting to dashboard...' }
        ]);
        setTimeout(() => {
          redirectToDashboard();
        }, 2000);
      } else if (response.includes('new') || response.includes('restart') || response.includes('clear')) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'Starting a new consultation...' }
        ]);
        setTimeout(() => {
          clearChat();
        }, 1000);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: 'I understand you have more questions. However, for additional medical concerns, please consult with a healthcare professional directly.' }
        ]);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: 'Would you like to start a new consultation or close this session?' }
          ]);
        }, 1000);
      }
      return;
    }

    const currentQuestion = questions[step];
    const updatedAnswers = { ...answers };

    if (input.trim()) {
      updatedAnswers[currentQuestion.key] = input.trim();
    }

    if (image) {
      userMessage.image = URL.createObjectURL(image);
      updatedAnswers["uploadedImage"] = "yes";
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setImage(null);

    if (step === questions.length - 1) {
      setLoading(true);
      setAnswers(updatedAnswers);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: '🔍 Submitting your responses...' }
      ]);

      try {
        // Format data according to the required structure
        const requestData = {
          symptoms: updatedAnswers.symptoms || '',
          age: parseInt(updatedAnswers.age) || 0,
          gender: updatedAnswers.gender || ''
        };

        const res = await fetch('http://localhost:3001/api/symptom-check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });

        const data = await res.json();
        
        // Parse the AI response
        if (data.result) {
          const aiResult = JSON.parse(data.result);
          setAiResponse(aiResult);
          setShowResults(true);
          
          // Display the results in chat
          const resultMessage = `🔍 **Diagnosis Results:**\n\n` +
            `**Primary Condition:** ${aiResult.disease}\n\n` +
            `**Possible Conditions:**\n${aiResult.possible_conditions.map(condition => 
              `• ${condition.name} (${condition.confidence_percent}% confidence)`
            ).join('\n')}\n\n` +
            `**Treatment Recommendations:**\n${aiResult.treatment.map(treatment => 
              `• ${treatment}`
            ).join('\n')}\n\n` +
            `**Red Flags to Watch:**\n${aiResult.red_flags.map(flag => 
              `⚠️ ${flag}`
            ).join('\n')}\n\n` +
            `**Disclaimer:** ${aiResult.disclaimer}`;

          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: resultMessage }
          ]);
          
          // Ask follow-up question
          setTimeout(() => {
            setShowFollowup(true);
            setMessages(prev => [
              ...prev,
              { sender: 'bot', text: 'Is there anything else you\'d like to ask about your symptoms or would you like to close this consultation?' }
            ]);
          }, 1000);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: '❌ Unexpected response format from API. Please try again later.' }
          ]);
        }
      } catch (error) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: '❌ Error submitting to API. Please try again later.' }
        ]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
      setAnswers(updatedAnswers);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: questions[step + 1].text }
      ]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  return (
    <>
      <Head>
        <title>Telemedicine Chatbot</title>
      </Head>

      <div className={styles.pageWrapper}>
        <header className={styles.chatHeader}>🩺 Symptom Checker</header>

        <main className={styles.chatBox} ref={chatBoxRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'bot' ? styles.botMessage : styles.userMessage}>
              {msg.text && (
                <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br>') }} />
              )}
              {msg.image && <img src={msg.image} alt="uploaded" className={styles.chatImage} />}
            </div>
          ))}
        </main>

        {image && (
          <div className={styles.previewBox}>
            <img src={URL.createObjectURL(image)} alt="preview" />
            <button onClick={() => setImage(null)}>✖</button>
          </div>
        )}

        {showFollowup && (
          <div className={styles.actionButtons}>
            <button className={styles.actionBtn} onClick={clearChat}>
              🔄 New Consultation
            </button>
            <button className={styles.actionBtn} onClick={redirectToDashboard}>
              🏠 Go to Dashboard
            </button>
          </div>
        )}

        <form className={styles.chatInput} onSubmit={handleSend}>
          <label className={styles.uploadBtn}>
            🖼️
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
          </label>
          <input
            type="text"
            placeholder={loading ? 'Submitting...' : showFollowup ? 'Ask anything else or type "close"...' : 'Type your answer...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || (!input && !image)}>➤</button>
        </form>
      </div>
    </>
  );
}
