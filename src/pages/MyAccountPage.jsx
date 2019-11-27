import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box as ABox } from '@aragon/ui'

import Loader from '../components/Loader';
import RecipientForm from '../components/RecipientForm';

import { getMyAccount, getMyAccountLoading } from '../redux/contacts/selectors';
import { getBoxManager } from '../redux/box/selectors';
import { updateMyAccount } from '../redux/contacts/actions';

function MyAccountPage() {
  const boxManager = useSelector(getBoxManager);
  const myAccount = useSelector(getMyAccount);
  const myAccountLoading = useSelector(getMyAccountLoading);

  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  async function saveMyAccount(myAccount) {
    setSaving(true);
    if(!boxManager) throw new Error('boxManager not ready');
    dispatch(updateMyAccount(myAccount));
    setSaving(false);
  }

  if(myAccountLoading) {
    return <Loader text="Loading account..." />;
  }

  return (
    <ABox>
      My Account
      <RecipientForm initialRecipient={myAccount} onSubmit={saveMyAccount}/>
      {saving && 'Saving ...'}
    </ABox>
  );
}

export default MyAccountPage;
