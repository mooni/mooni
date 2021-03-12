import React, { useEffect, useRef } from 'react'

import { useDispatch } from 'react-redux'

import { useToast } from "@chakra-ui/react"

import { initReferral } from './redux/payment/actions'
import { autoConnect } from './redux/wallet/actions'

export const Initializer: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast()
  const calledOnce = useRef(false);

  useEffect(() => {
    if (calledOnce.current) {
      return;
    }
    calledOnce.current = true;

    dispatch(autoConnect())

    dispatch(initReferral())
      .then(isReferred => {
        if(isReferred) {
          toast({
            title: "Referral",
            description: "Your referral code has been taken in account.",
            status: "success",
            position: 'bottom-right',
            duration: 6000,
            isClosable: true,
          })
        }
      })
      .catch(_ => {
        toast({
          title: "Referral",
          description: "Invalid referral code",
          status: "error",
          position: 'bottom-right',
          duration: 6000,
          isClosable: true,
        })
      });
  }, [dispatch, toast])

  return null;
}
