import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Grid, Box } from '@material-ui/core';
import { Link, Button, IconUser, IconCoin } from '@aragon/ui'

import RateForm from '../components/RateForm';
import Footer from '../components/Footer';
import { setAmountDetail } from '../redux/payment/actions';

const logoStyle = {
  fontSize: '5rem',
  cursor: 'default',
};

function Welcome() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [rateRequest, setRateRequest] = useState(null);

  const onGoToSend = () => {
    if(rateRequest) {
      dispatch(setAmountDetail(rateRequest));
    }
    history.push('/send');
  };

  return (
    <Box width={1} py={2}>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" style={logoStyle} className="noselect">
        <span role="img" aria-label="mooni-logo">🌚</span>
      </Box>
      <Box display="flex" justifyContent="center" textAlign="center" fontSize="h6.fontSize">
        Easily transfer funds from your crypto wallet to your bank account.
      </Box>
      <RateForm onChange={setRateRequest}/>
      <Box pt={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={onGoToSend} wide label="Send funds" icon={<IconCoin/>} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={() => history.push('/my-account')} wide label="My Account" icon={<IconUser/>} />
          </Grid>
        </Grid>
      </Box>
      <Box textAlign="center" py={2}>
        <Box fontSize={14} color="text.secondary" fontWeight="fontWeightLight" fontStyle="oblique">
          Powered by
        </Box>
      </Box>
      <Grid container justify="center" alignItems="center" spacing={4}>
        <Grid item>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://bity.com" external>
              <img src="images/bity_logo_blue.svg" alt="bity.com" height={30} />
            </Link>
          </Box>
        </Grid>
        {/*<Grid item xs={12} sm>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://dex.ag" external>
              <img src="images/dexag.svg" alt="dex.ag" height={30} />
            </Link>
          </Box>
        </Grid>*/}
        <Grid item>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Link href="https://3box.io" external>
              <img src="images/3box.svg" alt="3box.io" height={30} />
            </Link>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </Box>
  );
}

export default Welcome;
