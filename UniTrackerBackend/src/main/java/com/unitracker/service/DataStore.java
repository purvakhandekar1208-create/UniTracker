package com.unitracker.service;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ALL HARDCODED DATA — mirrors your SQL tables exactly.
 * Data is filtered per user_id so responses are dynamic per logged-in user.
 *
 * WHEN GOING DYNAMIC (MySQL) — 6 things to change:
 * 1. pom.xml        → add spring-boot-starter-data-jpa + mysql-connector-j
 * 2. app.properties → add spring.datasource.url / username / password
 * 3. Create         → @Entity class per table (User, Marks, Attendance etc.)
 * 4. Create         → @Repository interface per entity
 * 5. Replace        → every method below with repository.findByUserId(userId)
 * 6. Delete         → this entire DataStore.java file
 */
@Component
public class DataStore {

    // USERS table
    private final List<Map<String,Object>> users = new ArrayList<>(List.of(
        m("id",1,"name","Aisha Patil",  "email","aisha@gmail.com","password","123456","role","mentee"),
        m("id",2,"name","Dr Meera Iyer","email","meera@gmail.com","password","123456","role","mentor")
    ));

    // SUBJECTS table
    private final List<Map<String,Object>> subjects = List.of(
        m("id",1,"subject_name","Data Structures"),
        m("id",2,"subject_name","DBMS"),
        m("id",3,"subject_name","Computer Networks"),
        m("id",4,"subject_name","Operating Systems"),
        m("id",5,"subject_name","Software Engineering")
    );

    // MARKS table
    private final List<Map<String,Object>> marks = new ArrayList<>(List.of(
        m("id",1,"user_id",1,"subject_id",1,"subject_name","Data Structures",  "internal_marks",38,"external_marks",62,"total_marks",100,"grade","O"),
        m("id",2,"user_id",1,"subject_id",2,"subject_name","DBMS",             "internal_marks",35,"external_marks",58,"total_marks",93, "grade","A+"),
        m("id",3,"user_id",1,"subject_id",3,"subject_name","Computer Networks","internal_marks",30,"external_marks",50,"total_marks",80, "grade","A")
    ));

    // ATTENDANCE table
    private final List<Map<String,Object>> attendance = new ArrayList<>(List.of(
        m("id",1,"user_id",1,"month","July",  "percentage",92,"days_present",22,"days_absent",2),
        m("id",2,"user_id",1,"month","August","percentage",86,"days_present",19,"days_absent",3)
    ));

    // COURSES table
    private final List<Map<String,Object>> courses = new ArrayList<>(List.of(
        m("id",1,"user_id",1,"course_name","Machine Learning A-Z","provider","Udemy","progress",65, "status","Ongoing"),
        m("id",2,"user_id",1,"course_name","React Complete Guide","provider","Udemy","progress",100,"status","Completed")
    ));

    // CERTIFICATES table
    private final List<Map<String,Object>> certificates = new ArrayList<>(List.of(
        m("id",1,"user_id",1,"title","AWS Cloud Practitioner","provider","Amazon","issue_date","2023-11-10","file_path","aws.pdf")
    ));

    // MENTOR_REMARKS table
    private final List<Map<String,Object>> remarks = new ArrayList<>(List.of(
        m("id",1,"mentor_id",2,"mentee_id",1,"mentor_name","Dr Meera Iyer",
          "message","Aisha is performing well overall. Keep improving attendance.",
          "remark_date","2025-03-05")
    ));

    // Auto-increment counters
    private int certId=2, courseId=3, markId=4, attId=3, remarkId=2;

    // USER
    public Optional<Map<String,Object>> findByEmail(String email) {
        return users.stream().filter(u->u.get("email").equals(email)).findFirst();
    }
    public Optional<Map<String,Object>> findById(int id) {
        return users.stream().filter(u->(int)u.get("id")==id).findFirst();
    }
    public List<Map<String,Object>> getAllMentees() {
        return users.stream().filter(u->"mentee".equals(u.get("role"))).collect(Collectors.toList());
    }
    public List<Map<String,Object>> getSubjects() { return subjects; }

    // MARKS
    public List<Map<String,Object>> getMarksByUserId(int uid) {
        return marks.stream().filter(x->(int)x.get("user_id")==uid).collect(Collectors.toList());
    }
    public Map<String,Object> addMark(int uid, int sid, int i, int e) {
        String sn = subjects.stream().filter(s->(int)s.get("id")==sid)
                .map(s->(String)s.get("subject_name")).findFirst().orElse("Unknown");
        int t=i+e;
        Map<String,Object> row=m("id",markId++,"user_id",uid,"subject_id",sid,
            "subject_name",sn,"internal_marks",i,"external_marks",e,"total_marks",t,"grade",grade(t));
        marks.add(row); return row;
    }

    // ATTENDANCE
    public List<Map<String,Object>> getAttByUserId(int uid) {
        return attendance.stream().filter(x->(int)x.get("user_id")==uid).collect(Collectors.toList());
    }
    public Map<String,Object> addAttendance(int uid, String month, int present, int absent) {
        int total=present+absent, pct=total==0?0:(present*100)/total;
        Map<String,Object> row=m("id",attId++,"user_id",uid,"month",month,
            "percentage",pct,"days_present",present,"days_absent",absent);
        attendance.add(row); return row;
    }

    // COURSES
    public List<Map<String,Object>> getCoursesByUserId(int uid) {
        return courses.stream().filter(x->(int)x.get("user_id")==uid).collect(Collectors.toList());
    }
    public Map<String,Object> addCourse(int uid, String name, String provider, int progress, String status) {
        Map<String,Object> row=m("id",courseId++,"user_id",uid,"course_name",name,
            "provider",provider,"progress",progress,"status",status);
        courses.add(row); return row;
    }

    // CERTIFICATES
    public List<Map<String,Object>> getCertsByUserId(int uid) {
        return certificates.stream().filter(x->(int)x.get("user_id")==uid).collect(Collectors.toList());
    }
    public Map<String,Object> addCert(int uid, String title, String provider, String issueDate, String filePath) {
        Map<String,Object> row=m("id",certId++,"user_id",uid,"title",title,
            "provider",provider,"issue_date",issueDate,"file_path",filePath);
        certificates.add(row); return row;
    }
    public Optional<Map<String,Object>> getCertById(int id) {
        return certificates.stream().filter(x->(int)x.get("id")==id).findFirst();
    }

    // REMARKS
    public List<Map<String,Object>> getRemarksByMenteeId(int menteeId) {
        return remarks.stream().filter(x->(int)x.get("mentee_id")==menteeId).collect(Collectors.toList());
    }
    public Map<String,Object> addRemark(int mentorId, int menteeId, String message, String date) {
        String mn=findById(mentorId).map(u->(String)u.get("name")).orElse("Mentor");
        Map<String,Object> row=m("id",remarkId++,"mentor_id",mentorId,"mentee_id",menteeId,
            "mentor_name",mn,"message",message,"remark_date",date);
        remarks.add(row); return row;
    }

    // HELPERS
    private String grade(int t){
        if(t>=90)return"O"; if(t>=80)return"A+"; if(t>=70)return"A";
        if(t>=60)return"B+"; if(t>=50)return"B"; if(t>=40)return"C"; return"F";
    }
    private Map<String,Object> m(Object... p){
        Map<String,Object> map=new LinkedHashMap<>();
        for(int i=0;i<p.length;i+=2) map.put((String)p[i],p[i+1]);
        return map;
    }
}
