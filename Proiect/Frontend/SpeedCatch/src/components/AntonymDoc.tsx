import React, { useState } from 'react';
import  useWebSocket  from '../backend/useWebSocket';

interface AntoDocProps {
  initialTitle: string;
  initialContent: string;
}

export const AntonymDoc: React.FC<AntoDocProps> = ({ initialTitle, initialContent }) => {
  const { sendMessage } = useWebSocket("ws://localhost:8000/ws");

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [fileLoaded, setFileLoaded] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
        setTitle(file.name); // Set the title to the file name
        setFileLoaded(true); // Mark file as loaded
        
      // Trimiterea fișierului către server
      sendMessage({
        type: 'UPLOAD_FILE_ANTONIM',
        payload: {
          title: file.name,
          content: text,
        },
      });
    };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const containerStyle: React.CSSProperties = fileLoaded
    ? {
        marginTop: '20px',
        marginLeft: '8%',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundal alb ușor transparent
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        animation: 'fadeIn 0.4s ease-in-out', // Efect ușor de apariție
      }
    : {
        marginTop: '100px',
        marginLeft: '27%',
        backgroundColor: '#f5f5f5',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '50%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        animation: 'fadeIn 0.4s ease-in-out', // Efect ușor de apariție
      };

  const dropAreaStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: '#888',
    width: '100%', // Ajustează lățimea
    margin: 'auto', // Centrează pe orizontală
    padding: '20px',
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={containerStyle}
    >
      {fileLoaded ? (
        <>
          {/* Titlu */}
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              borderBottom: '2px solid #ff9800',
              paddingBottom: '8px',
              letterSpacing: '0.5px',
            }}
          >
            {title.split('.')[0]}
          </h2>

          {/* Conținut */}
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#444',
              fontWeight: '400',
            }}
          >
            {content}
          </div>
        </>
      ) : (
      
          <div style={dropAreaStyle}>
            <h2>drag and drop a .txt file here</h2>
            <p>or click to select a file from your computer</p>
          </div>
      )}
    </div>
  );
};