import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

function getLibrary(provider) {
  return new Web3Provider(provider)
}

root.render(
  <StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <ColorModeScript />
      <App />
    </Web3ReactProvider>
  </StrictMode>
);
