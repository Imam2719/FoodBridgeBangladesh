package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Model.MessageBoard;
import com.FoodBridgeBangladesh.Model.dto.MessageBoardDTO;
import com.FoodBridgeBangladesh.Service.MessageBoardService;
import com.FoodBridgeBangladesh.Service.admin.AdminMessageReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MessageBoardController {

    @Autowired
    private MessageBoardService messageBoardService;

    @Autowired
    private AdminMessageReplyService adminReplyService;

    /**
     * Submit message from homepage contact form
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitMessage(
            @RequestParam("email") String email,
            @RequestParam("message") String message,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Basic validation
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (message == null || message.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Message is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Save message
            MessageBoardDTO savedMessage = messageBoardService.saveAnonymousMessage(email, message, attachment);

            response.put("success", true);
            response.put("message", "Your message has been sent successfully!");
            response.put("messageId", savedMessage.getId());

            System.out.println("Message submitted successfully from email: " + email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error submitting message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to send message. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all messages for admin dashboard
     */
    @GetMapping("/admin/all")
    public ResponseEntity<List<MessageBoardDTO>> getAllMessagesForAdmin() {
        try {
            List<MessageBoardDTO> messages = messageBoardService.getAllMessagesWithReadStatus();
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error fetching messages for admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get message by ID with full details (marks as read automatically)
     */
    @GetMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> getMessageByIdForAdmin(
            @PathVariable Long id,
            @RequestParam(value = "adminEmail", required = false) String adminEmail) {

        try {
            Optional<MessageBoard> messageBoard = messageBoardService.getMessageById(id);
            if (messageBoard.isPresent()) {
                MessageBoard message = messageBoard.get();

                // Mark as read automatically when admin views
                if (adminEmail != null && !message.getIsRead()) {
                    messageBoardService.markMessageAsRead(id, adminEmail);
                    message.markAsRead(adminEmail); // Update the current object
                }

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("data", convertToDetailedDTO(message));

                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Message not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching message by ID: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching message");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Download file attachment
     */
    @GetMapping("/admin/{id}/download")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        try {
            Optional<MessageBoard> messageBoard = messageBoardService.getMessageById(id);
            if (messageBoard.isPresent() && messageBoard.get().getFileData() != null) {
                MessageBoard message = messageBoard.get();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(message.getFileType()));
                headers.setContentDispositionFormData("attachment", message.getFileName());
                headers.setContentLength(message.getFileData().length);

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(message.getFileData());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error downloading attachment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * View file attachment inline (for images, PDFs)
     */
    @GetMapping("/admin/{id}/view")
    public ResponseEntity<byte[]> viewAttachment(@PathVariable Long id) {
        try {
            Optional<MessageBoard> messageBoard = messageBoardService.getMessageById(id);
            if (messageBoard.isPresent() && messageBoard.get().getFileData() != null) {
                MessageBoard message = messageBoard.get();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(message.getFileType()));
                headers.setContentDispositionFormData("inline", message.getFileName());

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(message.getFileData());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error viewing attachment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Reply to a message via email
     */
    @PostMapping("/admin/{id}/reply")
    public ResponseEntity<Map<String, Object>> replyToMessage(
            @PathVariable Long id,
            @RequestParam("replyContent") String replyContent,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam("adminName") String adminName) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate inputs
            if (replyContent == null || replyContent.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Reply content is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (adminEmail == null || adminEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Admin email is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Send reply
            boolean sent = adminReplyService.sendReplyToMessage(id, replyContent, adminEmail, adminName);

            if (sent) {
                response.put("success", true);
                response.put("message", "Reply sent successfully!");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to send reply. Please try again.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

        } catch (Exception e) {
            System.err.println("Error sending reply: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error sending reply: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send custom reply with custom subject
     */
    @PostMapping("/admin/custom-reply")
    public ResponseEntity<Map<String, Object>> sendCustomReply(
            @RequestParam("toEmail") String toEmail,
            @RequestParam("subject") String subject,
            @RequestParam("content") String content,
            @RequestParam("adminName") String adminName) {

        Map<String, Object> response = new HashMap<>();

        try {
            boolean sent = adminReplyService.sendCustomReply(toEmail, subject, content, adminName);

            if (sent) {
                response.put("success", true);
                response.put("message", "Custom reply sent successfully!");
            } else {
                response.put("success", false);
                response.put("message", "Failed to send custom reply.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error sending custom reply: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error sending custom reply");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Mark message as read manually
     */
    @PutMapping("/admin/{id}/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestParam("adminEmail") String adminEmail) {

        Map<String, Object> response = new HashMap<>();

        try {
            boolean marked = messageBoardService.markMessageAsRead(id, adminEmail);

            if (marked) {
                response.put("success", true);
                response.put("message", "Message marked as read");
            } else {
                response.put("success", false);
                response.put("message", "Message not found or already read");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error marking message as read: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error marking message as read");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get message statistics including read/unread counts
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getMessageStatsForAdmin() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalMessages", messageBoardService.getAllMessages().size());
            stats.put("unreadMessages", messageBoardService.getUnreadMessageCount());
            stats.put("readMessages", messageBoardService.getReadMessageCount());
            stats.put("totalAnonymousMessages", messageBoardService.getAnonymousMessageCount());
            stats.put("messagesWithAttachments", messageBoardService.getMessagesWithAttachmentsCount());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching message stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete message permanently
     */
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Map<String, Object>> deleteMessagePermanently(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean deleted = messageBoardService.deleteMessage(id);
            if (deleted) {
                response.put("success", true);
                response.put("message", "Message deleted permanently");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Message not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to delete message");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Bulk delete messages
     */
    @DeleteMapping("/admin/bulk-delete")
    public ResponseEntity<Map<String, Object>> bulkDeleteMessages(@RequestBody List<Long> messageIds) {
        Map<String, Object> response = new HashMap<>();

        try {
            int deletedCount = messageBoardService.bulkDeleteMessages(messageIds);

            response.put("success", true);
            response.put("message", deletedCount + " messages deleted successfully");
            response.put("deletedCount", deletedCount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error in bulk delete: " + e.getMessage());
            response.put("success", false);
            response.put("message", "Error deleting messages");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get messages filtered by read status
     */
    @GetMapping("/admin/filter")
    public ResponseEntity<List<MessageBoardDTO>> getFilteredMessages(@RequestParam String filter) {
        try {
            List<MessageBoardDTO> messages;

            switch (filter.toLowerCase()) {
                case "unread":
                    messages = messageBoardService.getUnreadMessages();
                    break;
                case "read":
                    messages = messageBoardService.getReadMessages();
                    break;
                case "with-attachments":
                    messages = messageBoardService.getMessagesWithAttachments();
                    break;
                default:
                    messages = messageBoardService.getAllMessagesWithReadStatus();
            }

            return ResponseEntity.ok(messages);

        } catch (Exception e) {
            System.err.println("Error filtering messages: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Keep original endpoints for backward compatibility
    @GetMapping("/all")
    public ResponseEntity<List<MessageBoardDTO>> getAllMessages() {
        return getAllMessagesForAdmin();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageBoardDTO> getMessageById(@PathVariable Long id) {
        try {
            Optional<MessageBoard> messageBoard = messageBoardService.getMessageById(id);
            if (messageBoard.isPresent()) {
                MessageBoard message = messageBoard.get();
                MessageBoardDTO dto = new MessageBoardDTO();
                dto.setId(message.getId());
                dto.setEmail(message.getEmail());
                dto.setMessage(message.getMessage());
                dto.setSubject(message.getSubject());
                dto.setRole(message.getRole());
                dto.setFileName(message.getFileName());
                dto.setFileType(message.getFileType());
                dto.setFileSize(message.getFileSize());
                if (message.getCreatedAt() != null) {
                    dto.setCreatedAt(message.getCreatedAt().toString());
                }

                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching message by ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadAttachmentOld(@PathVariable Long id) {
        return downloadAttachment(id);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getMessageStats() {
        return getMessageStatsForAdmin();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long id) {
        return deleteMessagePermanently(id);
    }

    /**
     * Convert MessageBoard to detailed DTO including read status
     */
    private Map<String, Object> convertToDetailedDTO(MessageBoard message) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", message.getId());
        dto.put("email", message.getEmail());
        dto.put("message", message.getMessage());
        dto.put("subject", message.getSubject());
        dto.put("role", message.getRole());
        dto.put("fileName", message.getFileName());
        dto.put("fileType", message.getFileType());
        dto.put("fileSize", message.getFileSize());
        dto.put("hasAttachment", message.hasAttachment());
        dto.put("isRead", message.getIsRead());
        dto.put("readAt", message.getReadAt() != null ? message.getReadAt().toString() : null);
        dto.put("readBy", message.getReadBy());
        dto.put("createdAt", message.getCreatedAt().toString());

        return dto;
    }
//xx
    /**
     * Compose and send new message to all users (broadcast)
     */
    @PostMapping("/admin/compose")
    public ResponseEntity<Map<String, Object>> composeMessage(
            @RequestParam("recipientType") String recipientType,
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam("adminEmail") String adminEmail,
            @RequestParam("adminName") String adminName) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate inputs
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

            if (adminEmail == null || adminEmail.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Admin email is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Determine role based on recipient type
            String role;
            switch (recipientType.toLowerCase()) {
                case "donors":
                    role = "admin_to_donors";
                    break;
                case "merchants":
                    role = "admin_to_merchant";
                    break;
                case "receivers":
                    role = "admin_to_receivers";
                    break;
                case "all":
                default:
                    role = "admin_broadcast";
                    break;
            }

            // Save the broadcast message
            MessageBoardDTO savedMessage = messageBoardService.saveAdminBroadcastMessage(
                    adminEmail, message, subject, role, adminName);

            System.out.println("Admin broadcast message sent successfully:");
            System.out.println("- From: " + adminEmail + " (" + adminName + ")");
            System.out.println("- To: " + recipientType);
            System.out.println("- Subject: " + subject);
            System.out.println("- Role: " + role);

            response.put("success", true);
            response.put("message", "Message sent successfully to " + recipientType + "!");
            response.put("messageId", savedMessage.getId());
            response.put("recipientType", recipientType);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error sending admin broadcast message: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Failed to send message: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}