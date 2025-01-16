import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Notebook from './pages/Notebook';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import { DisplayProvider } from './components/DisplayContext';


setupIonicReact();

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, []);


  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
    console.log('Login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <IonApp>
      <IonReactRouter>
      <DisplayProvider>
        <IonRouterOutlet>
          <Route exact path="/login">
            <Login onLogin={handleLogin} />
          </Route>
          <Route exact path="/notebook">
            {isLoggedIn ? <Notebook onLogout={handleLogout} /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/">
            <Redirect to={isLoggedIn ? "/notebook" : "/login"} />
          </Route>
        </IonRouterOutlet>
        </DisplayProvider>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

/*

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/notebook">
          <Notebook />
        </Route>
        <Route exact path="/">
          <Redirect to="/notebook" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
*/