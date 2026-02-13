package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Service.admin.AdminEmailService;
import com.FoodBridgeBangladesh.Model.admin.adminManagementEntity;
import com.FoodBridgeBangladesh.Repository.admin.adminManagementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin/email")
@CrossOrigin(
        origins = {"https://foodbridgebangladesh-k0sb.onrender.com", "http://localhost:3000", "https://foodbridge-frontend.onrender.com"},
        allowCredentials = "true"
)
public class AdminEmailController {

    private static final Logger logger = Logger.getLogger(AdminEmailController.class.getName());

    @Autowired
    private AdminEmailService adminEmailService;

    @Autowired
    private adminManagementRepository adminRepository;

    /**
     * Get available email templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getEmailTemplates() {
        try {
            logger.info("Fetching email templates");
            Map<String, Object> templates = adminEmailService.getEmailTemplates();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("templates", templates);
            response.put("count", templates.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error fetching email templates: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch email templates");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send email from admin to admin by admin IDs
     */
    @PostMapping(value = "/send", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> sendAdminEmail(
            @RequestParam("recipientAdminId") Long recipientAdminId,
            @RequestParam("senderAdminId") Long senderAdminId,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {

        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Admin email send request - From ID: " + senderAdminId + " To ID: " + recipientAdminId);

            // Validate input parameters
            if (recipientAdminId == null || senderAdminId == null) {
                response.put("success", false);
                response.put("message", "Sender and recipient admin IDs are required");
                return ResponseEntity.badRequest().body(response);
            }

            if (subject == null || subject.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email subject is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email content is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate that both admins exist
            Optional<adminManagementEntity> senderOpt = adminRepository.findById(senderAdminId);
            Optional<adminManagementEntity> recipientOpt = adminRepository.findById(recipientAdminId);

            if (!senderOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Sender admin not found with ID: " + senderAdminId);
                return ResponseEntity.badRequest().body(response);
            }

            if (!recipientOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Recipient admin not found with ID: " + recipientAdminId);
                return ResponseEntity.badRequest().body(response);
            }

            // Validate attachment files if provided
            if (attachments != null) {
                for (MultipartFile file : attachments) {
                    if (file != null && file.getSize() > 10 * 1024 * 1024) { // 10MB limit
                        response.put("success", false);
                        response.put("message", "Attachment file size cannot exceed 10MB: " + file.getOriginalFilename());
                        return ResponseEntity.badRequest().body(response);
                    }
                }
            }

            // Send the email
            boolean emailSent = adminEmailService.sendAdminEmail(
                    recipientAdminId,
                    senderAdminId,
                    subject,
                    content,
                    template,
                    attachments
            );

            if (emailSent) {
                response.put("success", true);
                response.put("message", "Email sent successfully");
                response.put("from", senderOpt.get().getEmail());
                response.put("to", recipientOpt.get().getEmail());
                response.put("subject", subject);
                response.put("timestamp", LocalDateTime.now().toString());
                logger.info("Email sent successfully from admin " + senderAdminId + " to admin " + recipientAdminId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send email - please check email configuration");
                logger.warning("Failed to send email from admin " + senderAdminId + " to admin " + recipientAdminId);
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warning("Validation error: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            logger.severe("Error sending admin email: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "An unexpected error occurred while sending email");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send email from admin to admin by email address
     */
    @PostMapping(value = "/send-by-email", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> sendAdminEmailByEmail(
            @RequestParam("recipientEmail") String recipientEmail,
            @RequestParam("senderAdminId") String senderAdminIdStr,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {

        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Email send request - To: " + recipientEmail + " From Admin ID: " + senderAdminIdStr);

            // Validate basic parameters
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Recipient email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (subject == null || subject.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email subject is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email content is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Parse sender admin ID with fallback
            Long senderAdminId;
            try {
                senderAdminId = Long.parseLong(senderAdminIdStr);
            } catch (NumberFormatException e) {
                logger.warning("Invalid sender admin ID: " + senderAdminIdStr + ", using fallback");
                Optional<adminManagementEntity> firstAdmin = adminRepository.findAll().stream().findFirst();
                if (firstAdmin.isPresent()) {
                    senderAdminId = firstAdmin.get().getId();
                    logger.info("Using fallback admin ID: " + senderAdminId);
                } else {
                    response.put("success", false);
                    response.put("message", "No valid sender admin found and invalid sender ID provided");
                    return ResponseEntity.badRequest().body(response);
                }
            }

            // Find recipient admin by email
            Optional<adminManagementEntity> recipientOpt = adminRepository.findByEmail(recipientEmail);
            if (!recipientOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Recipient admin not found with email: " + recipientEmail);
                return ResponseEntity.badRequest().body(response);
            }

            // Find sender admin
            Optional<adminManagementEntity> senderOpt = adminRepository.findById(senderAdminId);
            if (!senderOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Sender admin not found with ID: " + senderAdminId);
                return ResponseEntity.badRequest().body(response);
            }

            adminManagementEntity recipient = recipientOpt.get();
            adminManagementEntity sender = senderOpt.get();

            logger.info("Sending email from: " + sender.getEmail() + " to: " + recipient.getEmail());

            // Validate attachment files if provided
            if (attachments != null) {
                for (MultipartFile file : attachments) {
                    if (file != null && file.getSize() > 10 * 1024 * 1024) { // 10MB limit
                        response.put("success", false);
                        response.put("message", "Attachment file size cannot exceed 10MB: " + file.getOriginalFilename());
                        return ResponseEntity.badRequest().body(response);
                    }
                }
            }

            // Send the email using the service
            boolean emailSent = adminEmailService.sendAdminEmail(
                    recipient.getId(),
                    sender.getId(),
                    subject,
                    content,
                    template,
                    attachments
            );

            if (emailSent) {
                response.put("success", true);
                response.put("message", "Email sent successfully");
                response.put("from", sender.getEmail());
                response.put("to", recipient.getEmail());
                response.put("subject", subject);
                response.put("template", template);
                response.put("timestamp", LocalDateTime.now().toString());
                logger.info("Email sent successfully from " + sender.getEmail() + " to " + recipient.getEmail());
            } else {
                response.put("success", false);
                response.put("message", "Failed to send email - please check email configuration and server logs");
                logger.warning("Email sending failed from " + sender.getEmail() + " to " + recipient.getEmail());
            }

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            logger.warning("Validation error: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            logger.severe("Error sending admin email by email: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "An unexpected error occurred while sending email");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Alternative email sending endpoint using sender email instead of ID
     */
    @PostMapping(value = "/send-by-emails", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> sendAdminEmailByEmails(
            @RequestParam("recipientEmail") String recipientEmail,
            @RequestParam("senderEmail") String senderEmail,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {

        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Email send request - From: " + senderEmail + " To: " + recipientEmail);

            // Validate parameters
            if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Recipient email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (senderEmail == null || senderEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Sender email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (subject == null || subject.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email subject is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (content == null || content.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email content is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Send the email using the email-based service method
            boolean emailSent = adminEmailService.sendAdminEmailByEmail(
                    recipientEmail,
                    null, // We'll modify the service to handle sender email
                    subject,
                    content,
                    template,
                    attachments
            );

            if (emailSent) {
                response.put("success", true);
                response.put("message", "Email sent successfully");
                response.put("from", senderEmail);
                response.put("to", recipientEmail);
                response.put("subject", subject);
                response.put("timestamp", LocalDateTime.now().toString());
                logger.info("Email sent successfully from " + senderEmail + " to " + recipientEmail);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send email");
                logger.warning("Email sending failed from " + senderEmail + " to " + recipientEmail);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error in email-to-email sending: " + e.getMessage());
            response.put("success", false);
            response.put("message", "An unexpected error occurred while sending email");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get email template by name
     */
    @GetMapping("/templates/{templateName}")
    public ResponseEntity<Map<String, Object>> getEmailTemplate(@PathVariable String templateName) {
        try {
            logger.info("Fetching email template: " + templateName);
            Map<String, Object> template = adminEmailService.getEmailTemplate(templateName);

            if (template != null && !template.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("template", template);
                response.put("templateName", templateName);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Template not found: " + templateName);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.severe("Error fetching email template: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch email template");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get email service statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEmailStats() {
        try {
            Map<String, Object> stats = adminEmailService.getEmailStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.severe("Error fetching email stats: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch email statistics");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test endpoint for email service
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEmailService() {
        Map<String, Object> response = new HashMap<>();

        try {
            logger.info("Testing email service...");

            // Test basic service availability
            response.put("success", true);
            response.put("message", "Email service is running");
            response.put("adminCount", adminRepository.count());
            response.put("availableTemplates", adminEmailService.getEmailTemplates().keySet());
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("serviceStatus", "ACTIVE");

            // Test repository connectivity
            if (adminRepository.count() > 0) {
                response.put("databaseConnection", "OK");
                Optional<adminManagementEntity> testAdmin = adminRepository.findAll().stream().findFirst();
                if (testAdmin.isPresent()) {
                    response.put("sampleAdminEmail", testAdmin.get().getEmail());
                }
            } else {
                response.put("databaseConnection", "NO_ADMINS_FOUND");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Email service test failed: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Email service test failed: " + e.getMessage());
            response.put("serviceStatus", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("success", true);
            response.put("message", "Admin Email Service is running");
            response.put("status", "UP");
            response.put("timestamp", LocalDateTime.now().toString());
            response.put("version", "1.0.0");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Health check failed");
            response.put("status", "DOWN");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all admins for email recipient selection
     */
    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> getAllAdminsForEmail() {
        try {
            logger.info("Fetching all admins for email recipient selection");

            var admins = adminRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("admins", admins);
            response.put("count", admins.size());
            response.put("timestamp", LocalDateTime.now().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error fetching admins for email: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch admins");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Validate email address format
     */
    @GetMapping("/validate-email")
    public ResponseEntity<Map<String, Object>> validateEmail(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean isValid = email != null &&
                    !email.trim().isEmpty() &&
                    email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

            response.put("success", true);
            response.put("email", email);
            response.put("isValid", isValid);

            if (isValid) {
                // Check if email belongs to an admin
                Optional<adminManagementEntity> admin = adminRepository.findByEmail(email);
                response.put("isAdmin", admin.isPresent());
                if (admin.isPresent()) {
                    response.put("adminName", admin.get().getFirstName() + " " + admin.get().getLastName());
                    response.put("adminRole", admin.get().getRole());
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.warning("Error validating email: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error validating email");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}