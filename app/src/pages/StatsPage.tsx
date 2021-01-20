import React from 'react';
import { Grid } from '@material-ui/core';
import {textStyle, LoadingRing} from '@aragon/ui'
import useSWR from 'swr';
import { MediumWidth, ShadowBox, FlexCenterBox } from '../components/UI/StyledComponents';
import styled from 'styled-components';
import Api from '../lib/apiWrapper';
import { BN, truncateNumber } from '../lib/numbers';

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
  const { data, error } = useSWR('1', Api.getStats);

  if (error) return <div>Failed to load stats</div>;

  return (
    <MediumWidth>
      <Title>
        Stats
      </Title>
      {data ?
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <StatItem
              title="Executed orders"
              value={data.ordersCount}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatItem
              title="ETH exchanged"
              value={`${truncateNumber(data.totalETH)} ETH`}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatItem
              title="EUR cashed out"
              value={new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(new BN(data.totalEUR).toNumber())}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatItem
              title="CHF cashed out"
              value={new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CHF' }).format(new BN(data.totalCHF).toNumber())}
            />
          </Grid>
        </Grid>
        :
        <FlexCenterBox>
          <LoadingRing mode="half-circle" />
        </FlexCenterBox>
      }

    </MediumWidth>
  );
}
