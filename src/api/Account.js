import { useWallet } from '@binance-chain/bsc-use-wallet'

let _account = null;
let _wallet = null;
const GetAccount = () => {
    return _account;
}
const SetAccount = async (_a) => {
    _account = _a;
}
const SetWallet = (_w) => {
    _wallet = _w;
}
const GetWallet = () => {
    return _wallet;
}
export {GetAccount, SetAccount, SetWallet, GetWallet};