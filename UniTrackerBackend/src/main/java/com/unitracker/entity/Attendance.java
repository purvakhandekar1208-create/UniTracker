package com.unitracker.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "attendance")
@Data @NoArgsConstructor @AllArgsConstructor
public class Attendance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(name = "user_id")      private int userId;
    private String month;
    private int percentage;
    @Column(name = "days_present") private int daysPresent;
    @Column(name = "days_absent")  private int daysAbsent;
}
