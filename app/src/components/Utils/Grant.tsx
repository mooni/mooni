import React from 'react'
import { Flex, Link, Image, Text, IconButton, useDisclosure } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { Surface } from '../UI/StyledComponents'

export const Grant = () => {
  const { isOpen, onClose } = useDisclosure({defaultIsOpen: true });

  if(!isOpen) return null;

  return (
    <Surface
      position="fixed"
      left="1.5rem"
      bottom={{base: "80px", lg: '1.5rem'}}
      w={{base: "10rem", lg: '12rem'}}
      boxShadow="base"
      p={4}
    >
      <IconButton
        position="absolute"
        top={5}
        left={5}
        icon={<CloseIcon/>}
        isRound
        size="xs"
        fontSize="12px"
        variant="ghost"
        onClick={onClose}
      />
      <Link
        href="https://gitcoin.co/grants/225/mooni"
        isExternal
      >
        <Flex align="center" direction="column">
          <Image
            src="images/illus/grants_planet.webp"
            boxSize={{base: "6rem", lg: '12rem'}}
            objectFit="contain"
            ml={4}
          />
          <Text
            textStyle="small"
            fontSize={{base: "0.7rem", md: '0.9rem'}}
          >
            Support us on Gitcoin
          </Text>
        </Flex>
      </Link>
    </Surface>
  );
}
