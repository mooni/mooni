import React from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';

import { Tooltip, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { Button, IconCheck, IconClock, IconExternal, LoadingRing, useTheme, IconCross, Link } from '@aragon/ui';
import { useMediaQuery } from '@chakra-ui/react';

import { MooniOrder, MooniOrderStatus } from '../../types/api';
import { significantNumbers } from '../../lib/numbers';
import { ShadowBox } from '../UI/StyledComponents';
import { getEtherscanTxURL } from '../../lib/eth';
import { setInfoPanel } from '../../redux/ui/actions';
import { useMooniApi } from '../../hooks/api';

// @ts-ignore
const CustomTableContainer = styled(ShadowBox)`
  padding: 0px 5px;
`;
const CellText = styled.span`
  font-size: 12px;
`;
const OrdersHint = styled.p`
  font-size: 14px;
  text-align: center;
  font-style: italic;
  margin-top: 16px;
`;

interface OrderRowProps {
  order: MooniOrder;
}

const OrderStatusIcon: React.FC<OrderRowProps> = ({order}) => {
  const theme = useTheme();

  let tooltipText;
  if(order.status === MooniOrderStatus.CANCELLED) {
    tooltipText = 'Cancelled'
  } else if(order.status === MooniOrderStatus.PENDING) {
    tooltipText = 'Pending'
  } else {
    tooltipText = 'Executed'
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Tooltip title={tooltipText}>
        <Box display="flex" alignItems="center">
          {order.status === MooniOrderStatus.PENDING &&
          <IconClock size="medium" style={{ color: theme.disabledContent }}  />
          }
          {order.status === MooniOrderStatus.CANCELLED &&
          <IconCross size="medium" style={{ color: theme.negative }}  />
          }
          {order.status === MooniOrderStatus.EXECUTED &&
          <IconCheck size="medium" style={{ color: theme.positive }}/>
          }
        </Box>
      </Tooltip>
    </Box>
  );
};

const OrderRow: React.FC<OrderRowProps> = ({order}) => {
  const date = new Date(order.createdAt);
  const theme = useTheme();

  return (
    <TableRow>
      <TableCell component="th" scope="row" align="center">
        <Box display="flex" alignItems="center" justifyContent="center">
          <OrderStatusIcon order={order}/>
        </Box>
      </TableCell>
      <TableCell><CellText>{significantNumbers(order.inputAmount)} {order.inputCurrency}</CellText></TableCell>
      <TableCell><CellText>{significantNumbers(order.outputAmount)} {order.outputCurrency}</CellText></TableCell>
      <TableCell><CellText>{date.toLocaleDateString()} {date.toLocaleTimeString()}</CellText></TableCell>
      <TableCell>
        {order.txHash &&
        <Button href={getEtherscanTxURL(order.txHash)} size="mini" display="all" icon={<IconExternal style={{color: theme.accent}}/>} />
        }
      </TableCell>
    </TableRow>
  );
};

export default function OrderHistory() {
  const dispatch = useDispatch();
  const [isSmall] = useMediaQuery("(max-width: 960px)")
  const { data, error } = useMooniApi('/orders');

  if (error) return <Box>Failed to load orders</Box>;
  if (!data) return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <p>Loading orders...</p>
      <Box m={1}/>
      <LoadingRing mode="half-circle" />
    </Box>
  );

  const orders = data as MooniOrder[];

  return (
    <Box width={1} mx={2}>
      {orders.length > 0 ?
        <TableContainer component={CustomTableContainer}>
          <Table aria-label="order history" size={isSmall ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell align="center">Status</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>TX</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => <OrderRow order={order} key={order.id}/>)}
            </TableBody>
          </Table>
        </TableContainer>
        :
        <Box textAlign="center">
          You didn't make any orders.
        </Box>
      }
      <OrdersHint>
        If you have any issues with an order, please contact the
        <Link onClick={() => dispatch(setInfoPanel('support'))} style={{ textDecoration: 'none', fontStyle: 'italic' }}>
          &nbsp;support
        </Link>
        .
      </OrdersHint>
    </Box>
  );
}
