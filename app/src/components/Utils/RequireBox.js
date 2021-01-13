import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, LoadingRing, Modal} from '@aragon/ui';
import Box from '@material-ui/core/Box';

import {cancelInitBox, initBox} from '../../redux/box/actions';
import {getBoxLoading} from '../../redux/box/selectors';
import { logError } from '../../lib/log';

function BoxLoading() {
  const dispatch = useDispatch();

  function cancel() {
    dispatch(cancelInitBox());
  }
  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
      <img src="images/3box-3.svg" alt="3box-logo" width={40} />
      <Box
        fontSize={14}
        width={1}
        textAlign="center"
        mt={1}
      >
        Loading 3Box user data...
      </Box>
      <Box
        fontSize={14}
        width={1}
        textAlign="center"
      >
        You may need to sign messages in your wallet.
      </Box>
      <Box display="flex" justifyContent="flex" mb={2}>
        <LoadingRing/>
      </Box>
      <Button mode="negative" onClick={cancel}>Cancel</Button>
    </Box>
  );
}

export function BoxModal({ visible, onClose }) {
  const dispatch = useDispatch();

  function enableBox(){
    onClose();
    dispatch(initBox()).catch(logError);
  }

  return (
    <Modal
      visible={visible}
      closeButton={false}
      width={300}
      padding={16}
    >
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" width={1} p={2}>
        <Box
          fontSize={14}
          width={1}
          textAlign="center"
          mb={2}
        >
          To save your bank account informations, you need to connect to 3Box.
        </Box>
        <Box display="flex" justifyContent="space-between" width={1}>
          <Button mode="negative" wide onClick={onClose}>Cancel</Button>
          <Box width={10}/>
          <Button mode="positive" wide onClick={enableBox}>Connect</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export function BoxLoadingContainer({ children }) {
  const boxLoading = useSelector(getBoxLoading);

  if(boxLoading) {
    return (
      <BoxLoading />
    )
  } else {
    return children;
  }
}
