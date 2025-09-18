package com.skcet.attendance.dto;

public class AttendanceInfo {
    private String staffId;
    private String staffName;
    private String className;
    private String sessionDate;
    private String period;
    private String startTime;
    private String endTime;
    private String courseId;

    private String courseName;      // ← add this
    private String location;        // ← add this
    private String attendanceType;  // ← add this

    public AttendanceInfo(String staffId, String staffName, String className, String sessionDate, String period,
                          String startTime, String endTime, String courseId, String courseName, String location,
                          String attendanceType) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.className = className;
        this.sessionDate = sessionDate;
        this.period = period;
        this.startTime = startTime;
        this.endTime = endTime;
        this.courseId = courseId;
        this.courseName = courseName;
        this.location = location;
        this.attendanceType = attendanceType;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(String sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAttendanceType() {
        return attendanceType;
    }

    public void setAttendanceType(String attendanceType) {
        this.attendanceType = attendanceType;
    }

    public AttendanceInfo() {
    }

    
}
