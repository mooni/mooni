import React from 'react';

import config from '../../config';

import { Button } from "@chakra-ui/react";
import { EmailIcon } from '@chakra-ui/icons';
import { IconChat } from '@aragon/ui';
import { Twitter } from '@material-ui/icons';

export const DiscordButton = ({ label= "Discord", ...props}) => (
  <Button variant="strong" bg={props.variant ? undefined : '#7388da'} color={props.variant ? undefined : 'white'} leftIcon={<IconChat />} onClick={() => window.open(config.discordInviteUrl)} {...props}>{label}</Button>
);

export const EmailButton = ({ label= "Mail", ...props}) => (
  <Button variant="outline" leftIcon={<EmailIcon />} onClick={() => window.open('mailto:contact@mooni.tech')} {...props}>{label}</Button>
);

export const TwitterButton = ({ label= "Twitter", ...props}) => (
  <Button variant="strong" bg="rgba(29,161,242,1.00)" leftIcon={<Twitter />} onClick={() => window.open('https://twitter.com/moonidapp')} {...props}>{label}</Button>
);