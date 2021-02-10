import { extendTheme } from '@chakra-ui/react';
import { createMuiTheme } from '@material-ui/core/styles';

export const MUITheme = createMuiTheme({
  typography: {
    caption: {
      fontSize: '0.90rem',
    },
  },
});

export const chakraTheme = extendTheme({
  styles: {
    global: {
      "html, body": {
        fontFamily: 'aragon-ui,sans-serif',
        fontSize: "16px",
        fontWeight: "400",
        color: "#212B36",
        lineHeight: "1.5",
        background: '#F9FAFC',
      },
    },
  },
})
