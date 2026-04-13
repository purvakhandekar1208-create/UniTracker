// package com.unitracker.controller;
// import com.unitracker.service.DataStore;
// import lombok.RequiredArgsConstructor;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.core.io.Resource;
// import org.springframework.core.io.UrlResource;
// import org.springframework.http.*;
// import org.springframework.web.bind.annotation.*;
// import java.net.MalformedURLException;
// import java.nio.file.Paths;
// import java.util.Map;

// @RestController
// @RequestMapping("/api/files")
// @RequiredArgsConstructor
// public class FileController {
//     private final DataStore dataStore;
//     @Value("${app.upload.dir}") private String uploadDir;

//     /** GET /api/files/certificates/{id} — serves uploaded PDF/image file */
//     @GetMapping("/certificates/{id}")
//     public ResponseEntity<?> downloadCert(@PathVariable int id) throws MalformedURLException {
//         var certOpt = dataStore.getCertById(id);
//         if (certOpt.isEmpty()) return ResponseEntity.notFound().build();
//         String filePath = (String) certOpt.get().get("file_path");
//         Resource resource = new UrlResource(Paths.get(uploadDir).resolve(filePath).normalize().toUri());
//         if (!resource.exists()) return ResponseEntity.notFound().build();
//         return ResponseEntity.ok()
//             .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath + "\"")
//             .body(resource);
//     }
// }

package com.unitracker.controller;

import com.unitracker.service.DataStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final DataStore dataStore;

    @Value("${app.upload.dir}")
    private String uploadDir;

    /** GET /api/files/certificates/{id} */
    @GetMapping("/certificates/{id}")
    public ResponseEntity<?> downloadCert(@PathVariable int id) throws MalformedURLException {

        var certOpt = dataStore.getCertById(id);
        if (certOpt.isEmpty())
            return ResponseEntity.notFound().build();

        String filePath = (String) certOpt.get().get("file_path");
        if (filePath == null || filePath.isBlank())
            return ResponseEntity.notFound().build();

        Path file = Paths.get(uploadDir).resolve(filePath).normalize();
        Resource resource = new UrlResource(file.toUri());

        if (!resource.exists() || !resource.isReadable())
            return ResponseEntity.notFound().build();

        // Detect content type from file extension
        String lower       = filePath.toLowerCase();
        MediaType mediaType;
        if      (lower.endsWith(".pdf"))  mediaType = MediaType.APPLICATION_PDF;
        else if (lower.endsWith(".png"))  mediaType = MediaType.IMAGE_PNG;
        else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mediaType = MediaType.IMAGE_JPEG;
        else    mediaType = MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(mediaType)
                // inline = display in browser, attachment = force download
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filePath + "\"")
                // Allow browser to cache for 1 hour
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(resource);
    }
}