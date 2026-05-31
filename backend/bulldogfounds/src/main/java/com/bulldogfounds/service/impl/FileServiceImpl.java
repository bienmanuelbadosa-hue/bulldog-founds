package com.bulldogfounds.service.impl;

import com.bulldogfounds.exception.InvalidFileException;
import com.bulldogfounds.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Concrete implementation of {@link FileService}.
 *
 * <p>Handles local disk storage of files uploaded to the application.
 * Enforces file size limitations and type constraints.
 *
 * <p><b>OOP — Abstraction:</b> Isolates disk/IO operations behind {@link FileService}.
 * Callers do not know whether the files are saved locally, in AWS S3, or via a database.
 *
 * <p><b>SOLID — SRP:</b> Dedicated exclusively to reading/writing binary payloads.
 * No item or user entity business logic exists here.
 */
@Slf4j
@Service
public class FileServiceImpl implements FileService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"};

    /**
     * {@inheritDoc}
     *
     * @throws InvalidFileException if the file is null/empty or fails size/type validation
     */
    @Override
    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is required");
        }

        // Validate file
        validateFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String uniqueFilename = UUID.randomUUID() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.write(filePath, file.getBytes());

        log.info("File saved successfully: {}", uniqueFilename);
        return "/uploads/" + uniqueFilename;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void deleteFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            String filename = imageUrl;
            if (imageUrl.startsWith("/uploads/")) {
                filename = imageUrl.substring("/uploads/".length());
            } else if (imageUrl.startsWith(uploadDir + "/")) {
                filename = imageUrl.substring((uploadDir + "/").length());
            }
            Path file = Paths.get(uploadDir).resolve(filename);
            Files.deleteIfExists(file);
            log.info("File deleted: {}", file.toAbsolutePath());
        } catch (IOException e) {
            log.warn("Failed to delete file for image: {}", imageUrl, e);
        }
    }

    /**
     * Validate file size and type.
     */
    private void validateFile(MultipartFile file) {
        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds 5MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        boolean isAllowed = false;
        for (String allowedType : ALLOWED_TYPES) {
            if (allowedType.equals(contentType)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new InvalidFileException("File type not allowed. Allowed: JPEG, PNG, GIF, WebP");
        }
    }
}
