package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Service.PasswordResetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class PasswordResetController {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetController.class);

    private final PasswordResetService passwordResetService;

    @Autowired
    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    /**
     * Request a password reset OTP
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<Map<String, Object>> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        logger.info("Password reset requested for email: {}", email);

        Map<String, Object> response = new HashMap<>();

        try {
            // Check if email exists
            if (!passwordResetService.existsByEmail(email)) {
                response.put("success", false);
                response.put("message", "Email address not found");
                return ResponseEntity.ok(response);
            }

            // Generate and send OTP
            boolean otpSent = passwordResetService.generateAndSendOTP(email);

            if (otpSent) {
                response.put("success", true);
                response.put("message", "Verification code sent to your email");
            } else {
                response.put("success", false);
                response.put("message", "Failed to send verification code. Please try again.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Enhanced logging to capture the full stack trace
            logger.error("Error in password reset request: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    /**
     * Verify OTP for password reset
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        logger.info("OTP verification for email: {}", email);

        Map<String, Object> response = new HashMap<>();

        try {
            boolean isValid = passwordResetService.verifyOTP(email, otp);

            if (isValid) {
                response.put("success", true);
                response.put("message", "OTP verified successfully");
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error in OTP verification: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "An error occurred. Please try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reset password after OTP verification
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        logger.info("Password reset for email: {}", email);

        Map<String, Object> response = new HashMap<>();

        try {
            // Verify OTP first (double check)
            boolean isValid = passwordResetService.verifyOTP(email, otp);

            if (!isValid) {
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.ok(response);
            }

            // Update password
            boolean passwordUpdated = passwordResetService.updatePassword(email, newPassword);

            if (passwordUpdated) {
                response.put("success", true);
                response.put("message", "Password updated successfully");
            } else {
                response.put("success", false);
                response.put("message", "Failed to update password");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error in password reset: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "An error occurred. Please try again later.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}