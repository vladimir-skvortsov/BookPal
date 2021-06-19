import { createGlobalStyle } from 'styled-components'


const GlobalStyle = createGlobalStyle<any>`
  body {
    font: 300 12pt sans-serif;
    background: ${({ theme: { primaryColor } }) => primaryColor};
    color: ${({ theme: { fontColor } }) => fontColor};
    line-height: 1.5;
    overflow-x: ${process.env.NODE_ENV === 'production' ? 'hidden' : 'auto'};
    box-sizing: border-box;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
  ::selection {
    background: ${({ theme: { accentColor } }) => accentColor};
    color: white;
    text-shadow: none;
  }
  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme: { primaryColor } }) => primaryColor};
    border-left: 1px solid #e6e6e6;
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme: { lightenFontColor } }) => lightenFontColor};
  }
`


export default GlobalStyle