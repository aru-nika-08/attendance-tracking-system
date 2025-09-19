package com.skcet.attendance.Repo;

import com.skcet.attendance.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentEmail(String studentEmail);
}
