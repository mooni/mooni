import React, { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useToast } from "@chakra-ui/react"

import { initReferral } from './redux/payment/actions'
import { autoConnect } from './redux/wallet/actions'

export const Initializer: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast()

  useEffect(() => {
    dispatch(autoConnect())

    dispatch(initReferral())
      .then(isReferred => {
        if(isReferred) {
          toast({
            title: "Referral",
            description: "Your referral code have been taken in account.",
            status: "success",
            position: 'bottom-right',
            duration: 4000,
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
          duration: 4000,
          isClosable: true,
        })
      });
  }, [dispatch])

  return null;
}
