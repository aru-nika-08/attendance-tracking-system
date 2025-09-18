import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { attendanceAPI } from "../services/api";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";

const MarkAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await attendanceAPI.getAllAttendance();
        setRecords(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch attendance records");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Attendance Records
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Session</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.attendanceId}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.sessionId}</TableCell>
                  <TableCell>
                    {r.status ? r.status : "absent"} {/* default absent */}
                  </TableCell>
                  <TableCell>{r.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Box mt={2}>
        <Button variant="contained" onClick={handleGoDashboard}>
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default MarkAttendance;
