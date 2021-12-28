import cWeb3 from "web3"

export default function Web3() {
    //const provider =  new cWeb3.providers.HttpProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
    const provider = cWeb3.givenProvider;
    const web3 = new cWeb3(provider);
    return web3;
}