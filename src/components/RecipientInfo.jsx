import React from 'react';

import { Box } from '@material-ui/core';
import { Info } from '@aragon/ui'

function RecipientInfo({ recipient }) {
  let fullAddress = '';
  if(recipient.owner?.address) {
    fullAddress += recipient.owner.address;
  }
  if(recipient.owner?.zip) {
    fullAddress += ', ' + recipient.owner.address;
  }
  if(recipient.owner?.city) {
    fullAddress += ', ' + recipient.owner.city;
  }
  if(recipient.owner?.country) {
    fullAddress += ', ' + recipient.owner.country;
  }

  return (
    <Info title="Recipient">
      <Box>
        <b>Name:&nbsp;</b>
        {recipient.owner.name}
      </Box>

      {fullAddress !== '' &&
      <Box>
        <b>Address:&nbsp;</b>
        {fullAddress}
      </Box>
      }

      <Box>
        <b>IBAN:&nbsp;</b>
        {recipient.iban}
      </Box>

      {recipient.bic_swift &&
      <Box>
        <b>BIC:&nbsp;</b>
        {recipient.bic_swift}
      </Box>
      }
    </Info>
  )
}

export default RecipientInfo;
