package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.User;
import com.FoodBridgeBangladesh.Service.admin.AdminUserEmailService;
import com.FoodBridgeBangladesh.Model.admin.dto.AdminUserDTO;
import com.FoodBridgeBangladesh.Service.admin.AdminUserService;
import com.FoodBridgeBangladesh.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final UserService userService;
    private final AdminUserEmailService adminUserEmailService;
    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    public AdminUserController(AdminUserService adminUserService,
                               UserService userService,
                               AdminUserEmailService adminUserEmailService) {
        this.adminUserService = adminUserService;
        this.userService = userService;
        this.adminUserEmailService = adminUserEmailService;
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        log.info("Fetching all users for admin dashboard");
        try {
            List<AdminUserDTO> users = adminUserService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users: {}", e.getMessage());
            return createErrorResponse("Error fetching users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        log.info("Fetching user with ID: {}", userId);
        try {
            AdminUserDTO user = adminUserService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error fetching user: {}", e.getMessage());
            return createErrorResponse("Error fetching user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new user
     */
    @PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addUser(
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

        log.info("Adding new user: {}", email);
        try {
            // Pre-check for existing entries
            if (userService.existsByEmail(email)) {
                return createDuplicateEntryResponse("email_exists", "An account with this email already exists.");
            }
            if (userService.existsByPhone(phone)) {
                return createDuplicateEntryResponse("phone_exists", "An account with this phone number already exists.");
            }
            if (nationalId != null && !nationalId.isEmpty() && userService.existsByNationalId(nationalId)) {
                return createDuplicateEntryResponse("national_id_exists", "An account with this National ID already exists.");
            }

            User user = userService.createUser(
                    firstName, lastName, email, password, phone, birthdate, bloodGroup,
                    nationalId, passportNumber, birthCertificateNumber,
                    address, addressDescription, userType, bio, userPhoto
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User added successfully");
            response.put("userId", user.getId());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation: {}", e.getMessage());
            return createDuplicateEntryResponse("duplicate_entry", "A duplicate entry was found.");
        } catch (Exception e) {
            log.error("Error adding user: {}", e.getMessage());
            return createErrorResponse("Error adding user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update user
     */
    @PutMapping("/users/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable Long userId, @RequestBody User user) {
        log.info("Updating user with ID: {}", userId);
        try {
            AdminUserDTO updatedUser = adminUserService.updateUser(userId, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            log.error("Error updating user: {}", e.getMessage());
            return createErrorResponse("Error updating user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delete user
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        log.info("Deleting user with ID: {}", userId);
        try {
            adminUserService.deleteUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting user: {}", e.getMessage());
            return createErrorResponse("Error deleting user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update verification status
     */
    @PutMapping("/users/{userId}/verify")
    public ResponseEntity<?> updateVerificationStatus(
            @PathVariable Long userId,
            @RequestParam boolean verified) {
        log.info("Updating verification status for user with ID: {} to {}", userId, verified);
        try {
            adminUserService.updateVerificationStatus(userId, verified);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User verification status updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating verification status: {}", e.getMessage());
            return createErrorResponse("Error updating verification status", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get users by type (donor/receiver)
     */
    @GetMapping("/users/type/{userType}")
    public ResponseEntity<?> getUsersByType(@PathVariable String userType) {
        log.info("Fetching users with type: {}", userType);
        try {
            List<AdminUserDTO> users = adminUserService.getUsersByType(userType);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error fetching users by type: {}", e.getMessage());
            return createErrorResponse("Error fetching users by type", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Search users by keyword
     */
    @GetMapping("/users/search")
    public ResponseEntity<?> searchUsers(@RequestParam String keyword) {
        log.info("Searching users with keyword: {}", keyword);
        try {
            List<AdminUserDTO> users = adminUserService.searchUsers(keyword);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error searching users: {}", e.getMessage());
            return createErrorResponse("Error searching users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method to create error response
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }

    /**
     * Helper method to create duplicate entry response
     */
    private ResponseEntity<Map<String, Object>> createDuplicateEntryResponse(String errorCode, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", errorCode);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * Handle exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleExceptions(Exception e) {
        log.error("Unhandled exception in AdminUserController: {}", e.getMessage());
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "An unexpected error occurred: " + e.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Send email to user
     */
    @PostMapping(value = "/users/{userId}/send-email", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> sendEmailToUser(
            @PathVariable Long userId,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam("adminName") String adminName,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam(value = "attachments", required = false) List<MultipartFile> attachments) {

        log.info("Sending email to user with ID: {} by admin: {}", userId, adminEmail);

        try {
            // Get user details
            AdminUserDTO user = adminUserService.getUserById(userId);

            if (user == null) {
                return createErrorResponse("User not found", HttpStatus.NOT_FOUND);
            }

            // Send email
            boolean emailSent = adminUserEmailService.sendEmailToUser(
                    user.getEmail(),
                    subject,
                    content,
                    template,
                    adminName,
                    attachments
            );

            Map<String, Object> response = new HashMap<>();
            if (emailSent) {
                response.put("success", true);
                response.put("message", "Email sent successfully to " + user.getEmail());
                log.info("Email sent successfully to user: {} by admin: {}", user.getEmail(), adminEmail);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send email");
                log.error("Failed to send email to user: {} by admin: {}", user.getEmail(), adminEmail);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error sending email to user: {}", e.getMessage());
            return createErrorResponse("Error sending email: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get email templates
     */
    @GetMapping("/email-templates")
    public ResponseEntity<?> getEmailTemplates() {
        try {
            Map<String, Object> templates = new HashMap<>();

            Map<String, String> actionAgainstReport = new HashMap<>();
            actionAgainstReport.put("name", "Action Against Report");
            actionAgainstReport.put("value", "action_against_report");
            actionAgainstReport.put("description", "For reporting policy violations or account issues");
            actionAgainstReport.put("defaultSubject", "Important: Action Required on Your Account");
            actionAgainstReport.put("defaultContent", "We have identified some concerns regarding your account that require your attention. Please review the details and take appropriate action.");

            Map<String, String> welcomeMessage = new HashMap<>();
            welcomeMessage.put("name", "Welcome Message");
            welcomeMessage.put("value", "welcome_message");
            welcomeMessage.put("description", "Welcome new users to the platform");
            welcomeMessage.put("defaultSubject", "Welcome to FoodBridge Bangladesh!");
            welcomeMessage.put("defaultContent", "Welcome to FoodBridge Bangladesh! We're excited to have you join our community dedicated to reducing food waste and helping those in need. Start exploring our platform and make a difference today!");

            Map<String, String> systemIssues = new HashMap<>();
            systemIssues.put("name", "System Issues");
            systemIssues.put("value", "system_issues");
            systemIssues.put("description", "Notify users about system maintenance or issues");
            systemIssues.put("defaultSubject", "System Maintenance Notification");
            systemIssues.put("defaultContent", "We want to inform you about upcoming system maintenance that may temporarily affect our services. We apologize for any inconvenience and appreciate your patience.");

            Map<String, String> accountVerification = new HashMap<>();
            accountVerification.put("name", "Account Verification");
            accountVerification.put("value", "account_verification");
            accountVerification.put("description", "Account verification updates and requests");
            accountVerification.put("defaultSubject", "Account Verification Update");
            accountVerification.put("defaultContent", "Your account verification status has been updated. Please check your account dashboard for more details.");

            Map<String, String> policyUpdate = new HashMap<>();
            policyUpdate.put("name", "Policy Update");
            policyUpdate.put("value", "policy_update");
            policyUpdate.put("description", "Notify users about policy changes");
            policyUpdate.put("defaultSubject", "Important Policy Updates");
            policyUpdate.put("defaultContent", "We have updated our terms of service and privacy policy. Please review the changes to understand how they may affect your use of our platform.");

            templates.put("action_against_report", actionAgainstReport);
            templates.put("welcome_message", welcomeMessage);
            templates.put("system_issues", systemIssues);
            templates.put("account_verification", accountVerification);
            templates.put("policy_update", policyUpdate);

            return ResponseEntity.ok(templates);

        } catch (Exception e) {
            log.error("Error fetching email templates: {}", e.getMessage());
            return createErrorResponse("Error fetching email templates", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}