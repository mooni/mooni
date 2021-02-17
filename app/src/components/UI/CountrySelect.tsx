import React from 'react';

import { Autocomplete } from '@material-ui/lab';
import {COUNTRIES_ARRAY} from "../../lib/countries";
import styled from 'styled-components';
import { WideInput } from './StyledComponents';

function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
      .toUpperCase()
      .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}

const Flag = styled.span`
  margin-right: 0.5rem;
  font-size: 1rem;
`;

export default function CountrySelect({ countryCode, onChange }) {
  return (
    <Autocomplete
      options={COUNTRIES_ARRAY}
      disableClearable
      clearOnEscape
      clearOnBlur
      value={COUNTRIES_ARRAY.find(c => c.code === countryCode)}
      onChange={(_, value) => onChange(value?.code)}
      getOptionLabel={(option) => option.label}
      renderInput={(params) => (
        <div ref={params.InputProps.ref}>
          <WideInput {...params.inputProps} />
        </div>
      )}
      renderOption={(option) => (
        <>
          <Flag>{countryToFlag(option.code)}</Flag>
          {option.label}
        </>
      )}
    />
  );
}
