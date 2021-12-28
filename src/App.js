import './App.css';
import React from 'react';
import { UseWalletProvider } from '@binance-chain/bsc-use-wallet'
import TileMap from './components/tilemap';

function App() {
  return (
    <UseWalletProvider connectors={{ bsc:{} }} chainId={97}>
      <div className="App">
        {<TileMap width={50} height={50} />}
      </div>
    </UseWalletProvider>
  );
}

export default App;
