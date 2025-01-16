import React from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
} from '@ionic/react';
import { logoGoogle, logoTwitter, logoFacebook, logoGithub } from 'ionicons/icons';
import '../theme/Login.css'; // Importul fișierului CSS
import searchIllustration from '../theme/search-illustration.png'; // Imaginea ilustrativă
import { useHistory } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const history = useHistory();
  const handleLoginClick = () => {
    onLogin();
    history.push('/notebook');
  };

  return (
    <IonPage>
      <IonContent className="login-page">
        <IonGrid className="center-container">
          <IonRow className="login-box">
            <IonCol className="left-side">
              <img
                src={searchIllustration}
                alt="Search Illustration"
                className="login-gif"
              />
            </IonCol>
            <IonCol className="right-side">
              <div className="login-container">
                <h2 className="login-title">Welcome to SpeedCatch</h2>
                <IonInput placeholder="Username" className="login-input" style={{ '--highlight-color-focused': '#28a745'}}/>
                <IonInput
                  type="password"
                  placeholder="Password"
                  className="login-input"
                  style={{ '--highlight-color-focused': '#28a745'}}
                />
                <IonButton expand="block" className="login-button" onClick={handleLoginClick}>
                  Log In
                </IonButton>
                <IonButton expand="block" className="signup-button">
                  Sign Up
                </IonButton>
                <IonText className="forgot-password">Forgot Password?</IonText>
                <div className="social-icons">
                  <IonIcon icon={logoGoogle} className="social-icon" />
                  <IonIcon icon={logoTwitter} className="social-icon" />
                  <IonIcon icon={logoFacebook} className="social-icon" />
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
