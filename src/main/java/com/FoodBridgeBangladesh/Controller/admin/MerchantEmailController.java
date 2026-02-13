package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Service.admin.MerchantEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin/merchants")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MerchantEmailController {

    private static final Logger logger = Logger.getLogger(MerchantEmailController.class.getName());

    @Autowired
    private MerchantEmailService merchantEmailService;

    /**
     * Send email to merchant by database ID
     */
    @PostMapping("/{merchantId}/send-email")
    public ResponseEntity<?> sendEmailToMerchant(
            @PathVariable Long merchantId,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam("adminName") String adminName,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {

        try {
            logger.info("Received email request for merchant ID: " + merchantId);

            // Validate required parameters
            if (subject == null || subject.trim().isEmpty()) {
                return createErrorResponse("Subject is required", HttpStatus.BAD_REQUEST);
            }

            if (content == null || content.trim().isEmpty()) {
                return createErrorResponse("Email content is required", HttpStatus.BAD_REQUEST);
            }

            if (adminName == null || adminName.trim().isEmpty()) {
                return createErrorResponse("Admin name is required", HttpStatus.BAD_REQUEST);
            }

            if (adminEmail == null || adminEmail.trim().isEmpty()) {
                return createErrorResponse("Admin email is required", HttpStatus.BAD_REQUEST);
            }

            // Create email request object
            MerchantEmailService.EmailRequest emailRequest = new MerchantEmailService.EmailRequest();
            emailRequest.setMerchantId(merchantId);
            emailRequest.setSubject(subject);
            emailRequest.setContent(content);
            emailRequest.setTemplate(template);
            emailRequest.setAdminName(adminName);
            emailRequest.setAdminEmail(adminEmail);
            emailRequest.setAttachments(attachments);

            // Send email
            boolean emailSent = merchantEmailService.sendEmailToMerchant(emailRequest);

            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Email sent successfully to merchant");
                response.put("merchantId", merchantId);
                response.put("timestamp", System.currentTimeMillis());

                logger.info("Email sent successfully to merchant ID: " + merchantId);
                return ResponseEntity.ok(response);
            } else {
                return createErrorResponse("Failed to send email", HttpStatus.INTERNAL_SERVER_ERROR);
            }

        } catch (IllegalArgumentException e) {
            logger.warning("Validation error: " + e.getMessage());
            return createErrorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);

        } catch (Exception e) {
            logger.severe("Error sending email to merchant: " + e.getMessage());
            return createErrorResponse("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available email templates
     */
    @GetMapping("/email-templates")
    public ResponseEntity<?> getEmailTemplates() {
        try {
            Map<String, Object> templates = merchantEmailService.getEmailTemplates();
            return ResponseEntity.ok(templates);

        } catch (Exception e) {
            logger.severe("Error retrieving email templates: " + e.getMessage());
            return createErrorResponse("Failed to retrieve email templates", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Send bulk email to multiple merchants
     */
    @PostMapping("/send-bulk-email")
    public ResponseEntity<?> sendBulkEmail(
            @RequestParam("merchantIds") Long[] merchantIds,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("template") String template,
            @RequestParam("adminName") String adminName,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam(value = "attachments", required = false) MultipartFile[] attachments) {

        try {
            logger.info("Received bulk email request for " + merchantIds.length + " merchants");

            // Validate required parameters
            if (merchantIds == null || merchantIds.length == 0) {
                return createErrorResponse("At least one merchant ID is required", HttpStatus.BAD_REQUEST);
            }

            if (subject == null || subject.trim().isEmpty()) {
                return createErrorResponse("Subject is required", HttpStatus.BAD_REQUEST);
            }

            if (content == null || content.trim().isEmpty()) {
                return createErrorResponse("Email content is required", HttpStatus.BAD_REQUEST);
            }

            // Create bulk email request
            MerchantEmailService.BulkEmailRequest bulkRequest = new MerchantEmailService.BulkEmailRequest();
            bulkRequest.setMerchantIds(merchantIds);
            bulkRequest.setSubject(subject);
            bulkRequest.setContent(content);
            bulkRequest.setTemplate(template);
            bulkRequest.setAdminName(adminName);
            bulkRequest.setAdminEmail(adminEmail);
            bulkRequest.setAttachments(attachments);

            // Send bulk emails
            Map<String, Object> result = merchantEmailService.sendBulkEmail(bulkRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Bulk email process completed");
            response.put("results", result);
            response.put("timestamp", System.currentTimeMillis());

            logger.info("Bulk email process completed for " + merchantIds.length + " merchants");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error sending bulk email: " + e.getMessage());
            return createErrorResponse("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get email history for a merchant
     */
    @GetMapping("/{merchantId}/email-history")
    public ResponseEntity<?> getMerchantEmailHistory(@PathVariable Long merchantId) {
        try {
            Map<String, Object> emailHistory = merchantEmailService.getEmailHistory(merchantId);
            return ResponseEntity.ok(emailHistory);

        } catch (IllegalArgumentException e) {
            return createErrorResponse(e.getMessage(), HttpStatus.NOT_FOUND);

        } catch (Exception e) {
            logger.severe("Error retrieving email history: " + e.getMessage());
            return createErrorResponse("Failed to retrieve email history", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Helper method to create error response
     */
    private ResponseEntity<?> createErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return new ResponseEntity<>(response, status);
    }
}