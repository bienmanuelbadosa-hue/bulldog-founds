package com.bulldogfounds.service;

import com.bulldogfounds.exception.InvalidFileException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

import com.bulldogfounds.service.impl.FileServiceImpl;

@ExtendWith(MockitoExtension.class)
public class FileServiceTest {

    @InjectMocks
    private FileServiceImpl fileService;

    private static final String TEST_UPLOAD_DIR = "./test-uploads";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileService, "uploadDir", TEST_UPLOAD_DIR);
    }

    @Test
    void testSaveFileSuccess() throws IOException {
        // Arrange
        byte[] fileContent = "Test image content".getBytes();
        MultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                fileContent
        );

        // Act
        String filePath = fileService.saveFile(file);
        Path localPath = Paths.get(TEST_UPLOAD_DIR).resolve(filePath.substring("/uploads/".length()));

        // Assert
        assertNotNull(filePath);
        assertTrue(filePath.startsWith("/uploads/"));
        assertTrue(filePath.endsWith(".jpg"));
        assertTrue(Files.exists(localPath));

        // Cleanup
        Files.deleteIfExists(localPath);
    }

    @Test
    void testSaveFileNullFile() {
        // Act & Assert
        assertThrows(InvalidFileException.class, () -> {
            fileService.saveFile(null);
        });
    }

    @Test
    void testSaveFileEmptyFile() {
        // Arrange
        MultipartFile emptyFile = new MockMultipartFile("file", "", "image/jpeg", new byte[0]);

        // Act & Assert
        assertThrows(InvalidFileException.class, () -> {
            fileService.saveFile(emptyFile);
        });
    }

    @Test
    void testSaveFileExceedsSizeLimit() {
        // Arrange - Create a file larger than 5MB (simulated)
        byte[] largeContent = new byte[6 * 1024 * 1024 + 1]; // 6MB + 1 byte
        MultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.jpg",
                "image/jpeg",
                largeContent
        );

        // Act & Assert
        assertThrows(InvalidFileException.class, () -> {
            fileService.saveFile(largeFile);
        }, "File size exceeds 5MB limit");
    }

    @Test
    void testSaveFileInvalidContentType() {
        // Arrange
        byte[] fileContent = "Invalid file content".getBytes();
        MultipartFile invalidFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain", // Not an allowed image type
                fileContent
        );

        // Act & Assert
        assertThrows(InvalidFileException.class, () -> {
            fileService.saveFile(invalidFile);
        }, "File type not allowed");
    }

    @Test
    void testSaveFilePngFormat() throws IOException {
        // Arrange
        byte[] fileContent = "PNG image content".getBytes();
        MultipartFile pngFile = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                fileContent
        );

        // Act
        String filePath = fileService.saveFile(pngFile);
        Path localPath = Paths.get(TEST_UPLOAD_DIR).resolve(filePath.substring("/uploads/".length()));

        // Assert
        assertNotNull(filePath);
        assertTrue(filePath.endsWith(".png"));
        assertTrue(Files.exists(localPath));

        // Cleanup
        Files.deleteIfExists(localPath);
    }

    @Test
    void testDeleteFile() throws IOException {
        // Arrange
        byte[] fileContent = "Test content".getBytes();
        MultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", fileContent);
        String filePath = fileService.saveFile(file);
        Path localPath = Paths.get(TEST_UPLOAD_DIR).resolve(filePath.substring("/uploads/".length()));

        // Verify file exists
        assertTrue(Files.exists(localPath));

        // Act
        fileService.deleteFile(filePath);

        // Assert
        assertFalse(Files.exists(localPath));
    }

    @Test
    void testDeleteFileNonExistent() {
        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> fileService.deleteFile("./nonexistent/file.jpg"));
    }

    @Test
    void testDeleteFileNull() {
        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> fileService.deleteFile(null));
    }
}
