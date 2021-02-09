import React from 'react';

import { Box } from '@material-ui/core';
import { Info, textStyle, GU, IconWarning, useTheme, IconRotateLeft, IconArrowLeft } from '@aragon/ui'
import styled from 'styled-components';
import { FlexCenterBox } from '../UI/StyledComponents';
import { dailyLimits, yearlyLimits } from '../../constants/limits';
import { numberWithCommas } from '../../lib/numbers';
import { Button as MButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

// const messages = ["amount_too_large", "amount_too_low", "currency_pair_not_supported", "currency_pair_temporarily_unavailable", "exceeds_quota", "invalid_bank_account", "invalid_bank_account_owner_address", "invalid_country_code", "invalid_crypto_address", "invalid_currency_code", "invalid_currency_pair", "invalid_email", "invalid_partner_fee", "kyc_required", "partner_fee_without_partner"];

const SubTitle = styled.p`
  ${textStyle('title4')};
  text-align: center;
  margin-bottom: ${2 * GU}px;
`;
const Label = styled.p`
  ${textStyle('label1')};
  text-align: center;
  font-weight: 600;
  margin-bottom: ${0.5 * GU}px;
`;
const ErrorContent = styled.p`
  ${textStyle('body3')};
  text-align: center;
  margin-bottom: ${2.5 * GU}px;
`;

const LimitLine = styled.p`
  ${textStyle('body4')};
  text-align: center;
`;

function GenericErrors({ orderErrors }) {
  return (
    <Info title="Error details" mode="error">
      {orderErrors.map(error => (
        <Box key={error.code}>
          <b>{error.code}</b> {error.message}
        </Box>
      ))}
    </Info>
  );
}

function ErrorCTA({action, label, icon}) {
  return (
    <Box mt={2}>
      <MButton
        variant="outlined"
        color="primary"
        size="small"
        startIcon={icon}
        style={{width: '100%'}}
        onClick={action}
      >
        {label}
      </MButton>
    </Box>
  )
}

function ErrorCatcher({orderErrors, onStartOver}) {
  const history = useHistory();

  if(orderErrors[0].code === 'exceeds_quota') {
    const goHome = () => history.push('/');

    return (
      <>
        <ErrorContent>You have reach your limits with this bank account. Please try again with a lower amount or wait 24h so that your limits are reset.</ErrorContent>
        <Label>Exchange limits</Label>
        <LimitLine><b>Daily</b> {numberWithCommas(dailyLimits['EUR'])} EUR/{numberWithCommas(dailyLimits['CHF'])} CHF</LimitLine>
        <LimitLine><b>Annually</b> {numberWithCommas(yearlyLimits['EUR'])} EUR/{numberWithCommas(yearlyLimits['CHF'])} CHF</LimitLine>
        <ErrorCTA
          icon={<IconArrowLeft/>}
          action={goHome}
          label="Go home"
        />
      </>
    );
  } else if(orderErrors[0].code === 'expired') {
    return (
      <>
        <ErrorContent>The order you made has expired. Please create a new one.</ErrorContent>
        <ErrorCTA
          icon={<IconRotateLeft/>}
          action={onStartOver}
          label="Start over"
        />
      </>
    );
  } else {
    return (
      <>
        <GenericErrors orderErrors={orderErrors}/>
        <ErrorCTA
          icon={<IconRotateLeft/>}
          action={onStartOver}
          label="Start over"
        />
      </>
    );
  }
}
export default function OrderError({ orderErrors,onStartOver  }) {
  const theme = useTheme();

  return (
    <Box width={1}>
      <FlexCenterBox>
        <IconWarning size="large" style={{ color: theme.negative }}  />
      </FlexCenterBox>
      <SubTitle>
        Order error
      </SubTitle>
      <ErrorCatcher orderErrors={orderErrors} onStartOver={onStartOver}/>
    </Box>
  );
}