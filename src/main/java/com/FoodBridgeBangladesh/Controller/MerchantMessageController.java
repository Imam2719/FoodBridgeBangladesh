package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Model.MessageBoard;
import com.FoodBridgeBangladesh.Model.dto.MessageBoardDTO;
import com.FoodBridgeBangladesh.Service.MessageBoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/merchant/messages")
@CrossOrigin(
        origins = {"http://localhost:3000","https://foodbridgebangladesh-k0sb.onrender.com", "https://foodbridge-frontend.onrender.com"},
        allowCredentials = "true"
)
public class MerchantMessageController {

    @Autowired
    private MessageBoardService messageBoardService;

    /**
     * Get sent messages for a specific merchant (messages they sent)
     */
    @GetMapping("/{merchantId}/sent")
    public ResponseEntity<List<Map<String, Object>>> getMerchantSentMessages(@PathVariable String merchantId) {
        try {
            Long merchantIdLong = Long.parseLong(merchantId);

            // Get messages sent by this merchant
            List<MessageBoardDTO> sentMessages = messageBoardService.getMerchantSentMessages(merchantIdLong);

            List<Map<String, Object>> formattedMessages = sentMessages.stream()
                    .map(this::convertToMerchantFormat)
                    .collect(Collectors.toList());

            System.out.println("Found " + formattedMessages.size() + " sent messages for merchant " + merchantId);
            return ResponseEntity.ok(formattedMessages);
        } catch (NumberFormatException e) {
            System.err.println("Invalid merchant ID format: " + merchantId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error fetching sent messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get received messages for a specific merchant (messages sent to them)
     */
    @GetMapping("/{merchantId}/received")
    public ResponseEntity<List<Map<String, Object>>> getMerchantReceivedMessages(@PathVariable String merchantId) {
        try {
            Long merchantIdLong = Long.parseLong(merchantId);

            // Get messages received by this merchant (not ignored)
            List<MessageBoardDTO> receivedMessages = messageBoardService.getMerchantReceivedMessages(merchantIdLong);

            List<Map<String, Object>> formattedMessages = receivedMessages.stream()
                    .map(this::convertToMerchantFormat)
                    .collect(Collectors.toList());

            System.out.println("Found " + formattedMessages.size() + " received messages for merchant " + merchantId);
            return ResponseEntity.ok(formattedMessages);
        } catch (NumberFormatException e) {
            System.err.println("Invalid merchant ID format: " + merchantId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error fetching received messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark a received message as read when merchant views it
     */
    @PutMapping("/{merchantId}/messages/{messageId}/mark-read")
    public ResponseEntity<Map<String, Object>> markMessageAsRead(
            @PathVariable String merchantId,
            @PathVariable Long messageId) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long merchantIdLong = Long.parseLong(merchantId);
            boolean marked = messageBoardService.markMessageAsReadByMerchant(messageId, merchantIdLong);

            if (marked) {
                response.put("success", true);
                response.put("message", "Message marked as read");
                System.out.println("Message " + messageId + " marked as read by merchant " + merchantId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to mark as read or message not found");
            }

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "Invalid merchant ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error marking message as read: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error marking as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Ignore a received message (hide it from merchant's view)
     */
    @PutMapping("/{merchantId}/messages/{messageId}/ignore")
    public ResponseEntity<Map<String, Object>> ignoreMessage(
            @PathVariable String merchantId,
            @PathVariable Long messageId) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long merchantIdLong = Long.parseLong(merchantId);
            boolean ignored = messageBoardService.ignoreMessageForMerchant(messageId, merchantIdLong);

            if (ignored) {
                response.put("success", true);
                response.put("message", "Message ignored successfully");
                System.out.println("Message " + messageId + " ignored by merchant " + merchantId);
            } else {
                response.put("success", false);
                response.put("message", "Failed to ignore message or message not found");
            }

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "Invalid merchant ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error ignoring message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error ignoring message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send a new message from merchant
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestParam("merchantId") String merchantId,
            @RequestParam("merchantEmail") String merchantEmail,
            @RequestParam("toEmail") String toEmail,
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam("recipientType") String recipientType,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Input validation
            if (merchantEmail == null || merchantEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Merchant email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (subject == null || subject.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Subject is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (message == null || message.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Message content is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Determine role based on recipient type
            String role;
            if ("admin".equals(recipientType)) {
                role = "merchant_to_admin";
            } else if ("donor".equals(recipientType)) {
                role = "merchant_to_donor";
            } else {
                role = "merchant_to_admin"; // Default to admin
            }

            // Save message using the updated method with merchant ID
            MessageBoardDTO savedMessage = messageBoardService.saveMerchantMessage(
                    merchantEmail,
                    message,
                    subject,
                    role,
                    attachment,
                    Long.parseLong(merchantId)
            );

            System.out.println("Message sent successfully:");
            System.out.println("- From: " + merchantEmail);
            System.out.println("- To: " + toEmail);
            System.out.println("- Subject: " + subject);
            System.out.println("- Role: " + role);
            System.out.println("- Merchant ID: " + merchantId);
            System.out.println("- Has Attachment: " + (attachment != null && !attachment.isEmpty()));

            response.put("success", true);
            response.put("message", "Message sent successfully!");
            response.put("messageId", savedMessage.getId());

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            System.err.println("Invalid merchant ID format: " + merchantId);
            response.put("success", false);
            response.put("message", "Invalid merchant ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error sending merchant message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete a sent message by merchant (only their own messages)
     */
    @DeleteMapping("/{merchantId}/sent/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteSentMessage(
            @PathVariable String merchantId,
            @PathVariable Long messageId) {

        Map<String, Object> response = new HashMap<>();

        try {
            Long merchantIdLong = Long.parseLong(merchantId);
            boolean deleted = messageBoardService.deleteMerchantSentMessage(messageId, merchantIdLong);

            if (deleted) {
                response.put("success", true);
                response.put("message", "Message deleted successfully");
                System.out.println("Sent message " + messageId + " deleted by merchant " + merchantId);
            } else {
                response.put("success", false);
                response.put("message", "Message not found or you don't have permission to delete it");
            }

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            response.put("success", false);
            response.put("message", "Invalid merchant ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("Error deleting sent message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error deleting message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get message statistics for merchant
     */
    @GetMapping("/{merchantId}/stats")
    public ResponseEntity<Map<String, Object>> getMerchantMessageStats(@PathVariable String merchantId) {
        try {
            Long merchantIdLong = Long.parseLong(merchantId);

            Map<String, Object> stats = messageBoardService.getMerchantMessageStats(merchantIdLong);

            System.out.println("Merchant " + merchantId + " stats: " + stats);

            return ResponseEntity.ok(stats);

        } catch (NumberFormatException e) {
            System.err.println("Invalid merchant ID format: " + merchantId);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error fetching merchant message stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convert MessageBoardDTO to merchant-friendly format
     */
    private Map<String, Object> convertToMerchantFormat(MessageBoardDTO dto) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", dto.getId());
        result.put("sender", dto.getEmail());
        result.put("senderAvatar", "https://randomuser.me/api/portraits/lego/1.jpg");

        // Parse date and time
        String createdAt = dto.getCreatedAt();
        if (createdAt != null && createdAt.contains(" ")) {
            String[] parts = createdAt.split(" ");
            result.put("date", parts[0]); // Date part
            result.put("time", parts[1]); // Time part
        } else {
            result.put("date", createdAt != null ? createdAt : "N/A");
            result.put("time", "00:00:00");
        }

        result.put("subject", dto.getSubject() != null ? dto.getSubject() : "No Subject");
        result.put("message", dto.getMessage());
        result.put("read", dto.getIsRead() != null ? dto.getIsRead() : false);
        result.put("thread", List.of()); // Empty thread for now - can be enhanced later
        result.put("role", dto.getRole());
        result.put("hasAttachment", dto.hasAttachment());
        result.put("fileName", dto.getFileName());
        result.put("fileSize", dto.getFileSize());

        return result;
    }
}