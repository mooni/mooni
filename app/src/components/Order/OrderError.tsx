import React from 'react';

import { Box } from '@material-ui/core';
import { Info, textStyle, GU, IconWarning, useTheme, IconRotateLeft, IconArrowLeft } from '@aragon/ui'
import styled from 'styled-components';
import { FlexCenterBox, RoundButton } from '../UI/StyledComponents';
import { dailyLimits, yearlyLimits } from '../../constants/limits';
import { numberWithCommas } from '../../lib/numbers';
import { resetOrder } from '../../redux/payment/actions';
import { useDispatch } from 'react-redux';
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
      <RoundButton
        mode="strong"
        onClick={action}
        wide
        icon={icon}
        label={label}
      />
    </Box>
  )
}

function ErrorCatcher({orderErrors}) {
  const history = useHistory();
  const dispatch = useDispatch();

  function onRestart(home: boolean = false) {
    dispatch(resetOrder());
    history.push(home ? '/' : '/order');
  }

  if(orderErrors[0].code === 'exceeds_quota') {
    return (
      <>
        <ErrorContent>You have reach your limits with this bank account. Please try again with a lower amount or wait 24h so that your limits are reset.</ErrorContent>
        <Label>Exchange limits</Label>
        <LimitLine><b>Daily</b> {numberWithCommas(dailyLimits['EUR'])} EUR/{numberWithCommas(dailyLimits['CHF'])} CHF</LimitLine>
        <LimitLine><b>Annually</b> {numberWithCommas(yearlyLimits['EUR'])} EUR/{numberWithCommas(yearlyLimits['CHF'])} CHF</LimitLine>
        <ErrorCTA
          icon={<IconArrowLeft/>}
          action={() => onRestart(true)}
          label="Go home"
        />
      </>
    );
  } else if(orderErrors[0].code === 'cancelled') {
    return (
      <>
        <ErrorContent>The order have been cancelled, maybe due to inactivity. Please try again.</ErrorContent>
        <ErrorCTA
          icon={<IconRotateLeft/>}
          action={onRestart}
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
          action={onRestart}
          label="Start over"
        />
      </>
    );
  }
}
export default function OrderError({ orderErrors }) {
  const theme = useTheme();

  return (
    <Box width={1}>
      <FlexCenterBox>
        <IconWarning size="large" style={{ color: theme.negative }}  />
      </FlexCenterBox>
      <SubTitle>
        Order error
      </SubTitle>
      <ErrorCatcher orderErrors={orderErrors} />
    </Box>
  );
}