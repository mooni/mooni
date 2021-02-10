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
    borderRadius: '1rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sizes: {
    md: {
      fontSize: '16px',
      padding: '16px',
    },
  },
  variants: {
    outline: {
      border: '2px solid',
      borderColor: 'gray.00',
    },
    solid: {
      border: 'none',
      bg: '#b8b9bb',
      color: 'white',
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
        color: '#212B36',
        lineHeight: '1.5',
        background: '#F9FAFC',
        overflow: 'initial',
      },
    },
  },
  components: {
    Button,
  },
})
