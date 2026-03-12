package com.unitracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id")     private int userId;
    @Column(name = "course_name") private String courseName;
    private String provider;
    private int progress;
    private String status;
}
