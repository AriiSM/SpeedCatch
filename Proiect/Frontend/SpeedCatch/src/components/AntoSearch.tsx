import { IonButton, IonIcon, IonTextarea, IonText } from "@ionic/react";
import { arrowForwardOutline } from "ionicons/icons";

interface AntoSearchProps {
  searchText: string;
  setSearchText: (value: string) => void;
  onSearch: () => void;

}

const AntoSearch: React.FC<AntoSearchProps> = ({ searchText, setSearchText, onSearch}) => {
  return (
    <div className='search-container' style={{ position: 'relative', marginTop: '20px', backgroundColor: '#fff', marginLeft: '8.00%',borderRadius: '20px' }}>
      <IonTextarea
        rows={4}
        value={searchText}
        onIonChange={(e) => setSearchText(e.detail.value!)}
        placeholder="    Type your prompt here"
        style={{ '--highlight-color-focused': '#ff9800', color: "black", paddingRight: '50px', backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #ccc' }}
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

export default AntoSearch;