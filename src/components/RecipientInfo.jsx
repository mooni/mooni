import React from 'react';

import { Box } from '@material-ui/core';
import { Info } from '@aragon/ui'

function RecipientInfo({ recipient }) {
  return (
    <Info title="Recipient">
      <Box>{recipient.owner.name}</Box>
      <Box>{recipient.owner.address}</Box>
      <Box>{recipient.owner.zip} {recipient.owner.city} {recipient.owner.country}</Box>
      <Box><b>IBAN:</b> {recipient.iban}</Box>
      <Box><b>BIC:</b> {recipient.bic_swift}</Box>
    </Info>
  )
}

export default RecipientInfo;
