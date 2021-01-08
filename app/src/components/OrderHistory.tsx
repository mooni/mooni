import React from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { Box, TableContainer, Table, TableRow, TableBody, TableHead, TableCell } from '@material-ui/core';
import {
  IconCheck,
  useTheme,
  IconEllipsis,
} from '@aragon/ui'

import Api from '../lib/apiWrapper';
import { getJWS } from '../redux/wallet/selectors';
import { MooniOrder, MooniOrderStatus } from '../types/api';
import { truncateNumber } from '../lib/numbers';
import { ShadowBox } from './StyledComponents';

const CustomTableContainer = styled(ShadowBox)`
  padding: 0px 5px;
`;

interface OrderRowProps {
  order: MooniOrder;
}

const OrderRow: React.FC<OrderRowProps> = ({order}) => {
  const theme = useTheme();

  const date = new Date(order.createdAt);
  return (
    <TableRow>
      <TableCell component="th" scope="row">
        {order.status === MooniOrderStatus.PENDING && <IconEllipsis size="medium" style={{ color: theme.disabledContent }}  />}
        {order.status === MooniOrderStatus.EXECUTED && <IconCheck size="medium" style={{ color: theme.positive }}/>}
      </TableCell>
      <TableCell>{truncateNumber(order.inputAmount)}{order.inputCurrency}</TableCell>
      <TableCell>{truncateNumber(order.outputAmount)}{order.outputCurrency}</TableCell>
      <TableCell>{date.toLocaleDateString()} {date.toLocaleTimeString()}</TableCell>
    </TableRow>
  );
};

export default function OrderHistory() {
  const jwsToken = useSelector(getJWS);
  const { data, error } = useSWR(jwsToken, Api.getOrders);

  if (error) return <Box>Failed to load orders</Box>;
  if (!data) return <Box>Loading orders...</Box>;

  const orders = data as MooniOrder[];

  return (
    <Box width={1} mx={2}>
      {orders.length > 0 ?
          <TableContainer component={CustomTableContainer}>
            <Table aria-label="order history">
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map(order => <OrderRow order={order} key={order.id}/>)}
              </TableBody>
            </Table>
          </TableContainer>
        :
        <Box>
          You didn't make any orders.
        </Box>
      }
    </Box>
  );
}
