import React from 'react'

import { motion } from "framer-motion"
import { Box, Flex, Link, Image, Text, IconButton, useDisclosure } from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'
import { Surface } from '../UI/StyledComponents'

export const Grant = () => {
  const { isOpen, onClose } = useDisclosure({defaultIsOpen: true });

  if(!isOpen) return null;

  return (
    <Flex
      position="fixed"
      bottom={{base: "80px", lg: '2rem'}}
      w="100vw"
      align="center"
      justify="center"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{ repeat: Infinity, duration: 3 }}
      >

        <Surface
          w="90vw"
          maxW="24rem"
          boxShadow="base"
          border="1px solid"
          borderColor="gray.200"
          p={4}
          position="relative"
        >
          <IconButton
            position="absolute"
            top={5}
            right={10}
            icon={<CloseIcon/>}
            isRound
            size="xs"
            fontSize="12px"
            variant="ghost"
            aria-label="close"
            onClick={onClose}
          />
          <Link
            href="https://gitcoin.co/grants/225/mooni"
            isExternal
          >
            <Flex
              direction="row"
              align="center"
              justify="center"
            >
              <Image
                src="images/illus/grants_planet.webp"
                boxSize="8rem"
                objectFit="contain"
              />
              <Box ml={4} pt={6}>
                <Text
                  textStyle="small"
                >
                  Support us on Gitcoin
                </Text>
                <Text
                  textStyle="small"
                  color="purple"
                >
                  It's Matching Round 9 !
                </Text>
              </Box>
            </Flex>
          </Link>
        </Surface>
      </motion.div>
    </Flex>
  );
}
