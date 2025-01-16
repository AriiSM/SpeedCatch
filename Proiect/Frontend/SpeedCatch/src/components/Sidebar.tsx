import React, { useState } from 'react';
import { IonCol, IonButton, IonIcon, IonInput, IonPopover, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner } from '@ionic/react';
import { logOutOutline, filterOutline, addOutline, searchOutline, swapHorizontalSharp, homeOutline, mailOutline } from 'ionicons/icons';
import '../theme/Button.css';
import Image from '../theme/image.png';
import useWebSocket from '../backend/useWebSocket';
import { useDisplayContext } from './DisplayContext';

interface SidebarProps {
  onLogout: () => void;
  onSearchToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, onSearchToggle }) => {
  const [showDragDrop, setShowDragDrop] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const [popoverEvent, setPopoverEvent] = useState<MouseEvent | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { sendMessage } = useWebSocket("ws://localhost:8000/ws");

  const handleNewDocumentClick = () => {
    setShowDragDrop((prev) => !prev);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;

    if (files.length > 0 && files[0].type === "text/plain") {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        const title = file.name;

        // Trimitere date către WebSocket
        setLoading(true);
        sendMessage({ type: "UPLOAD_FILE", payload: { title, content } });
      };

      reader.readAsText(file);
    } else {
      console.error('Only .txt files are supported');
    }

    setShowDragDrop(false);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFilter = (event: React.MouseEvent) => {
    setPopoverEvent(event.nativeEvent);
    setShowSearchPopover(true);
  };

  const handleSearchFilter = () => {
    console.log('Filter searching for:', searchText);
    // Trimitere cerere SEARCH_FILTER către WebSocket
    sendMessage({ type: "SEARCH_FILTER", payload: searchText });
    setShowSearchPopover(false);
  };

  const handleHomeClick = () => {
    window.location.reload();
  };

  const { showAntonymDoc, setShowAntonymDoc } = useDisplayContext();

  const handleShowAntonymDoc = () => {
    setShowAntonymDoc(!showAntonymDoc);
  };

  const handleShowDocumentsList = () => {
    setShowAntonymDoc(false);
  };

  return (
    <>
      <IonCol
        size="1"
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#DA932B',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div className="sidebar-header" style={{ textAlign: 'center', marginBottom: '0px' }}>
            <img src={Image} alt="Logo" className='logo' style={{ marginRight: '10px' }} />
          </div>
          <hr className="sidebar-divider" style={{ width: '90%',border: 0, height: '1px', backgroundColor: '#ccc', margin: '20px 0' }} />
          <IonButton style={{ width: '100%' }} onClick={handleHomeClick}>
            <IonIcon icon={homeOutline} />
          </IonButton>
          <IonButton style={{ width: '100%' }} onClick={onSearchToggle}>
            <IonIcon icon={searchOutline} />
          </IonButton>
          <IonButton style={{ width: '100%' }} onClick={handleShowAntonymDoc}>
            <IonIcon icon={swapHorizontalSharp} />
          </IonButton>   
          <IonButton style={{ width: '100%' }} onClick={handleNewDocumentClick}>
            <IonIcon icon={addOutline} />
          </IonButton>
          {showDragDrop && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '10px',
                color: '#ccc',
                textAlign: 'center',
              }}
            >
              Drop your .txt files here
            </div>
          )}
          <IonButton style={{ width: '100%' }} onClick={handleFilter}>
            <IonIcon icon={filterOutline} />
          </IonButton>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IonButton style={{ width: '100%' }}>
            <IonIcon icon={mailOutline} />
          </IonButton>
          <IonButton onClick={onLogout} style={{ width: '100%' }}>
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </div>
      </IonCol>

      <IonPopover
        isOpen={showSearchPopover}
        event={popoverEvent}
        onDidDismiss={() => setShowSearchPopover(false)}
        className="custom-popover"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Search by Filter</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px' }}>
            <IonInput
              value={searchText}
              placeholder="Enter filter criteria"
              onIonChange={(e) => setSearchText(e.detail.value!)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchFilter();
                }
              }}
              style={{ marginBottom: '10px', width: '100%' }}
            />
            <IonButton style={{ width: '100%' }} onClick={handleSearchFilter}>
              Search
            </IonButton>
          </div>
        </IonContent>
      </IonPopover>

      {loading && (
        <div className="loading-overlay">
          <IonSpinner />
        </div>
      )}
    </>
  );
};

export default Sidebar;