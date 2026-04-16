package com.unitracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentor_batches")
@Data @NoArgsConstructor @AllArgsConstructor
public class MentorBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "mentor_id", nullable = false) private int    mentorId;
    @Column(nullable = false)                      private String batch;
    private String division;
}
