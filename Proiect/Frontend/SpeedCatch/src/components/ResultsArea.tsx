import React from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { personOutline } from 'ionicons/icons';

interface ResultsAreaProps {
  searchedText: string | null;
  loading: boolean ;
  searchResponse: string | null;
  topDocumentTitle: string | null;
  antonymResult : string | null;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ searchedText, loading, searchResponse, topDocumentTitle, antonymResult  }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', margin: '10px 0', borderRadius: '8px', marginLeft: '8.00%' }}>
      {searchedText && (
        <div style={{ display: 'flex', justifyContent: 'end', textAlign: 'right', backgroundColor: '#f3eacf', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}>
          {searchedText}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: '10px' }}>
        {loading && <div className="loading-dots" style={{ float: 'left', margin: '10px', fontSize: '20px', color: '#5d4037' }}>...</div>}
      
        {!loading && antonymResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
             <IonIcon icon={personOutline} style={{ fontSize: '40px', color: '#28a745' }} />
            <IonText style={{ color: '#333' }}>
              <strong>Antonym Result:</strong> {antonymResult}
            </IonText>
          </div>
        )}

         
        {!loading && topDocumentTitle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}> {/* Stilizare pentru aliniere */}
            <IonIcon icon={personOutline} style={{ fontSize: '40px', color: '#28a745' }} />
            <IonText style={{ color: '#5d4037' }}>Top Document: {topDocumentTitle}</IonText>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResultsArea;