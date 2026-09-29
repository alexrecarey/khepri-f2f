import {FormControl, InputLabel, Select} from '@mui/material';
import PropTypes from 'prop-types';

// Labels carry a lot of detail (weapon · B · PS · range · W/order), so on
// phones shrink the text and let rows wrap instead of truncating.
export const compactText = {fontSize: {xs: '0.8rem', sm: '1rem'}, whiteSpace: 'normal'};
const selectSx = {'& .MuiSelect-select': {...compactText, lineHeight: 1.3}};
const menuProps = {sx: {'& .MuiMenuItem-root': {...compactText, lineHeight: 1.3}}};

function SelectField({label, value, onChange, color, field, open, onOpen, onClose, needsChoice, disabled, children}) {
  return (
    <FormControl fullWidth size="small" color={color} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        sx={selectSx}
        MenuProps={menuProps}
        SelectDisplayProps={{'data-field': field, 'data-needs-choice': needsChoice ?? value == null}}
      >
        {children}
      </Select>
    </FormControl>
  );
}

SelectField.propTypes = {
  field: PropTypes.string,
  needsChoice: PropTypes.bool,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  color: PropTypes.string,
  children: PropTypes.node,
};

export default SelectField;
