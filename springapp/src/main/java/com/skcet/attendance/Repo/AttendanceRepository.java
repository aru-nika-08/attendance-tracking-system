package com.skcet.attendance.Repo;

import com.skcet.attendance.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Total classes recorded for a student
    int countByStudentEmail(String studentEmail);

    // Count present classes
    int countByStudentEmailAndPresentTrue(String studentEmail);

    // Count absent classes
    int countByStudentEmailAndPresentFalse(String studentEmail);

    // Optional: fetch all attendance for a student
    List<Attendance> findByStudentEmail(String studentEmail);

    List<Attendance> findByClassNameAndSessionDateAndPeriod(String className, String sessionDate, String period);

}
