package com.unitracker.repository;

import com.unitracker.entity.SgpaRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SgpaRecordRepository extends JpaRepository<SgpaRecord, Integer> {
    List<SgpaRecord>     findByUserId(int userId);
    Optional<SgpaRecord> findByUserIdAndSemester(int userId, int semester);
}
