import React from 'react'

import { BrowserRouter as Router } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { Main as AragonUI, useTheme } from '@aragon/ui'
import { ThemeProvider as MUIThemeProvider } from '@material-ui/core'
import { MUITheme, chakraTheme } from './theme'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { ChakraProvider } from '@chakra-ui/react'

import './App.css'

import AppContainer from './components/UI/AppContainer'
import InfoPanel from './components/Modals/InfoPanel'
import ErrorModal from './components/Modals/ErrorModal'
import WalletModal from './components/Modals/WalletModal'
import { Routes } from './Routes'

import { CurrenciesContextProvider } from './contexts/CurrenciesContext'

import { store } from './redux/store'
import AppLoader from './components/AppLoader'
import { Initializer } from './Initializer'

export const App: React.FC = () => {
  const aragonTheme = useTheme()

  return (
    <ReduxProvider store={store}>
      <CurrenciesContextProvider>
        <Router>
          <AragonUI assetsUrl={`${process.env.PUBLIC_URL}/aragon-ui`} theme="light" layout={false} scrollView={false}>
            <ChakraProvider theme={chakraTheme} resetCSS={true}>
              <Initializer />

              <MUIThemeProvider theme={MUITheme}>
                <StyledThemeProvider theme={aragonTheme}>
                  <AppLoader>
                    <AppContainer>
                      <InfoPanel />
                      <WalletModal />
                      <ErrorModal />
                      <Routes />
                    </AppContainer>
                  </AppLoader>
                </StyledThemeProvider>
              </MUIThemeProvider>
            </ChakraProvider>
          </AragonUI>
        </Router>
      </CurrenciesContextProvider>
    </ReduxProvider>
  )
}
