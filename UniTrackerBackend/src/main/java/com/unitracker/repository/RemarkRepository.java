package com.unitracker.repository;
import com.unitracker.entity.MentorRemark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RemarkRepository extends JpaRepository<MentorRemark, Integer> {
    List<MentorRemark> findByMenteeId(int menteeId);
}
