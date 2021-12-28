import React from "react";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { GetAccount } from "../api/Account";
import Land from "../api/Land";
import Web3 from "../api/Web3";

export default function ZoneButton (props) {
    const Popup = withReactContent(Swal);

    const zoneId = props.zoneId === undefined ? 0 : parseInt(props.zoneId);
    const zoneList = props.zoneList === undefined ? [] : [...props.zoneList];

    const isEditMode = (zoneList.filter(x=>x == zoneId).length > 0);

    async function onButtonClick () {
        const alertResult = await Popup.fire({
            title: isEditMode ? `Edit` : `Create`,
            input: "url",
            inputLabel: `Enter Zone #${zoneId} metadata`,
            inputPlaceholder: "https://xxxxxx.com/<ipfs hash>",
            showCancelButton: true,
        });
        if(!alertResult.isConfirmed) return;
        
        const result = await (isEditMode) ? Land().setZoneTokenURI(zoneId, alertResult.value).send({
            from: await GetAccount()
        }) : Land().createZone(zoneId, alertResult.value).send({
            from: await GetAccount()
        });
        console.log(result);
    }

    return (
        <button onClick={onButtonClick}>
        {
            isEditMode?
            <span>Edit Zone #{zoneId}</span>:<span>Create Zone #{zoneId}</span>
        }
        </button>
    );

}