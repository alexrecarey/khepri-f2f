import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Input from '@mui/material/Input';
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
  const faceToFace = props.faceToFace;
  const expectedWounds = props.expectedWounds;

  const activeWounds = ascendByWounds(activePlayer(expectedWounds));
  const reactiveWounds = ascendByWounds(reactivePlayer(expectedWounds));
  const failureWounds = ascendByWounds(failurePlayer(expectedWounds));
  const activeWinsF2F = formatPercentage(activePlayer(faceToFace)[0]['chance']);
  const reactiveWinsF2F = formatPercentage(reactivePlayer(faceToFace)[0]['chance']);
  const noWinF2F = formatPercentage(failurePlayer(faceToFace)[0]['chance']);
  const activeOneWound = activeWounds?.[0] ? formatPercentage(activeWounds[0]['cumulative_chance']): 0;
  const activeTwoWound = activeWounds?.[1] ? formatPercentage(activeWounds[1]['cumulative_chance']): 0;
  const reactiveOneWound = reactiveWounds?.[0] ? formatPercentage(reactiveWounds[0]['cumulative_chance']): 0;
  const reactiveTwoWound = reactiveWounds?.[1] ? formatPercentage(reactiveWounds[1]['cumulative_chance']): 0;
  const failureWound = failureWounds?.[0] ? formatPercentage(failureWounds[0]['cumulative_chance']): 0;
  const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];
  const activeWPO = twoDecimalPlaces(reduce(woundsByChance, 0, activePlayer(expectedWounds)));
  const reactiveWPO = twoDecimalPlaces(reduce(woundsByChance, 0,reactivePlayer(expectedWounds)));


  const fullResultText =
`Active - ${activeWPO} wounds / order:
  Wins F2F: ${activeWinsF2F}%
  Causes 1+ wounds: ${activeOneWound}%
  Causes 2+ wounds: ${activeTwoWound}%
Failure:
  Ties F2F: ${noWinF2F}%
  No wounds: ${failureWound}%
Reactive - ${reactiveWPO} wounds / order:
  Wins F2F: ${reactiveWinsF2F}%
  Causes 1+ wounds: ${reactiveOneWound} %
  Causes 2+ wounds: ${reactiveTwoWound}%
  Wounds / order: ${reactiveWPO}`

  const compactResultText =
`Active - Failure - Reactive
Wins F2F:  ${activeWinsF2F}% - ${noWinF2F}% - ${reactiveWinsF2F}%
1+ wounds: ${activeOneWound}% - ${failureWound}% - ${reactiveOneWound}%
Wounds / Order: ${activeWPO} - - ${reactiveWPO}`

  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const handleCopyClick = (text) => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(text)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
          setClose();
        }, 1000);
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
          <Typography id="modal-modal-title" variant="h4" component="h3" sx={{mb: 2}}>
            Share results
          </Typography>
          <Typography variant="h6">Compact version</Typography>
          <Input fullWidth multiline readOnly value={compactResultText}/>
          <Button onClick={() => handleCopyClick(compactResultText)}>{isCopied ? 'Copied!' : 'Copy to clipboard'}</Button>

          <Typography variant="h6" mt={2}>Full version</Typography>
          <Input fullWidth multiline readOnly value={fullResultText}/>
          <Button onClick={() => handleCopyClick(fullResultText)}>{isCopied ? 'Copied!' : 'Copy to clipboard'}</Button>
         </Box>
       </Modal>
     </div>
   );
}
