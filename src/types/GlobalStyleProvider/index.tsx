import React, { ReactNode } from 'react';
import GlobalStyle from '../Global/global';

interface GlobalStyleProps {
  children: ReactNode;
}

const GlobalStyleProvider = ({ children }: GlobalStyleProps) => {
  return (
    <>
      <GlobalStyle />
      {children}
    </>
  );
};

export default GlobalStyleProvider;
