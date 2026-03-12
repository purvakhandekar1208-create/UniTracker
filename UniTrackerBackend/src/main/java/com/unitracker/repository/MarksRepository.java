package com.unitracker.repository;
import com.unitracker.entity.Marks;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Integer> {
    List<Marks> findByUserId(int userId);
}
