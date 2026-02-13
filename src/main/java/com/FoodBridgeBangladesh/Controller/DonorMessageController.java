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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donor/messages")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonorMessageController {

    @Autowired
    private MessageBoardService messageBoardService;

    /**
     * Get received messages for donors (role-based filtering)
     * Shows all admin_to_donor and merchant_to_donor messages
     */
    @GetMapping("/received")
    public ResponseEntity<List<Map<String, Object>>> getDonorReceivedMessages() {
        try {
            System.out.println("🔍 Fetching received messages by role (admin_to_donor, merchant_to_donor)");

            // Get messages by role only - NO donor ID filtering
            List<MessageBoardDTO> receivedMessages = messageBoardService.getDonorReceivedMessages();

            List<Map<String, Object>> formattedMessages = receivedMessages.stream()
                    .map(this::convertToDonorFormat)
                    .collect(Collectors.toList());

            System.out.println("✅ Found " + formattedMessages.size() + " received messages by role");

            // Log each message for debugging
            formattedMessages.forEach(msg -> {
                System.out.println("📧 Message: ID=" + msg.get("id") +
                        ", Role=" + msg.get("role") +
                        ", Subject=" + msg.get("subject"));
            });

            return ResponseEntity.ok(formattedMessages);
        } catch (Exception e) {
            System.err.println("💥 Error fetching received messages by role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sent messages for donors (role-based filtering)
     * Shows all donor_to_admin messages
     */
    @GetMapping("/sent")
    public ResponseEntity<List<Map<String, Object>>> getDonorSentMessages() {
        try {
            System.out.println("🔍 Fetching sent messages by role (donor_to_admin)");

            // Get messages by role only - NO donor ID filtering
            List<MessageBoardDTO> sentMessages = messageBoardService.getDonorSentMessages();

            List<Map<String, Object>> formattedMessages = sentMessages.stream()
                    .map(this::convertToDonorFormat)
                    .collect(Collectors.toList());

            System.out.println("✅ Found " + formattedMessages.size() + " sent messages by role");
            return ResponseEntity.ok(formattedMessages);
        } catch (Exception e) {
            System.err.println("💥 Error fetching sent messages by role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark a received message as read (role-based)
     * NO donor ID validation
     */
    @PutMapping("/messages/{messageId}/mark-read")
    public ResponseEntity<Map<String, Object>> markMessageAsRead(@PathVariable Long messageId) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean marked = messageBoardService.markMessageAsReadByRole(messageId);

            if (marked) {
                response.put("success", true);
                response.put("message", "Message marked as read");
                System.out.println("✅ Message " + messageId + " marked as read (role-based)");
            } else {
                response.put("success", false);
                response.put("message", "Failed to mark as read or message not found");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("💥 Error marking message as read: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error marking as read: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send a new message from donor to admin (role-based)
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestParam("donorId") String donorId,
            @RequestParam("donorEmail") String donorEmail,
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Input validation
            if (donorEmail == null || donorEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Donor email is required");
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

            // Save message with donor_to_admin role (role-based)
            MessageBoardDTO savedMessage = messageBoardService.saveDonorMessageByRole(
                    donorEmail,
                    message,
                    subject,
                    "donor_to_admin",
                    attachment,
                    Long.parseLong(donorId)
            );

            System.out.println("✅ Message sent successfully (role-based):");
            System.out.println("- From: " + donorEmail);
            System.out.println("- Subject: " + subject);
            System.out.println("- Role: donor_to_admin");
            System.out.println("- Has Attachment: " + (attachment != null && !attachment.isEmpty()));

            response.put("success", true);
            response.put("message", "Message sent successfully!");
            response.put("messageId", savedMessage.getId());

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            System.err.println("❌ Invalid donor ID format: " + donorId);
            response.put("success", false);
            response.put("message", "Invalid donor ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.err.println("💥 Error sending donor message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete a sent message (role-based)
     * NO donor ID validation
     */
    @DeleteMapping("/sent/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteSentMessage(@PathVariable Long messageId) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean deleted = messageBoardService.deleteDonorSentMessageByRole(messageId);

            if (deleted) {
                response.put("success", true);
                response.put("message", "Message deleted successfully");
                System.out.println("✅ Sent message " + messageId + " deleted (role-based)");
            } else {
                response.put("success", false);
                response.put("message", "Message not found or cannot be deleted");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("💥 Error deleting sent message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error deleting message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get message statistics (role-based)
     * NO donor ID filtering
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonorMessageStats() {
        try {
            Map<String, Object> stats = messageBoardService.getDonorMessageStatsByRole();
            System.out.println("✅ Role-based stats: " + stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("💥 Error fetching message stats by role: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Convert MessageBoardDTO to donor-friendly format
     */
    private Map<String, Object> convertToDonorFormat(MessageBoardDTO dto) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", dto.getId());
        result.put("sender", dto.getEmail());
        result.put("senderAvatar", "https://randomuser.me/api/portraits/lego/2.jpg");

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
        result.put("thread", List.of()); // Empty thread for now
        result.put("role", dto.getRole());
        result.put("hasAttachment", dto.hasAttachment());
        result.put("fileName", dto.getFileName());
        result.put("fileSize", dto.getFileSize());

        return result;
    }
}