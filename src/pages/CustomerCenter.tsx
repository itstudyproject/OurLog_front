import React from "react";
import { createGlobalStyle } from "styled-components";
import CustomerSupport from "../components/CustomerSuppert";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #000000;
  }
`;

const CustomerCenter: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <CustomerSupport />
    </>
  );
};

export default CustomerCenter;
