import React, { useEffect, useState } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { NoteProps } from '../backend/utils';

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: NoteProps;
  content: string;
}

export const DocModal: React.FC<DocModalProps> = ({ isOpen, onClose, document, content }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      backdropDismiss={true}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fundal semi-transparent întunecat
      }}
    >
      {/* Container principal pentru stilizare */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundal alb ușor transparent
        borderRadius: '10px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        width: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        animation: 'fadeIn 0.4s ease-in-out', // Efect ușor de apariție
      }}>


        {/* Titlu */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '16px',
          borderBottom: '2px solid #ff9800',
          paddingBottom: '8px',
          letterSpacing: '0.5px',
        }}>
          {document.title.split('.')[0]}
        </h2>

        {/* Conținut */}
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          color: '#444',
          fontWeight: '400',
        }}>
          {content}
        </div>
      </div>
    </IonModal>
  );
};
