import { extendTheme } from '@chakra-ui/react'
import { createMuiTheme } from '@material-ui/core/styles'
import { createBreakpoints } from "@chakra-ui/theme-tools"

export const MUITheme = createMuiTheme({
  typography: {
    caption: {
      fontSize: '0.90rem',
    },
  },
})

const Button = {
  baseStyle: {
    borderRadius: '2rem',
    fontWeight: 'normal',
  },
  sizes: {
    md: {
      fontSize: '0.9rem',
      padding: '16px',
    },
  },
  variants: {
    outline: {
      border: '1px solid',
      borderColor: '#DDE4E9',
      boxShadow: 'base',
    },
    solid: {
      border: 'none',
      boxShadow: 'base',
    },
    strong: {
      bgGradient: 'linear(to-r, #aeb3ff, #eca2f9)',
    },
    link: {
      color: '#637381',
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'outline',
  },
}

const breakpoints = createBreakpoints({
  sm: "320px",
  md: "480px",
  lg: "960px",
  xl: "1200px",
  "2xl": "1400px",
})

const textStyles = {
  h1: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: ['1.3rem', '2rem', '3rem'],
  },
  h2: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: ['1.3rem', '2rem', '2.5rem'],
  },
  h3: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: ['1.1rem', '1.1rem', '1.2rem'],
    textTransform: 'uppercase',
  },
  h4: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 300,
    fontSize: ['1rem', '1rem', '1.5rem'],
  },
  semibold: {
    fontFamily: '"Lato", sans-serif',
    fontWeight: 400,
    fontSize: '1.1rem',
  },
  normal: {
    fontFamily: '"Lato", sans-serif',
    fontWeight: 300,
    fontSize: '1.1rem',
  },
  small: {
    fontFamily: '"Lato", sans-serif',
    fontWeight: 300,
    fontSize: ['0.7rem', '0.9rem'],
  },
  caption: {
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    textTransform: 'lowercase',
    fontSize: ['1rem', '1.2rem', '1.2rem', '1.2rem'],
    fontVariant: 'small-caps',
  },
  appName: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 300,
    textTransform: 'uppercase',
    letterSpacing: '0.14rem',
    lineHeight: 1,
    fontSize: ['1.8rem', '2rem', '2.5rem', '2.5rem'],
  },
  appPunchline: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
}

export const chakraTheme = extendTheme({
  styles: {
    global: {
      'html, body': {
        fontFamily: 'aragon-ui,sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        color: 'textColor',
        lineHeight: '1.5',
        background: 'backgroundColor',
        overflow: 'initial',
      },
    },
  },
  shadows: {
    base: '0 1px 3px rgb(0 0 0 / 10%)',
    medium:
      'rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px',
  },
  components: {
    Button,
  },
  textStyles,
  breakpoints,
  colors: {
    buttonDisabled: '#F1F3F7',
    textColor: '#212B36',
    backgroundColor: '#F9FAFC',
  },
})
