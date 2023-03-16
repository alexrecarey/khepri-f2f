import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {
  ascendByWounds,
  activePlayer,
  reactivePlayer,
  failurePlayer,
  twoDecimalPlaces,
  formatPercentage
} from "./DataTransform.js";
import {reduce} from "ramda";
import {useState} from "react";


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 400,
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ShareResultsModal(props) {
  const [isCopied, setIsCopied] = useState(false);
  const open = props.open;
  const setClose = props.setClose;
  const expectedWounds = props.expectedWounds;

  const activeWounds = ascendByWounds(activePlayer(expectedWounds));
  const reactiveWounds = ascendByWounds(reactivePlayer(expectedWounds));
  const failureWounds = ascendByWounds(failurePlayer(expectedWounds));
  const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];
  const activeWPO = twoDecimalPlaces(reduce(woundsByChance, 0, activePlayer(expectedWounds)));
  const reactiveWPO = twoDecimalPlaces(reduce(woundsByChance, 0,reactivePlayer(expectedWounds)));
  const copyText = `Active causes 1+ wounds: ${formatPercentage(activeWounds[0].cumulative_chance)}% (${activeWPO} W/O)
Active causes 2+ wounds: ${formatPercentage(activeWounds[1].cumulative_chance)}%
Failure no wounds: ${formatPercentage(failureWounds[0].cumulative_chance)}%
Reactive causes 1+ wounds: ${formatPercentage(reactiveWounds[0].cumulative_chance)}% (${reactiveWPO} W/O)
Reactive causes 2+ wounds: ${formatPercentage(reactiveWounds[1].cumulative_chance)}%`

  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const handleCopyClick = () => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(copyText)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //const faceToFace = props.face_to_face;
  //const p = props.parameters;
  // 🔥 Fire	U+1F525
  // 🟥 Red square	U+1F7E5
  // 🟧 Orange square	U+1F7E5
  // 🟨 Yellow square	U+1F7E8
  // 🟩 Green square	U+1F7E9
  // 🟦 Blue square	U+1F7E6
  // 🟪 Purple square	U+1F7EA
  // 🟫 Brown square	U+1F7EB
  // ⬛ Black square	U+2B1B
  // ⬜ White square	U+2B1C

  return (
    <div>
      <Modal
        open={open}
        onClose={setClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{mb: 2}}>
            Share results
          </Typography>
          <div><b>Active</b> causes 1+ wounds: {formatPercentage(activeWounds[0].cumulative_chance)}% ({activeWPO} W/O)</div>
          <div><b>Active</b> causes 2+ wounds: {formatPercentage(activeWounds[1].cumulative_chance)}%</div>
          <div><b>Failure</b> no wounds: {formatPercentage(failureWounds[0].cumulative_chance)}%</div>
          <div><b>Reactive</b> causes 1+ wounds: {formatPercentage(reactiveWounds[0].cumulative_chance)}% ({reactiveWPO} W/O)</div>
          <div><b>Reactive</b> causes 2+ wounds: {formatPercentage(reactiveWounds[1].cumulative_chance)}%</div>
          <Button onClick={handleCopyClick}>{isCopied ? 'Copied!' : 'Copy to clipboard'}</Button>
        </Box>
      </Modal>
    </div>
  );
}
