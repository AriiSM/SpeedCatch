import React from 'react';
import { IonTextarea, IonButton, IonIcon } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';

interface SearchAreaProps {
  searchText: string;
  setSearchText: (value: string) => void;
  onSearch: () => void;
}

const SearchArea: React.FC<SearchAreaProps> = ({ searchText, setSearchText, onSearch }) => {
  return (
    <div className='search-container' style={{ position: 'relative', marginTop: '20px', backgroundColor: '#fff', marginLeft: '8.00%',borderRadius: '20px' }}>
      <IonTextarea
        rows={4}
        value={searchText}
        onIonChange={(e) => setSearchText(e.detail.value!)}
        placeholder="    Type your search query here"
        style={{ '--highlight-color-focused': '#28a745', color: "black", paddingRight: '50px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #ccc' }}
      />
      <IonButton
        className='send'
        onClick={onSearch}
        style={{ position: 'absolute', bottom: '10px', right: '0px', zIndex: 10, cursor: 'pointer'}}
      >
        <IonIcon icon={arrowForwardOutline} />
      </IonButton>
    </div>
  );
};

export default SearchArea;
