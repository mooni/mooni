import { extendTheme } from '@chakra-ui/react';
import { createMuiTheme } from '@material-ui/core/styles';

export const MUITheme = createMuiTheme({
  typography: {
    caption: {
      fontSize: '0.90rem',
    },
  },
});

const Button = {
  baseStyle: {
    borderRadius: '2rem',
    fontWeight: 'normal',
    boxShadow: 'base',
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
    },
    solid: {
      border: 'none',
      bg: '#b8b9bb',
      color: '#637381',
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'outline',
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
  },
  components: {
    Button,
  },
  colors: {
    buttonDisabled: "#F1F3F7",
    textColor: '#212B36',
    backgroundColor: '#F9FAFC',
  },
})
