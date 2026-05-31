package com.bulldogfounds.service;

import com.bulldogfounds.dto.AuthResponse;
import com.bulldogfounds.dto.LoginRequest;
import com.bulldogfounds.dto.RegisterRequest;
import com.bulldogfounds.entity.User;
import com.bulldogfounds.enums.UserRole;
import com.bulldogfounds.exception.InvalidCredentialsException;
import com.bulldogfounds.exception.UserAlreadyExistsException;
import com.bulldogfounds.repository.UserRepository;
import com.bulldogfounds.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.bulldogfounds.service.impl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .email("juan@nu-laguna.edu.ph")
                .password("password123")
                .role(UserRole.STUDENT)
                .build();

        loginRequest = LoginRequest.builder()
                .email("juan@nu-laguna.edu.ph")
                .password("password123")
                .build();

        testUser = User.builder()
                .id(1L)
                .firstName("Juan")
                .lastName("Dela Cruz")
                .email("juan@nu-laguna.edu.ph")
                .password("encodedPassword")
                .role(UserRole.STUDENT)
                .build();
    }

    @Test
    @DisplayName("Should register user successfully")
    void testRegisterUserSuccess() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenProvider.generateToken(testUser.getEmail())).thenReturn("test-jwt-token");
        when(tokenProvider.getJwtExpirationMs()).thenReturn(86400000L);

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertNotNull(response.getUser());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());

        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository).save(any(User.class));
        verify(tokenProvider).generateToken(testUser.getEmail());
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when email already exists")
    void testRegisterUserEmailExists() {
        // Arrange
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        // Act & Assert
        UserAlreadyExistsException exception = assertThrows(
                UserAlreadyExistsException.class,
                () -> authService.register(registerRequest)
        );

        assertTrue(exception.getMessage().contains("already exists"));
        verify(userRepository).existsByEmail(registerRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should login user successfully")
    void testLoginUserSuccess() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(true);
        when(tokenProvider.generateToken(testUser.getEmail())).thenReturn("test-jwt-token");
        when(tokenProvider.getJwtExpirationMs()).thenReturn(86400000L);

        // Act
        AuthResponse response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        assertNotNull(response.getUser());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());

        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
        verify(tokenProvider).generateToken(testUser.getEmail());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when user not found")
    void testLoginUserNotFound() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest)
        );

        assertTrue(exception.getMessage().contains("Invalid"));
        verify(userRepository).findByEmail(loginRequest.getEmail());
    }

    @Test
    @DisplayName("Should throw InvalidCredentialsException when password is incorrect")
    void testLoginInvalidPassword() {
        // Arrange
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), testUser.getPassword())).thenReturn(false);

        // Act & Assert
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> authService.login(loginRequest)
        );

        assertTrue(exception.getMessage().contains("Invalid"));
        verify(userRepository).findByEmail(loginRequest.getEmail());
        verify(passwordEncoder).matches(loginRequest.getPassword(), testUser.getPassword());
    }
}
