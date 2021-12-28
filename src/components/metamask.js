import React from "react";
import Token from "../api/Token";
import Web3 from "../api/Web3";
import { useWallet } from '@binance-chain/bsc-use-wallet'
import { SetAccount, SetWallet } from "../api/Account";

export default function MetaMask () {
    const wallet = useWallet();
    const [balance, setBalance] = React.useState(0);
    
    async function loadBalance(acc) {
        const result = await Token().balanceOf(acc).call();
        const ethBalance = Web3().utils.fromWei(result);
        setBalance(parseFloat(ethBalance));
    };
    const blockNumber = wallet.getBlockNumber();
  
    React.useEffect(() => {
        if(wallet.status === "connected") {
            SetAccount(wallet.account);
            SetWallet(wallet);
            loadBalance(wallet.account);
        }
    }, [wallet.status]);
  
    return (
      <>
      {
        (wallet.status === "connected") ? 
        (
            <div>
                Account: <i>{wallet.account}</i>
                <div className="balance"><b>{(balance).toLocaleString()}</b> MTV</div>
            </div>
        ) : 
        (
            (wallet.status === "connecting") ? (<div>Connecting</div>) : 
            (<button onClick={() => wallet.connect()}>Connect to MetaMask</button>)
        )
      }
      </>
    );
};