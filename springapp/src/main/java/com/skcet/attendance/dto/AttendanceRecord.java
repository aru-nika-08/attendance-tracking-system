package com.skcet.attendance.dto;

import java.time.LocalDateTime;

public class AttendanceRecord {
    private String id;
    private String email;
    private String studentName;
    private String className;
    private String status;
    private LocalDateTime timestamp;
    private String sessionId;
    private double confidence;
    public AttendanceRecord(String attendanceId, String email2, String currentUserEmail, String string, String status2,
            LocalDateTime now, String sessionId2, double confidence2) {
    }
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getStudentName() {
        return studentName;
    }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    public String getClassName() {
        return className;
    }
    public void setClassName(String className) {
        this.className = className;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    public double getConfidence() {
        return confidence;
    }
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
    
}


