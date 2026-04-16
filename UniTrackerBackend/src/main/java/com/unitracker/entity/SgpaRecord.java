package com.unitracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sgpa_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "semester"}))
@Data @NoArgsConstructor @AllArgsConstructor
public class SgpaRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id",  nullable = false) private int    userId;
    @Column(name = "semester", nullable = false) private int    semester;
    private Double sgpa;
    private Double cgpa;
}
