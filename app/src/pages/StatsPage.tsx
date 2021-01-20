import React from 'react';
import { Grid } from '@material-ui/core';
import {textStyle} from '@aragon/ui'
import { MediumWidth, ShadowBox, SmallWidth } from '../components/UI/StyledComponents';
import styled from 'styled-components';

// @ts-ignore
const StatItemBox = styled(ShadowBox)`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 16px;
`;

const Title = styled.p`
  ${textStyle('title2')};
  margin-bottom: 24px;
  text-align: center;
`;
const StatItemTitle = styled.span`
  ${textStyle('title4')};
  margin-bottom: 16px;
`;
const StatItemContent = styled.span`
  ${textStyle('body2')};
`;

function StatItem({title, value}) {
  return (
    <StatItemBox>
      <StatItemTitle>{title}</StatItemTitle>
      <StatItemContent>{value}</StatItemContent>
    </StatItemBox>
  )
}

export default function StatsPage() {

  return (
    <MediumWidth>
      <Title>
        Stats
      </Title>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6}>
          <StatItem
            title="Transactions"
            value="124"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatItem
            title="ETH exchanged"
            value="12.230€"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatItem
            title="Euro cashed out"
            value="12.230€"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatItem
            title="CHF cashed out"
            value="432.230 CHF"
          />
        </Grid>
      </Grid>
    </MediumWidth>
  );
}
