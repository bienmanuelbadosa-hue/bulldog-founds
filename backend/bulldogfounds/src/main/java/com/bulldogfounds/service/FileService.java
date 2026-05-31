package com.bulldogfounds.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service interface for file storage operations.
 *
 * <p>Defines the contract for saving and deleting uploaded files.
 * Follows the Single Responsibility Principle (SRP) — this service
 * is solely responsible for file I/O and is completely decoupled
 * from item and user business logic.
 *
 * <p>Follows the Interface Segregation Principle (ISP) — exposes only
 * file-specific operations, not mixed with item or user concerns.
 */
public interface FileService {

    /**
     * Save an uploaded file and return its publicly accessible URL path.
     *
     * @param file the uploaded multipart file
     * @return relative URL path to the saved file (e.g. "/uploads/filename.jpg")
     * @throws IOException if the file cannot be written to disk
     */
    String saveFile(MultipartFile file) throws IOException;

    /**
     * Delete a previously uploaded file by its URL path.
     * Silently ignores missing files.
     *
     * @param imageUrl the relative URL of the file to delete
     */
    void deleteFile(String imageUrl);
}
