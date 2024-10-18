import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const ExchangeRatesChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState([]);
  const [dates, setDates] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const currentDate = new Date();
      const promises = [];
      const dateArray = [];

      // Make 7 API requests for the past 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, "");

        promises.push(
          axios.get(
            `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`,
          ),
        );

        dateArray.push(date.toISOString().slice(0, 10)); // Store the date for labels
      }

      try {
        const results = await Promise.all(promises);
        const ratesData = results.map((response) => response.data);
        setExchangeRates(ratesData);
        setDates(dateArray.reverse()); // Reverse dates to show oldest to newest

        // Set unique currencies based on the first response
        if (ratesData.length > 0) {
          const uniqueCurrencies = ratesData[0].map((rate) => rate.cc);
          setCurrencies(uniqueCurrencies);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Prepare the chart datasets for all currencies
  const chartData = {
    labels: dates, // X-axis labels (dates)
    datasets: currencies.map((currencyCode) => {
      const currencyRates = exchangeRates.map(
        (dailyRates) =>
          dailyRates.find((rate) => rate.cc === currencyCode)?.rate || 0,
      );

      return {
        label: `Exchange Rate for ${currencyCode}`,
        data: currencyRates, // Y-axis data (rates)
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`, // Random color for each currency
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
        fill: true,
        tension: 0.4,
      };
    }),
  };

  return (
    <Container style={{ width: "1000%", height: "1000%", padding: 0 }}>
      <Typography variant="h4" gutterBottom>
        Exchange Rates for the Past 7 Days (All Currencies)
      </Typography>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <Line
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ExchangeRatesChart;
