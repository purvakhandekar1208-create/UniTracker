package com.unitracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "certificates")
@Data @NoArgsConstructor @AllArgsConstructor
public class Certificate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id")   private int    userId;
    private String title;
    private String provider;
    @Column(name = "issue_date") private String issueDate;

    // Legacy file-path column (kept for backward compat with existing rows)
    @Column(name = "file_path") private String filePath;

    // Base64 encoded file content — stored in DB, never on disk
    @Column(name = "file_data", columnDefinition = "LONGTEXT")
    private String fileData;

    // MIME type: application/pdf, image/png, image/jpeg
    @Column(name = "file_type", length = 100)
    private String fileType;
}
