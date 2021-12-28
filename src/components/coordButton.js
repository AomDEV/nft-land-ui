import React from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { GetAccount } from "../api/Account";
import Land from "../api/Land";
import Market from "../api/Storage";
import Web3 from "../api/Web3";

export default function CoordButton(props){
    const Popup = withReactContent(Swal);
    const noOwner = "0x0000000000000000000000000000000000000000";

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    const x = props.x === undefined ? -1 : parseInt(props.x);
    const y = props.y === undefined ? -1 : parseInt(props.y);
    const mintable = props.mintable === undefined ? false : props.mintable;
    const minted = props.minted === undefined ? false : props.minted;
    const editable = props.editable === undefined ? false : props.editable;
    const tokenId = props.tokenId === undefined ? -1 : parseInt(props.tokenId);
    const zoneId = props.zoneId === undefined ? -1 : parseInt(props.zoneId);
    const pricePerBlock = props.zoneId === undefined ? 0 : parseFloat(props.pricePerBlock);
    const landType = props.landType === undefined ? -1 : parseInt(props.landType);
    const owner = props.owner === undefined ? null : props.owner;

    async function onCoordClick() {
        console.log(`Coordinate: ${x},${y} (Token ID: ${tokenId})`);
        if(mintable && !minted){
            Popup.fire({
                icon: "question",
                title: <span>Mint: <i>Land ({x},{y})</i></span>,
                showCancelButton: true
            }).then(async (res) => {
                if(!res.isConfirmed) return;
                const account = await GetAccount()
                console.log("premint account",account);
                const result = await Land().premint(zoneId, x, y, 0).send({
                    from: account
                });
            });
        } else if(editable && landType >= 0 && owner === noOwner){
            const alertResult = await Popup.fire({
                title: "Edit Tile",
                input: "select",
                inputOptions: {
                    0: "AVAILABLE",
                    1: "RESERVED",
                    2: "SPONSORED",
                    3: "UNAVAILABLE"
                },
                inputLabel: `Land Type`,
                showCancelButton: true,
                footer: `Land (${x},${y})`,
            });
            if(!alertResult.isConfirmed) return;
            const inputValue = parseInt(alertResult.value);
            const result = await Land().setLandType(zoneId, x, y, inputValue).send({
                from: await GetAccount()
            })
            console.log(result);
        } else{
            if(!minted || landType !== 0 || owner !== noOwner){
                Toast.fire({
                    icon: (owner !== noOwner)?"info":"error",
                    title: `Land (${x}, ${y})`,
                    html: (owner !== noOwner)?owner:`Not available`
                });
                return;
            }
            Popup.fire({
                icon: "question",
                title: <span>Purchase: Land</span>,
                html: <div>
                    <span>X : <b>{x}</b> , Y : <b>{y}</b></span>
                    <div style={{fontSize:'0.75em',marginTop:'1em',color:"white",backgroundColor:"black",padding:"1em"}}><b>{pricePerBlock.toLocaleString()}</b> MTV</div>
                </div>,
                showCancelButton: true
            }).then(async res => {
                if(!res.isConfirmed) return;
                const result = await Market().batchPurchase([tokenId]).send({
                    from: await GetAccount()
                });
                console.log(result);
            });
        };
    }

    return (
        <button onClick={onCoordClick} className={props.className}>
            {x},{y}
        </button>
    );
}