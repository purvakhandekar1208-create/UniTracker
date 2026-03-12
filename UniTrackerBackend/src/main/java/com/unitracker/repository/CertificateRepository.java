package com.unitracker.repository;
import com.unitracker.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificateRepository extends JpaRepository<Certificate, Integer> {
    List<Certificate> findByUserId(int userId);
}
