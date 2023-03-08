import { createGlobalStyle } from "styled-components";
import { calcRem, theme } from "./theme";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Tenada';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2210-2@1.0/Tenada.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  * {    
    box-sizing: border-box;
    font-family: 'Noto Sans KR', sans-serif;
    color: ${theme.black};
    -webkit-tap-highlight-color: transparent;
  }

  html {
    font-size: 14px;
  }

  html, body {
    box-sizing: border-box;
    margin: 0 auto;
    background-color: ${theme.white};
  }
  
  body {
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }

  ul, ol, li {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  p {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
  }

  .a11y-hidden {
    overflow: hidden;
    position: absolute;
    clip: rect(0, 0, 0, 0);
    clip-path: circle(0);
    width: 1px;
    height: 1px;
    margin: -1px;
    border: 0;
    padding: 0;
    white-space: nowrap;
  }
`;

export default GlobalStyle;
