package com.unitracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "certificates")
@Data @NoArgsConstructor @AllArgsConstructor
public class Certificate {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id")    private int userId;
    private String title;
    private String provider;
    @Column(name = "issue_date") private String issueDate;
    @Column(name = "file_path")  private String filePath;
}

