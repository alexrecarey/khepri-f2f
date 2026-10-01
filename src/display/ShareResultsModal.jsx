import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

import {
  activePlayer,
  reactivePlayer,
  formatPercentage,
  squashResults,
  activePlayerWithWounds,
  reactivePlayerWithWounds,
  failurePlayerWithNoWounds,
  sumChance,
  woundsPerOrder,
  twoDecimalPlaces,
  unopposedSummary,
} from "./DataTransform.js";
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
  // state
  const [isURLCopied, setIsURLCopied] = useState(false);
  const [isCompactCopied, setIsCompactCopied] = useState(false);
  const [isFullCopied, setIsFullCopied] = useState(false);

  // props handling
  const activeMaxWounds = props.activeMaxWounds ? props.activeMaxWounds : 3;
  const reactiveMaxWounds = props.reactiveMaxWounds ? props.reactiveMaxWounds : 3;
  const open = props.open;
  const setClose = props.setClose;
  const expectedWounds = props.results.expected_wounds;
  const parameters = props.results.parameters;
  const title = props.results?.title ?? "Result";

  // Sharable data precalculation
  // Must calculate WPO on original, raw results instead of squashed ones
  const activeWPO = twoDecimalPlaces(woundsPerOrder(activePlayer(expectedWounds)));
  const reactiveWPO = twoDecimalPlaces(woundsPerOrder(reactivePlayer(expectedWounds)));
  const rows = squashResults(expectedWounds, activeMaxWounds, reactiveMaxWounds);
  const activeList = activePlayerWithWounds(rows);
  const reactiveList = reactivePlayerWithWounds(rows);
  const failureList = failurePlayerWithNoWounds(rows);
  const totalFail = formatPercentage(sumChance(failureList));
  const activeNoWounds = activePlayer(failureList);
  const reactiveNoWounds = reactivePlayer(failureList);
  const activeWinsF2F = formatPercentage(sumChance(activePlayer(rows)));
  const reactiveWinsF2F = formatPercentage(sumChance(reactivePlayer(rows)));
  // `share` carries the mode and, in Matchup mode, the unit picks (see App).
  const shareURL = `https://infinitythecalculator.com/?${encodeQueryData({...parameters, ...(props.results.share ?? {})})}`;

  // Full text
  const faceToFaceFullText =
`Active (${activeWPO} wounds / order):
  Wins F2F: ${activeWinsF2F}%\
${activeList.map((x) => `\n  Causes ${x.wounds}+ wounds: ${formatPercentage(x.cumulative_chance)}%`)}
Failure:
  No wounds caused: ${totalFail}%\
${activeNoWounds.map((x) => `\n  (${formatPercentage(x.chance)}% chance active player causes no wounds)`)}\
${reactiveNoWounds.map((x) => `\n  (${formatPercentage(x.chance)}% chance reactive player causes no wounds)`)}
Reactive (${reactiveWPO} wounds / order):
  Wins F2F: ${reactiveWinsF2F}%\
${reactiveList.map((x) => `\n  Causes ${x.wounds}+ wounds: ${formatPercentage(x.cumulative_chance)}%`)}`

  // Unopposed (a Direct Template against an attack): each side on its own, no
  // shared failure.
  const unopposed = props.results.unopposed;
  const sides = unopposed && [['Active', 'active', activeMaxWounds], ['Reactive', 'reactive', reactiveMaxWounds]]
    .map(([name, player, max]) => ({name, ...unopposedSummary(unopposed[player], player, max)}));
  const unopposedFullText = sides && sides.map((x) =>
`${x.name} (${twoDecimalPlaces(x.wpo)} wounds / order):
  Succeeds (unopposed roll): ${formatPercentage(x.success)}%
  No wounds caused: ${formatPercentage(x.noWounds)}%\
${x.atLeast.map((w) => `\n  Causes ${w.wounds}+ wounds: ${formatPercentage(w.chance)}%`).join('')}`).join('\n');
  const unopposedDiscordText = sides && [
    `# ${title}\n`,
    ...sides.map((x) => [
      `### ${x.name} (${twoDecimalPlaces(x.wpo)} wounds / order, unopposed roll)\n`,
      `- ${formatPercentage(x.noWounds)}% chance of no wounds.\n`,
      ...x.atLeast.map((w) => `- ${formatPercentage(w.chance)}% chance ${w.wounds} or more wounds.\n`),
    ].join('')),
    `[Edit this result](${shareURL})`,
  ].join('');

  // Discord text
  const faceToFaceDiscordText =  [
    `# ${title}\n`,
    `### Active (${activeWPO} wounds / order)\n`,
    activeList.map((row) => {
      return `- ${formatPercentage(row['cumulative_chance'])}% chance ${row['wounds']} or more wounds.\n`
    }).join(''),
    `### Failure\n`,
    `- ${totalFail}% chance neither player causes wounds.\n`,
    activeNoWounds.map((x) => {
      return `(${formatPercentage(x.chance)}% chance active player causes no wounds).\n`
    }),
    reactiveNoWounds.map((x) => {
      return `(${formatPercentage(x.chance)}% chance reactive player causes no wounds).\n`
    }),
    `### Reactive (${reactiveWPO} wounds / order)\n`,
    reactiveList.map((row) => {
      return `- ${formatPercentage(row['cumulative_chance'])}% chance ${row['wounds']} or more wounds.\n`
    }).join(''),
    `[Edit this result](${shareURL})`
  ].join('');


  const discordText = unopposed ? unopposedDiscordText : faceToFaceDiscordText;
  const fullResultText = unopposed ? unopposedFullText : faceToFaceFullText;

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
