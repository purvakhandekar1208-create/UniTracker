package com.unitracker.controller;
import com.unitracker.service.DataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.MalformedURLException;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final DataStore dataStore;
    @Value("${app.upload.dir}") private String uploadDir;

    /** GET /api/files/certificates/{id} — serves uploaded PDF/image file */
    @GetMapping("/certificates/{id}")
    public ResponseEntity<?> downloadCert(@PathVariable int id) throws MalformedURLException {
        var certOpt = dataStore.getCertById(id);
        if (certOpt.isEmpty()) return ResponseEntity.notFound().build();
        String filePath = (String) certOpt.get().get("file_path");
        Resource resource = new UrlResource(Paths.get(uploadDir).resolve(filePath).normalize().toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath + "\"")
            .body(resource);
    }
}

