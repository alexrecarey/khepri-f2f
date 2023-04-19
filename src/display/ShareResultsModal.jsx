import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

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


function encodeQueryData(data) {
  const ret = [];
  for (let d in data)
    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
  return ret.join('&');
}

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
  const [isURLCopied, setIsURLCopied] = useState(false);
  const [isCompactCopied, setIsCompactCopied] = useState(false);
  const [isFullCopied, setIsFullCopied] = useState(false);
  const open = props.open;
  const setClose = props.setClose;
  const faceToFace = props.results.face_to_face;
  const expectedWounds = props.results.expected_wounds;
  const parameters = props.results.parameters;
  const title = props.results?.title ?? "Result";

  // Sharable data precalculation
  const activeWounds = ascendByWounds(activePlayer(expectedWounds));
  const reactiveWounds = ascendByWounds(reactivePlayer(expectedWounds));
  const failureWounds = ascendByWounds(failurePlayer(expectedWounds));
  const activeWinsF2F = formatPercentage(activePlayer(faceToFace)[0]['chance']);
  const reactiveWinsF2F = formatPercentage(reactivePlayer(faceToFace)[0]['chance']);
  const noWinF2F = formatPercentage(failurePlayer(faceToFace)[0]['chance']);
  const activeFirstWound = activeWounds?.[0] ? formatPercentage(activeWounds[0]['cumulative_chance']): 0;
  const activeFirstAmount = activeWounds?.[0] ? activeWounds[0]['wounds'] : null;
  const activeSecondWound = activeWounds?.[1] ? formatPercentage(activeWounds[1]['cumulative_chance']): 0;
  const activeSecondAmount = activeWounds?.[1] ? activeWounds[1]['wounds'] : null;
  const reactiveFirstWound = reactiveWounds?.[0] ? formatPercentage(reactiveWounds[0]['cumulative_chance']): 0;
  const reactiveFirstAmount = reactiveWounds?.[0] ? reactiveWounds[0]['wounds'] : false;
  const reactiveSecondWound = reactiveWounds?.[1] ? formatPercentage(reactiveWounds[1]['cumulative_chance']): 0;
  const reactiveSecondAmount = reactiveWounds?.[1] ? reactiveWounds[1]['wounds'] : false;
  const failureWound = failureWounds?.[0] ? formatPercentage(failureWounds[0]['cumulative_chance']): 0;
  const woundsByChance = (x, y) => x + y['wounds'] * y['chance'];
  const activeWPO = twoDecimalPlaces(reduce(woundsByChance, 0, activePlayer(expectedWounds)));
  const reactiveWPO = twoDecimalPlaces(reduce(woundsByChance, 0,reactivePlayer(expectedWounds)));


  const shareURL = `https://infinitythecalculator.com/?${encodeQueryData(parameters)}`;

  const fullResultText =
`Active - ${activeWPO} wounds / order:
  Wins F2F: ${activeWinsF2F}%\
  ${activeFirstAmount ? ("\n  Causes " + activeFirstAmount + "+ wounds: " + activeFirstWound + "%") : '' }\
  ${activeSecondAmount ? ("\n  Causes " + activeSecondAmount + "+ wounds: " + activeSecondWound + "%") : '' }
Failure:
  Ties F2F: ${noWinF2F}%
  No wounds: ${failureWound}%
Reactive - ${reactiveWPO} wounds / order:
  Wins F2F: ${reactiveWinsF2F}%\
${reactiveFirstAmount ? ("\n  Causes " + reactiveFirstAmount + "+ wounds: " + reactiveFirstWound + "%") : '' }\
${reactiveSecondAmount ? ("\n  Causes " + activeSecondAmount + "+ wounds: " + reactiveSecondWound + "%") : '' }
  Wounds / order: ${reactiveWPO}`

//   const compactResultText =
// `Active - Failure - Reactive
// Wins F2F:  ${activeWinsF2F}% - ${noWinF2F}% - ${reactiveWinsF2F}%
// 1+ wounds: ${activeFirstWound}% - ${failureWound}% - ${reactiveFirstWound}%
// Wounds / Order: ${activeWPO} - - ${reactiveWPO}`

  const discordText =  [
    `# ${title}\n`,
    `### Active (${twoDecimalPlaces(reduce(woundsByChance, 0, activePlayer(expectedWounds)))} wounds / order)\n`,
    (ascendByWounds(activePlayer(expectedWounds)).map((row) => {
      return `- ${formatPercentage(row['cumulative_chance'])}% chance ${row['wounds']} or more wounds.\n`
    })).join(''),
    `### Failure\n`,
    (failurePlayer(expectedWounds).map((row) => {
      return `- ${formatPercentage(row['cumulative_chance'])}% chance neither player causes wounds (${formatPercentage(row['cumulative_reactive_guts_chance'])}% for reactive to guts).\n`
    })).join(''),
    `### Reactive (${twoDecimalPlaces(reduce(woundsByChance, 0, reactivePlayer(expectedWounds)))} wounds / order)\n`,
    (ascendByWounds(reactivePlayer(expectedWounds)).map((row) => {
      return `- ${formatPercentage(row['cumulative_chance'])}% chance ${row['wounds']} or more wounds.\n`
    })).join(''),
    `[Edit this result](${shareURL})`
  ].join('');


  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const handleCopyClick = (text, setStatus) => {
    // Asynchronously call copyTextToClipboard
    copyTextToClipboard(text)
      .then(() => {
        // If successful, update the isCopied state value
        setStatus(true);
        setTimeout(() => {
          setStatus(false);
          setClose();
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  }


  return (
    <div>
      <Modal
        open={open}
        onClose={setClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h4" component="h3" sx={{mb: 2}}>Share results</Typography>
          
          <TextField fullWidth readOnly label='Share URL' variant='filled' value={shareURL} />
          <Button onClick={() => handleCopyClick(shareURL, setIsURLCopied)}>{isURLCopied ? 'Copied!' : 'Copy URL'}</Button>
          <Box sx={{height: 16}} />
          
          <TextField fullWidth multiline readOnly label='Discord optimized text' variant='filled' maxRows={5} value={discordText}/>
          <Typography variant="caption">Note: Formatted text might not be available yet in every discord server.</Typography>
          <Button onClick={() => handleCopyClick(discordText, setIsCompactCopied)}>{isCompactCopied ? 'Copied!' : 'Copy Discord text'}</Button>
          <Box sx={{height: 16}} />

          <TextField fullWidth multiline readOnly label='Plain text' variant='filled' maxRows={5} value={fullResultText}/>
          <Button onClick={() => handleCopyClick(fullResultText, setIsFullCopied)}>{isFullCopied ? 'Copied!' : 'Copy plain text'}</Button>
          <Box sx={{height: 16, flexGrow: 1}}></Box>
          
          <Button onClick={() => setClose()}>Close share sheet</Button>
        </Box>
       </Modal>
     </div>
   );
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
//  Lightning U+26F1
