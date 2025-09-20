import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI } from '../services/api';
import {
  Container, Paper, Box, Typography, Button, Alert, CircularProgress,
  AppBar, Toolbar, Card, CardContent, Grid, Chip, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { QrCodeScanner, History, CheckCircle, Schedule, Cancel } from '@mui/icons-material';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total:0, present:0, late:0, absent:0 });

  const token = new URLSearchParams(location.search).get('token');
  const marked = new URLSearchParams(location.search).get('marked');

  useEffect(()=>{
    if(marked){
      setError('Attendance marked ✅');
      navigate('/student',{replace:true});
    }
  },[marked]);

  useEffect(()=>{
    if(!user) return;
    const markOrLoad = async ()=>{
      try{
        setLoading(true);

        if(token){
          await attendanceAPI.markAttendanceToken(user.email, token);
          navigate('/student?marked=1',{replace:true});
        }

        const res = await attendanceAPI.getStudentAttendance(user.email);
        const data = Array.isArray(res.data)?res.data:[];
        setAttendance(data);

        const total = data.length;
        const present = data.filter(r=>r.present===true).length;
        const absent = data.filter(r=>r.present===false).length;
        const late = data.filter(r=>r.status==='late').length;
        setStats({total,present,late,absent});

      } catch(err){
        console.error(err);
        setError('Failed to load/mark attendance');
      } finally{
        setLoading(false);
      }
    }
    markOrLoad();
  },[user,token]);

  const handleLogout = async ()=>{ try{await logout()}catch(err){console.error(err)} }
  const formatDate = ts => ts?new Date(ts).toLocaleString():'-';
  const getStatusIcon = (r) => r.present?<CheckCircle color="success"/>:r.status==='late'?<Schedule color="warning"/>:<Cancel color="error"/>;
  const getStatusColor = (r) => r.present?'success':r.status==='late'?'warning':'error';
  const percentage = stats.total>0?Math.round((stats.present/stats.total)*100):0;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{flexGrow:1}}>Student Dashboard</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{mt:2}}>
        {error && <Alert severity="error" sx={{mb:2}}>{error}</Alert>}

        <Paper elevation={3} sx={{p:3,mb:3,textAlign:'center'}}>
          <Typography variant="h4" gutterBottom>Welcome, {user?.displayName||user?.email}</Typography>
          <Typography color="text.secondary" sx={{mb:2}}>Track attendance & scan QR</Typography>
          <Button variant="contained" startIcon={<QrCodeScanner/>} onClick={()=>navigate('/scan')} sx={{mr:2}}>Scan QR</Button>
          <Button variant="outlined" startIcon={<History/>} onClick={()=>attendanceAPI.getStudentAttendance(user.email)} disabled={loading}>Refresh</Button>
        </Paper>

        <Grid container spacing={3} sx={{mb:3}}>
          {[
            {label:'Total Classes', value:stats.total},
            {label:'Present', value:stats.present,color:'success.main'},
            {label:'Late', value:stats.late,color:'warning.main'},
            {label:'Attendance %', value:percentage+'%', color:'primary.main'}
          ].map((c,i)=>(
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent sx={{textAlign:'center'}}>
                  <Typography color="text.secondary">{c.label}</Typography>
                  <Typography variant="h4" sx={{color:c.color||'text.primary'}}>{c.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={3} sx={{p:3}}>
          <Typography variant="h5" gutterBottom>Attendance History</Typography>
          {loading?<Box display="flex" justifyContent="center" p={3}><CircularProgress/></Box>:(
            <List>
              {attendance.map((r,i)=>(
                <React.Fragment key={i}>
                  <ListItem>
                    {getStatusIcon(r)}
                    <ListItemText
                      primary={<Box display="flex" gap={1}>{formatDate(r.markedAt)} <Chip label={r.status||(r.present?'present':'absent')} color={getStatusColor(r)} size="small"/></Box>}
                      secondary={r.courseName||r.className||'Class Attendance'}
                    />
                  </ListItem>
                  {i<attendance.length-1 && <Divider />}
                </React.Fragment>
              ))}
              {!attendance.length && <Typography align="center" color="text.secondary" sx={{py:4}}>No records</Typography>}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
