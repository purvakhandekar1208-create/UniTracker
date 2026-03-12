package com.unitracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "marks")
@Data @NoArgsConstructor @AllArgsConstructor
public class Marks {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id")        private int userId;
    @Column(name = "subject_id")     private int subjectId;
    @Column(name = "subject_name")   private String subjectName;
    @Column(name = "internal_marks") private int internalMarks;
    @Column(name = "external_marks") private int externalMarks;
    @Column(name = "total_marks")    private int totalMarks;
    private String grade;
}
