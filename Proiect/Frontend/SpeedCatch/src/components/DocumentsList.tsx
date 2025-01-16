import React, { useState, useEffect, useRef } from 'react';
import { NoteProps } from '../backend/utils';
import { DocModal } from './DocModal';
import useWebSocket from '../backend/useWebSocket';

interface DocumentsListProps {
  documents: NoteProps[];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ documents }) => {
  const [selected, setSelected] = useState<NoteProps | null>(null);
  const [hoveredDocId, setHoveredDocId] = useState<string | null>(null);
  const { sendMessage, content } = useWebSocket('ws://localhost:8000/ws');
  const requestedContent = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (selected && !requestedContent.current[selected.title]) {
      sendMessage({ type: 'GET_CONTENT', payload: selected.title });
      requestedContent.current[selected.title] = true;
    }
  }, [selected, sendMessage]);

  const handleDocumentClick = (doc: NoteProps) => {
    setSelected(doc);
    if (!requestedContent.current[doc.title]) {
      sendMessage({ type: 'GET_CONTENT', payload: doc.title });
      requestedContent.current[doc.title] = true;
    }
  };

  const closeModal = () => {
    setSelected(null);
  };

  return (
    <div style={{ marginTop: '20px', marginLeft: '8%', backgroundColor: '#f5f5f5', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      {documents.map((doc) => (
        <div
          role="button"
          key={doc.id}
          onClick={() => handleDocumentClick(doc)}
          onMouseEnter={() => setHoveredDocId(doc.id.toString())}
          onMouseLeave={() => setHoveredDocId(null)}
          style={{
            display: 'flex',
            padding: '16px',
            backgroundColor: hoveredDocId === doc.id.toString() ? '#e7e7e7' : '#fff',
            borderRadius: '8px',
            cursor: 'pointer',
            borderBottom: '1px solid #ccc',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            justifyContent: 'space-between',
            marginBottom: '4px',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div>{doc.title ? doc.title.split('.')[0] : 'Untitled'}</div>
          <div>{doc.title && doc.title.includes('.') ? doc.title.split('.')[1] : ''}</div>
        </div>
      ))}
      {selected && (
        <DocModal
          isOpen={!!selected}
          onClose={closeModal}
          document={selected}
          content={content}
        />
      )}
    </div>
  );
};

export default DocumentsList;