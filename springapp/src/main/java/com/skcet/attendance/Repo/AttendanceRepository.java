package com.skcet.attendance.Repo;

import com.skcet.attendance.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentEmail(String studentEmail);
    Optional<Attendance> findByEmailAndClassNameAndSessionDate(String email, String className, String sessionDate);

}
