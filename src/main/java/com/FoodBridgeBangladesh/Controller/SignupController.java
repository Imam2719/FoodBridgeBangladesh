package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Model.User;
import com.FoodBridgeBangladesh.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class SignupController {

    private static final Logger log = LoggerFactory.getLogger(SignupController.class);

    private final UserService userService;
    /**
     * Check if email already exists in the database
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if phone number already exists in the database
     */
    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhoneExists(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Check if national ID already exists in the database
     */
    @GetMapping("/check-national-id")
    public ResponseEntity<Map<String, Boolean>> checkNationalIdExists(@RequestParam String nationalId) {
        boolean exists = userService.existsByNationalId(nationalId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * Register a new user with all details including photo
     */
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerUser(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("phone") String phone,
            @RequestParam("birthdate") String birthdate,
            @RequestParam("bloodGroup") String bloodGroup,
            @RequestParam(value = "nationalId", required = false) String nationalId,
            @RequestParam(value = "passportNumber", required = false) String passportNumber,
            @RequestParam(value = "birthCertificateNumber", required = false) String birthCertificateNumber,
            @RequestParam("address") String address,
            @RequestParam("addressDescription") String addressDescription,
            @RequestParam("userType") String userType,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam("userPhoto") MultipartFile userPhoto) {

        try {
            log.info("Receiving signup request for user: {}", email);

            // Validate photo is not empty
            if (userPhoto.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "User photo is required");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }

            User user = userService.createUser(
                    firstName, lastName, email, password, phone, birthdate, bloodGroup,
                    nationalId, passportNumber, birthCertificateNumber,
                    address, addressDescription, userType, bio, userPhoto
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("userId", user.getId());
            response.put("redirectUrl", "/login");

            log.info("User registration successful for: {}", email);
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IOException e) {
            log.error("Error processing file upload: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error processing file upload: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Error during user registration: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Registration failed: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Global exception handler for this controller
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleExceptions(Exception e) {
        log.error("Unhandled exception in SignupController: {}", e.getMessage());
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
