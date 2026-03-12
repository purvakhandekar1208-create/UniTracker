package com.unitracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "mentor_remarks")
@Data @NoArgsConstructor @AllArgsConstructor
public class MentorRemark {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "mentor_id")   private int mentorId;
    @Column(name = "mentee_id")   private int menteeId;
    @Column(name = "mentor_name") private String mentorName;
    private String message;
    @Column(name = "remark_date") private String remarkDate;
}
