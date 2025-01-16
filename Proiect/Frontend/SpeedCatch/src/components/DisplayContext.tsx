import React, { createContext, useState, useContext } from 'react';

interface DisplayContextProps {
  showAntonymDoc: boolean;
  setShowAntonymDoc: (show: boolean) => void;
}

const DisplayContext = createContext<DisplayContextProps | undefined>(undefined);

export const DisplayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showAntonymDoc, setShowAntonymDoc] = useState(false);

  return (
    <DisplayContext.Provider value={{ showAntonymDoc, setShowAntonymDoc }}>
      {children}
    </DisplayContext.Provider>
  );
};

export const useDisplayContext = () => {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error('useDisplayContext must be used within a DisplayProvider');
  }
  return context;
};