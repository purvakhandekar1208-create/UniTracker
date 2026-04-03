package com.unitracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String email;
    private String password;
    private String role;
    private String phone;
    private String roll;
    private String division;

    // Academic info (mentee)
    private String batch;
    private String department;
    private Integer year;
    private Integer semester;

    // Parent contacts
    @Column(name = "parent1_phone") private String parent1Phone;
    @Column(name = "parent2_phone") private String parent2Phone;
}
