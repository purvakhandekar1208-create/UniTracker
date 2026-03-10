package com.unitracker.controller;
import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/mentee") @RequiredArgsConstructor
public class MenteeController {
    private int uid(HttpServletRequest r){return (int)r.getAttribute("userId");}
    private String uname(HttpServletRequest r){return (String)r.getAttribute("userName");}

    @GetMapping("/profile")
    public ResponseEntity<Map<String,Object>> profile(HttpServletRequest r){
        return DataStore.findUserById(uid(r)).map(u->{Map<String,Object> s=new HashMap<>(u);s.remove("password");return ResponseEntity.ok(s);}).orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String,Object>> dashboard(HttpServletRequest r){
        int id=uid(r); String name=uname(r);
        double avg=DataStore.getAttendanceByUserId(id).stream().mapToInt(a->(int)a.get("percentage")).average().orElse(0);
        return ResponseEntity.ok(Map.of("name",name,"avg_attendance",Math.round(avg),"certificate_count",DataStore.getCertificatesByUserId(id).size(),"course_count",DataStore.getCoursesByUserId(id).size(),"recent_remarks",DataStore.getRemarksByMenteeId(id),"recent_certs",DataStore.getCertificatesByUserId(id)));
    }
    @GetMapping("/marks")
    public ResponseEntity<List<Map<String,Object>>> marks(HttpServletRequest r){return ResponseEntity.ok(DataStore.getMarksByUserId(uid(r)));}
    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String,Object>>> attendance(HttpServletRequest r){return ResponseEntity.ok(DataStore.getAttendanceByUserId(uid(r)));}
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String,Object>>> courses(HttpServletRequest r){return ResponseEntity.ok(DataStore.getCoursesByUserId(uid(r)));}
    @PostMapping("/courses")
    public ResponseEntity<Map<String,Object>> addCourse(HttpServletRequest r, @RequestBody Map<String,Object> b){
        String cn=(String)b.get("course_name"), prov=(String)b.get("provider");
        if(cn==null||prov==null) return ResponseEntity.badRequest().body(Map.of("error","course_name and provider required"));
        int prog=b.get("progress")!=null?((Number)b.get("progress")).intValue():0;
        return ResponseEntity.ok(DataStore.addCourse(uid(r),cn,prov,prog,(String)b.getOrDefault("status","Ongoing")));
    }
    @GetMapping("/certificates")
    public ResponseEntity<List<Map<String,Object>>> certs(HttpServletRequest r){return ResponseEntity.ok(DataStore.getCertificatesByUserId(uid(r)));}
    @GetMapping("/remarks")
    public ResponseEntity<List<Map<String,Object>>> remarks(HttpServletRequest r){return ResponseEntity.ok(DataStore.getRemarksByMenteeId(uid(r)));}
}

