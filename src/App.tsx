import React from 'react';
import Home from './pages/Home';
import GlobalStyleProvider from './styles/GlobalStyleProvider';

function App() {
  return (
    <GlobalStyleProvider>
      <Home />
    </GlobalStyleProvider>
  );
}

export default App;
