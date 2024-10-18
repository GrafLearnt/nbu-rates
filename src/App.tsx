import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import ExchangeRatesTable from "./components/ExchangeRatesTable";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Router>
          <ExchangeRatesTable />
        </Router>
        <footer style={{ margin: "1em" }}>
          <a
            className="github-button"
            href="https://github.com/graflearnt"
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-size="large"
            aria-label="Follow @graflearnt on GitHub"
          >
            Follow @graflearnt
          </a>
        </footer>
      </ThemeProvider>
    </>
  );
}

export default App;
