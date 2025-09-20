package com.skcet.attendance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skcet.attendance.Entity.Attendance;
import com.skcet.attendance.Repo.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AttendanceService {

    private final AttendanceRepository repo;

    public AttendanceService(AttendanceRepository repo) {
        this.repo = repo;
    }

    // ---------------------------
    // 1️⃣ Old method for /mark
    // ---------------------------
    public boolean markAttendance(String studentEmail,
                                  String staffId,
                                  String staffName,
                                  String className,
                                  String sessionDate,
                                  String period,
                                  boolean present) {
        try {
            Attendance att = new Attendance();
            att.setStudentEmail(studentEmail);
            att.setStaffId(staffId);
            att.setStaffName(staffName);
            att.setClassName(className);
            att.setSessionDate(sessionDate);
            att.setPeriod(period);
            att.setPresent(present);

            repo.save(att);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // ---------------------------
    // 2️⃣ Token-based attendance
    // ---------------------------
    public boolean markAttendanceFromToken(String studentEmail, String token) {
        try {
            // Decode Base64 JSON token
            String json = new String(Base64.getDecoder().decode(token));
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> payload = mapper.readValue(json, Map.class);

            // Create attendance record
            Attendance att = new Attendance();
            att.setStudentEmail(studentEmail);
            att.setStaffId(payload.get("staffId"));
            att.setStaffName(payload.get("staffName"));
            att.setClassName(payload.get("className"));
            att.setSessionDate(payload.get("sessionDate"));
            att.setPeriod(payload.get("period"));
            att.setPresent(true);

            // Save to database
            repo.save(att);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // ---------------------------
    // 3️⃣ Stats for student
    // ---------------------------
    public Map<String, Integer> getStatsForStudent(String studentEmail) {
        int total = repo.countByStudentEmail(studentEmail);
        int present = repo.countByStudentEmailAndPresentTrue(studentEmail);
        int absent = repo.countByStudentEmailAndPresentFalse(studentEmail);
        int late = 0; // Optional: if you track late separately, implement logic

        Map<String, Integer> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("present", present);
        stats.put("absent", absent);
        stats.put("late", late);

        return stats;
    }
    public List<Attendance> getClassAttendance(String className, String date, String period) {
    return repo.findByClassNameAndSessionDateAndPeriod(className, date, period);
}

}
