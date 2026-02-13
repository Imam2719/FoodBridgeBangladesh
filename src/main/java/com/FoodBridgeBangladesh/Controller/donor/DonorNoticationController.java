package com.FoodBridgeBangladesh.Controller.donor;

import com.FoodBridgeBangladesh.Model.donor.DonorNotication;
import com.FoodBridgeBangladesh.Model.donor.DonorNotication.NotificationType;
import com.FoodBridgeBangladesh.Service.donor.DonorNoticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/donor/notifications")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonorNoticationController {

    @Autowired
    private DonorNoticationService notificationService;

    /**
     * Get all notifications for a donor
     * GET /api/donor/notifications?donorId=1
     */
    @GetMapping
    public ResponseEntity<?> getAllNotifications(@RequestParam Long donorId) {
        try {
            List<DonorNotication> notifications = notificationService.getAllNotifications(donorId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch notifications: " + e.getMessage()));
        }
    }

    /**
     * Get notifications with pagination
     * GET /api/donor/notifications/paginated?donorId=1&page=0&size=10
     */
    @GetMapping("/paginated")
    public ResponseEntity<?> getNotificationsPaginated(
            @RequestParam Long donorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<DonorNotication> notifications = notificationService.getNotifications(donorId, page, size);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch notifications: " + e.getMessage()));
        }
    }

    /**
     * Get unread notifications
     * GET /api/donor/notifications/unread?donorId=1
     */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(@RequestParam Long donorId) {
        try {
            List<DonorNotication> notifications = notificationService.getUnreadNotifications(donorId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch unread notifications: " + e.getMessage()));
        }
    }

    /**
     * Get read notifications
     * GET /api/donor/notifications/read?donorId=1
     */
    @GetMapping("/read")
    public ResponseEntity<?> getReadNotifications(@RequestParam Long donorId) {
        try {
            List<DonorNotication> notifications = notificationService.getReadNotifications(donorId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch read notifications: " + e.getMessage()));
        }
    }

    /**
     * Get notifications by type
     * GET /api/donor/notifications/type?donorId=1&type=PICKUP_REQUEST
     */
    @GetMapping("/type")
    public ResponseEntity<?> getNotificationsByType(
            @RequestParam Long donorId,
            @RequestParam NotificationType type) {
        try {
            List<DonorNotication> notifications = notificationService.getNotificationsByType(donorId, type);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch notifications by type: " + e.getMessage()));
        }
    }

    /**
     * Get notification statistics
     * GET /api/donor/notifications/stats?donorId=1
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getNotificationStats(@RequestParam Long donorId) {
        try {
            Map<String, Long> stats = notificationService.getNotificationStats(donorId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch notification stats: " + e.getMessage()));
        }
    }

    /**
     * Get specific notification by ID
     * GET /api/donor/notifications/1?donorId=1
     */
    @GetMapping("/{notificationId}")
    public ResponseEntity<?> getNotificationById(
            @PathVariable Long notificationId,
            @RequestParam Long donorId) {
        try {
            Optional<DonorNotication> notification = notificationService.getNotificationById(notificationId, donorId);
            if (notification.isPresent()) {
                return ResponseEntity.ok(notification.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Notification not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch notification: " + e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     * PUT /api/donor/notifications/1/mark-read?donorId=1
     */
    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long donorId) {
        try {
            boolean success = notificationService.markAsRead(notificationId, donorId);
            if (success) {
                return ResponseEntity.ok(createSuccessResponse("Notification marked as read"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Notification not found or already read"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to mark notification as read: " + e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read
     * PUT /api/donor/notifications/mark-all-read?donorId=1
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestParam Long donorId) {
        try {
            int updatedCount = notificationService.markAllAsRead(donorId);
            Map<String, Object> response = createSuccessResponse("All notifications marked as read");
            response.put("updatedCount", updatedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to mark all notifications as read: " + e.getMessage()));
        }
    }

    /**
     * Delete notification
     * DELETE /api/donor/notifications/1?donorId=1
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam Long donorId) {
        try {
            boolean success = notificationService.deleteNotification(notificationId, donorId);
            if (success) {
                return ResponseEntity.ok(createSuccessResponse("Notification deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Notification not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete notification: " + e.getMessage()));
        }
    }

    /**
     * Create a pickup request notification (usually called by other services)
     * POST /api/donor/notifications/pickup-request
     */
    @PostMapping("/pickup-request")
    public ResponseEntity<?> createPickupRequestNotification(@RequestBody Map<String, Object> requestData) {
        try {
            Long donorId = Long.valueOf(requestData.get("donorId").toString());
            Long requestId = Long.valueOf(requestData.get("requestId").toString());
            Long donationId = Long.valueOf(requestData.get("donationId").toString());
            String requesterName = requestData.get("requesterName").toString();
            Long requesterId = Long.valueOf(requestData.get("requesterId").toString());
            String donationName = requestData.get("donationName").toString();
            String quantity = requestData.get("quantity").toString();

            DonorNotication notification = notificationService.createPickupRequestNotification(
                    donorId, requestId, donationId, requesterName, requesterId, donationName, quantity);

            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create pickup request notification: " + e.getMessage()));
        }
    }

    /**
     * Create a food request notification (usually called by other services)
     * POST /api/donor/notifications/food-request
     */
    @PostMapping("/food-request")
    public ResponseEntity<?> createFoodRequestNotification(@RequestBody Map<String, Object> requestData) {
        try {
            Long donorId = Long.valueOf(requestData.get("donorId").toString());
            Long foodRequestId = Long.valueOf(requestData.get("foodRequestId").toString());
            String requesterName = requestData.get("requesterName").toString();
            Long requesterId = Long.valueOf(requestData.get("requesterId").toString());
            String foodType = requestData.get("foodType").toString();
            Integer peopleCount = requestData.get("peopleCount") != null ?
                    Integer.valueOf(requestData.get("peopleCount").toString()) : 1;

            DonorNotication notification = notificationService.createFoodRequestNotification(
                    donorId, foodRequestId, requesterName, requesterId, foodType, peopleCount);

            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create food request notification: " + e.getMessage()));
        }
    }

    /**
     * Clean up old notifications
     * DELETE /api/donor/notifications/cleanup
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupOldNotifications() {
        try {
            int deletedCount = notificationService.cleanupOldNotifications();
            Map<String, Object> response = createSuccessResponse("Old notifications cleaned up");
            response.put("deletedCount", deletedCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to cleanup notifications: " + e.getMessage()));
        }
    }

    // Helper methods
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}