import React from "react";
import { GetAccount } from "../api/Account";
import Land from "../api/Land";
import Market from "../api/Storage";
import Token from "../api/Token";
import Web3 from "../api/Web3";
import CoordButton from "./coordButton";
import MetaMask from "./metamask";
import ZoneButton from "./zoneButton";
import { useWallet } from '@binance-chain/bsc-use-wallet'

function TileMap(props) {
    const wallet = useWallet();

    const noOwner = "0x0000000000000000000000000000000000000000";
    const approveContract = "0x98A8499aA61066A0f5BaA59eB2C5a9Fc278e3a72";
    const approveAmount = Web3().utils.toWei((100*100).toString());

    const [zoneList, setZoneList] = React.useState([]);
    const [coordinate, setCoordinate] = React.useState([]);
    const [pricePerBlock, setPricePerBlock] = React.useState(0);
    const [userMode, setUserMode] = React.useState(0);
    const [width, setWidth] = React.useState(10);
    const [height, setHeight] = React.useState(10);
    const [zoneId, setZoneId] = React.useState(0);
    const [isApproved, setIsApproved] = React.useState(false);

    const ELandType = {
        "AVAILABLE": 0,
        "RESERVED": 1,
        "SPONSORED": 2,
        "UNAVAILABLE": 3
    }

    function generateMap(width = 10, height = 10){
        let rows = [];
        for(let x = 0; x <= width; x++){
            let col = [];
            for(let y = 0; y <= height; y++) col.push(y);
            rows.push(
                col.map((y,i) => {
                    let classButton = ["coord-btn"];
                    let canPremint = false;
                    const coord = coordinate.find(a => a.x == x && a.y == y);
                    const tokenId = coord ? coord.tokenId : -1;
                    const owner = coord ? coord.owner : null;

                    if(coord){
                        if(coord.landType == ELandType.AVAILABLE && owner === noOwner) classButton.push("available");
                        if(coord.landType == ELandType.RESERVED) classButton.push("reserved");
                        if(coord.landType == ELandType.SPONSORED) classButton.push("sponsored");
                        if(coord.landType == ELandType.UNAVAILABLE || owner !== noOwner) classButton.push("unavailable");
                    }

                    if(classButton.length <= 1) {
                        classButton.push("reserved");
                        canPremint = true;
                    }
                    return (
                        <td key={i}>
                            <CoordButton 
                                x={x} 
                                y={y} 
                                key={i} 
                                mintable={userMode === 1} 
                                editable={userMode === 2}
                                landType={coord ? coord.landType : -1}
                                owner={owner}
                                minted={!canPremint}
                                tokenId={tokenId} 
                                zoneId={zoneId}
                                className={classButton.join(" ")}
                                pricePerBlock={pricePerBlock}
                            />
                        </td>
                    );
                })
            )
        }
        return rows.map((row,i) => {
            return <tr key={i}>{row}</tr>;
        });
    }

    async function loadPricePerBlock(){
        const result = await Market()._pricePerBlock().call();
        const amount = (Web3().utils.fromWei(result));
        setPricePerBlock(amount);
    }

    async function loadTile(zone = null){
        if(zone === null) zone = 0;
        const result = await Land().getLands(zone).call();
        const map = result.map(x => {
            return {
                x: parseInt(x.x),
                y: parseInt(x.y),
                landType: (parseInt(x.landType)),
                tokenId: parseInt(x.tokenId),
                owner: x.owner
            }
        });
        setCoordinate(map);
        console.log(map);
    }

    async function getZoneList(){
        const result = await Land().getZoneList().call();
        setZoneList(result);
    }

    async function loadIsApproved(){
        const result = await Token().allowance(wallet.account,approveContract).call();
        const allowance = Web3().utils.fromWei(result);
        setIsApproved(allowance >= 1);
    }

    function onZoneChanged(e){
        const zone = parseInt(e.target.value);
        if(isNaN(zone) || zone < 0) return;
        setZoneId(zone);
    }

    function onModeChanged(){
        let lUserMode = userMode;
        lUserMode++;
        if(lUserMode > UserModeList.length - 1) lUserMode = 0;
        setUserMode(lUserMode);
    }

    const UserModeList = ["Viewer", "Minter", "Editor"];

    async function onApproveClick() {
        const account = await GetAccount();
        
        if(isApproved) return;
        const result = await Token().approve(
            approveContract,
            approveAmount
        ).send({
            from: account
        });
        loadIsApproved();
        console.log(result);
    }

    function onWidthChanged(e) {
        const value = parseInt(e.target.value);
        if(isNaN(value) || value <= 0) return;
        setWidth(value);
    }

    function onHeightChanged(e) {
        const value = parseInt(e.target.value);
        if(isNaN(value) || value <= 0) return;
        setHeight(value);
    }

    function loadDefaultProps(){
        setWidth(props.width === undefined ? 10 : props.width);
        setHeight(props.height === undefined ? 10 : props.height);
    }

    async function getLandByOwner(){
        const acc = await GetAccount();
        console.log(acc);
        const data = await Land().getLandByOwner(acc).call();
        console.log(data);
    }

    React.useEffect(() => {
        loadTile(zoneId);
    }, [width,height,zoneId]);

    React.useEffect(() => {
        loadDefaultProps();
        getZoneList();
        loadTile();
        loadPricePerBlock();
        subscribeLand((e,r) => {
            console.log(`Logs received`, r);
        }).on("data", async (data) => {
            console.log(`Data received`, data);
            loadTile(zoneId);
        });
        subscribeStorage((e,r) => {
            console.log(`Logs received`, r);
        }).on("data", async (data) => {
            console.log(`Data received`, data);
            loadTile(zoneId);
        });
    },[]);

    React.useEffect(() => {
        if(wallet.account !== null) loadIsApproved();
    }, [wallet.account]);

    function subscribeLand(callback){
        const c = "0xec94D809EDF1F27766885343b267ab2c80Cf22De";
        return Web3().eth.subscribe("logs", {
            address: c,
            topics: ['0x98b4f5c80a99400b088535d5058fa717c907e424a336a2a5ac0668ab154b5c21']
        }, callback);
    }

    function subscribeStorage(callback){
        const c = "0x98A8499aA61066A0f5BaA59eB2C5a9Fc278e3a72";
        return Web3().eth.subscribe("logs", {
            address: c,
            topics: ['0x34cb149aac44964274dbe758054ff06b6c1b88ddc1bf6c40b3e536eaa3e7e2ae']
        }, callback);
    }

    return (
        <div>
            <header>
                <div className="flex-header">
                <div align="left" className="address">
                    <MetaMask />
                </div>
                <div>
                    <div>
                        <input type="number" min={0} placeholder="Zone ID" value={zoneId} onChange={onZoneChanged} />
                    </div>
                    <div>
                        <input type="number" min={1} style={{maxWidth:'65px',textAlign:"center"}} placeholder="Width" value={width} onChange={onWidthChanged} />
                        <input type="number" min={1} style={{maxWidth:'65px',textAlign:"center"}} placeholder="Height" value={height} onChange={onHeightChanged} />
                    </div>
                </div>
                <div>
                    <div>
                        <ZoneButton zoneId={zoneId} zoneList={zoneList} />
                    </div>
                    <div>
                        <button onClick={onModeChanged}>Mode: {UserModeList[userMode]}</button>
                    </div>
                    <div>
                        {
                            (isApproved)?<button disabled>Approved</button>:
                            <button onClick={onApproveClick}>Approve</button>
                        }
                        <button onClick={() => getLandByOwner()}>Get Owner</button>
                    </div>
                </div>
                </div>
            </header>
            <div className="lands">
                <table border={0}>
                    <thead></thead>
                    <tbody>
                        {generateMap(width, height)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default TileMap;