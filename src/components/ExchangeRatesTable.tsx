import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  Box,
  TextField,
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

type CC = {
  r030: number;
  txt: string;
  rate: number;
  cc: string;
  exchangedate: string;
};

const ExchangeRatesTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [exchangeRates, setExchangeRates] = useState<CC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    dayjs(searchParams.get("date") || new Date()),
  ); // Initial date

  function bufferedSetSelectedDate(date) {
    setSelectedDate(date);
    setSearchParams({ date: date.format("YYYYMMDD") });
  }

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const formattedDate = date.format("YYYYMMDD"); // Format the date as required by the API
      const response = await axios.get<CC[]>(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`,
      );
      setExchangeRates(
        response.data.sort((a, b) => {
          const priority = (cc) => {
            switch (cc) {
              case "USD":
                return 0; // Always first
              case "EUR":
                return 1; // Always second
              default:
                return 2; // Everything else follows
            }
          };
          return priority(a.cc) - priority(b.cc);
        }),
      );
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate); // Fetch data for the initial date
  }, [selectedDate]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container>
        <Typography variant="h4" gutterBottom>
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newDate) => bufferedSetSelectedDate(newDate)}
            format="YYYY-MM-DD"
          />
        </Typography>
        <TextField
          id="standard-basic"
          label="Search"
          variant="standard"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value.toLowerCase());
          }}
        />
        <TableContainer component={Paper} style={{ marginTop: 16 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Rate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exchangeRates.map((rate) => {
                // {rate.cc.toLowerCase().startsWith(search) || rate.txt.toLowerCase().startsWith(search) && (
                return (
                  (rate.cc.toLowerCase().includes(search) ||
                    rate.txt.toLowerCase().includes(search)) && (
                    <TableRow key={rate.r030}>
                      <TableCell>{rate.txt}</TableCell>
                      <TableCell>{rate.cc}</TableCell>
                      <TableCell>{rate.rate}</TableCell>
                    </TableRow>
                  )
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default ExchangeRatesTable;
