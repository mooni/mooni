import React from 'react';
import styled from 'styled-components';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Flex,
  Image,
} from "@chakra-ui/react"

import { HamburgerIcon } from '@chakra-ui/icons'
import { IconChip, IconFile, IconInfo, IconChat, IconLayers } from '@aragon/ui'
import MenuBookIcon from '@material-ui/icons/MenuBookOutlined';

import ContactSupportIcon from '@material-ui/icons/ContactSupportOutlined';
import AccountBadge from './Account/AccountBadge';
import { NavLink } from './UI/StyledComponents';
import { DiscordButton } from './UI/Tools';
import { getWalletStatus } from "../redux/wallet/selectors";
import { useSelector, useDispatch } from 'react-redux';
import { WalletStatus } from "../redux/wallet/state";
import { setInfoPanel } from '../redux/ui/actions';
import config from '../config';

const HeaderRoot = styled.div`
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: space-between;
`;

const HeaderSubRoot = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  flex-direction: row;
  width: 100%;
  top: 0px;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.5rem 1rem;
  z-index: 2;
  background-color: ${props => props.theme.surface};

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    padding: 0px 0.5rem;
    width: calc(100%);
    position: relative;
  }
`;

const MainHeader = styled.div`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  display: flex;
  padding: 0px;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: start;
  justify-content: flex-start;
  width: fit-content;
  @media (max-width: 960px) {
    width: 100%;
  }
`;

const SecondaryHeader = styled.div`
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  justify-self: flex-end;
  @media (max-width: 960px) {
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
    justify-self: center;
    max-width: 960px;
    padding: 1rem;
    position: fixed;
    bottom: 0px;
    left: 0px;
    width: 100%;
    z-index: 2;
    height: 72px;
    border-radius: 12px 12px 0px 0px;
    background-color: ${props => props.theme.surface};
  }
`;

const RoutesContainer = styled.div`
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  width: 100%;
  display: flex;
  padding: 0px;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  @media (max-width: 960px) {
    padding: 1rem 0px 1rem 1rem;
    -webkit-box-pack: end;
    justify-content: flex-end;
  }
`;

const RouteLink = styled(NavLink)`
  outline: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 1rem;
  margin: 0 12px;
  color: ${props => props.theme.surfaceContentSecondary};
  font-weight: 500;
  &.active {
    font-weight: 600;
    color: ${props => props.theme.surfaceContent};
  }
  @media (max-width: 500px) {
    font-size: 0.9rem;
    margin: 0 4px;
  }
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  margin-left: 12px;
  margin-right: 24px;
  > img {
    margin-right: 12px;
  }
  > h1 {
    font-family: 'Montserrat', sans-serif;
    text-transform: uppercase;
    font-size: 1.8rem;
    font-weight: 300;
    letter-spacing: 0.14rem;
    color: black;
    text-decoration: none;
    @media (max-width: 500px) {
      font-size: 1.5rem;
    }
  }

  > span {
    text-transform: uppercase;
    position: relative;
    color: #18b37b;
    font-size: 9px;
    top: -11px;
    right: -2px;
    @media (max-width: 500px) {
      font-size: 7px;
    }
  }
`;

export default function Header() {
  const dispatch = useDispatch();
  const walletStatus = useSelector(getWalletStatus);
  return (
    <HeaderRoot>
      <HeaderSubRoot>
        <MainHeader>
          <NavLink to="/">
            <LogoBox>
              <Image
                src="/images/logos/logo_blue_bg.svg"
                boxSize={8}
                alt="mooni logo loader"
              />
              <h1>
                MOONI
              </h1>
              <span>
                beta
              </span>
            </LogoBox>
          </NavLink>
          <RoutesContainer>
            {walletStatus === WalletStatus.CONNECTED &&
            <>
              <RouteLink to="/order" activeClassName="active">Exchange</RouteLink>
              <RouteLink to="/account" activeClassName="active">Account</RouteLink>
            </>
            }
            <RouteLink to="/stats" activeClassName="active">Stats</RouteLink>
          </RoutesContainer>
        </MainHeader>

        <SecondaryHeader>
          <AccountBadge />
          <Flex ml={2}>
            <Box mr={2}>
              <DiscordButton variant="outline" label="Chat"/>
            </Box>
            <Menu>
              <MenuButton as={Button} variant="outline">
                <HamburgerIcon/>
              </MenuButton>
              <MenuList borderRadius="1rem" minWidth="8rem">
                <MenuItem icon={<IconInfo/>} onClick={() => dispatch(setInfoPanel('about'))}>About</MenuItem>
                <MenuItem paddingLeft="1rem" icon={<MenuBookIcon fontSize="small"/>} onClick={() => window.open('https://doc.mooni.tech')}>Docs</MenuItem>
                <MenuItem paddingLeft="1rem" icon={<ContactSupportIcon fontSize="small"/>} onClick={() => dispatch(setInfoPanel('support'))}>Support</MenuItem>
                <MenuItem icon={<IconChip/>} onClick={() => window.open('https://github.com/pakokrew/mooni')}>Code</MenuItem>
                <MenuItem icon={<IconFile/>} onClick={() => dispatch(setInfoPanel('terms'))}>Terms</MenuItem>
                <MenuItem icon={<IconChat/>} onClick={() => window.open(config.discordInviteUrl)}>Discord</MenuItem>
                <MenuItem icon={<IconLayers/>} onClick={() => window.open('https://blog.mooni.tech')}>Blog</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </SecondaryHeader>
      </HeaderSubRoot>
    </HeaderRoot>
  );
}

