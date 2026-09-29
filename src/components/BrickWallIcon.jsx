import {SvgIcon} from '@mui/material';

// Three courses of bricks: something to take cover behind.
function BrickWallIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="1" y="3" width="10.5" height="5" rx="0.6" />
      <rect x="12.5" y="3" width="10.5" height="5" rx="0.6" />
      <rect x="1" y="9.5" width="4.75" height="5" rx="0.6" />
      <rect x="6.75" y="9.5" width="10.5" height="5" rx="0.6" />
      <rect x="18.25" y="9.5" width="4.75" height="5" rx="0.6" />
      <rect x="1" y="16" width="10.5" height="5" rx="0.6" />
      <rect x="12.5" y="16" width="10.5" height="5" rx="0.6" />
    </SvgIcon>
  );
}

export default BrickWallIcon;
