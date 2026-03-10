package com.unitracker.controller;
import com.unitracker.service.DataStore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/mentor") @RequiredArgsConstructor
public class MentorController {
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String,Object>> dashboard(HttpServletRequest r){
        String name=(String)r.getAttribute("userName");
        long total=DataStore.USERS.stream().filter(u->u.get("role").toString().equalsIgnoreCase("mentee")).count();
        List<Map<String,Object>> low=DataStore.USERS.stream()
            .filter(u->u.get("role").toString().equalsIgnoreCase("mentee"))
            .filter(u->{double a=DataStore.getAttendanceByUserId((int)u.get("id")).stream().mapToInt(x->(int)x.get("percentage")).average().orElse(100);return a<75;})
            .map(u->{Map<String,Object> s=new HashMap<>(u);s.remove("password");return s;}).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("mentor_name",name,"total_mentees",total,"low_attendance_alerts",low));
    }
    @GetMapping("/mentees")
    public ResponseEntity<List<Map<String,Object>>> mentees(){
        return ResponseEntity.ok(DataStore.USERS.stream().filter(u->u.get("role").toString().equalsIgnoreCase("mentee")).map(u->{
            int id=(int)u.get("id"); Map<String,Object> s=new HashMap<>(u); s.remove("password");
            s.put("cert_count",DataStore.getCertificatesByUserId(id).size());
            s.put("course_count",DataStore.getCoursesByUserId(id).size());
            double a=DataStore.getAttendanceByUserId(id).stream().mapToInt(x->(int)x.get("percentage")).average().orElse(0);
            s.put("avg_attendance",Math.round(a)); return s;}).collect(Collectors.toList()));
    }
    @GetMapping("/mentees/{id}/marks")       public ResponseEntity<?> marks(@PathVariable int id){return ResponseEntity.ok(DataStore.getMarksByUserId(id));}
    @GetMapping("/mentees/{id}/attendance")  public ResponseEntity<?> att(@PathVariable int id){return ResponseEntity.ok(DataStore.getAttendanceByUserId(id));}
    @GetMapping("/mentees/{id}/certificates")public ResponseEntity<?> certs(@PathVariable int id){return ResponseEntity.ok(DataStore.getCertificatesByUserId(id));}
    @GetMapping("/mentees/{id}/courses")     public ResponseEntity<?> courses(@PathVariable int id){return ResponseEntity.ok(DataStore.getCoursesByUserId(id));}
    @GetMapping("/mentees/{id}/remarks")     public ResponseEntity<?> remarks(@PathVariable int id){return ResponseEntity.ok(DataStore.getRemarksByMenteeId(id));}
    @PostMapping("/mentees/{id}/remarks")
    public ResponseEntity<Map<String,Object>> addRemark(HttpServletRequest r,@PathVariable int id,@RequestBody Map<String,String> b){
        String msg=b.get("message");
        if(msg==null||msg.isBlank()) return ResponseEntity.badRequest().body(Map.of("error","message required"));
        int mid=(int)r.getAttribute("userId"); String mname=(String)r.getAttribute("userName");
        String mteeName=DataStore.findUserById(id).map(u->u.get("name").toString()).orElse("Unknown");
        return ResponseEntity.ok(DataStore.addRemark(mid,mname,id,mteeName,msg,LocalDate.now().toString()));
    }
}

