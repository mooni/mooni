import React from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, Box } from '@material-ui/core';
import { Link, Button, IconUser, IconCoin } from '@aragon/ui'

import RateSample from '../components/RateSample';
import Footer from '../components/Footer';

const logoStyle = {
  fontSize: '5rem',
  cursor: 'default',
};

function Welcome() {
  const history = useHistory();

  const go = path => () => history.push(path);

  return (
    <Box width={1} py={2}>
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" style={logoStyle} className="noselect">
        🌚
      </Box>
      <Box display="flex" justifyContent="center" textAlign="center" fontSize="h6.fontSize">
        Easily transfer funds from your crypto wallet to your bank account.
      </Box>
      <RateSample />
      <Box pt={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={go('/send')} wide label="Send funds" icon={<IconCoin/>} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={go('/my-account')} wide label="My Account" icon={<IconUser/>} />
          </Grid>
          {/*<Grid item xs={12} sm={4}>
              <Button mode="strong" onClick={go('/contacts')} wide label="Contacts" icon={<IconGroup/>} />
            </Grid>*/}
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
