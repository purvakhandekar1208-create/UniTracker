package com.unitracker.repository;
import com.unitracker.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Integer> {
    List<Course> findByUserId(int userId);
}
