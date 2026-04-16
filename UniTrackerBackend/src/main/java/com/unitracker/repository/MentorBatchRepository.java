package com.unitracker.repository;

import com.unitracker.entity.MentorBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MentorBatchRepository extends JpaRepository<MentorBatch, Integer> {
    List<MentorBatch>     findByMentorId(int mentorId);
    Optional<MentorBatch> findByMentorIdAndBatch(int mentorId, String batch);
    List<MentorBatch>     findByBatch(String batch);
    void                  deleteByMentorIdAndBatch(int mentorId, String batch);
}
