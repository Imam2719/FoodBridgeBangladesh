package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.donor.Donation;
import com.FoodBridgeBangladesh.Service.donor.DonationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Enhanced Controller for handling admin-specific donation operations
 * Provides comprehensive error handling and detailed logging
 */
@RestController
@RequestMapping("/api/admin/donations")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com", "https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class AdminDonationController {

    private static final Logger logger = LoggerFactory.getLogger(AdminDonationController.class);
    private static final List<String> VALID_STATUSES = Arrays.asList("Active", "Completed", "Expired");

    private final DonationService donationService;

    @Autowired
    public AdminDonationController(DonationService donationService) {
        this.donationService = donationService;
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllDonations() {
        logger.info("Admin fetching all donations");
        try {
            List<Donation> allDonations = donationService.findAll();
            return ResponseEntity.ok(allDonations);
        } catch (Exception e) {
            logger.error("Error fetching all donations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch all donations: " + e.getMessage()));
        }
    }
    /**
     * Comprehensive donation statistics endpoint
     * Provides detailed breakdown of donations
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDonationStats() {
        try {
            // Log start of method
            logger.info("Initiating donation statistics retrieval");

            // Safely fetch donations by status with detailed logging
            Map<String, List<Donation>> donationsByStatus = VALID_STATUSES.stream()
                    .collect(Collectors.toMap(
                            status -> status,
                            status -> {
                                try {
                                    List<Donation> donations = donationService.findByStatusOrderByCreatedAtDesc(status);
                                    logger.info("{} Donations Count: {}", status, donations.size());
                                    return donations;
                                } catch (Exception e) {
                                    logger.error("Error fetching {} donations", status, e);
                                    return Collections.emptyList();
                                }
                            }
                    ));

            // Prepare statistics map
            Map<String, Object> stats = new HashMap<>();

            // Count donations
            stats.put("activeCount", donationsByStatus.get("Active").size());
            stats.put("completedCount", donationsByStatus.get("Completed").size());
            stats.put("expiredCount", donationsByStatus.get("Expired").size());

            // Total donations
            int totalDonations = donationsByStatus.values().stream()
                    .mapToInt(List::size)
                    .sum();
            stats.put("totalCount", totalDonations);

            // Success rate calculation with robust error handling
            int successfulDonations = donationsByStatus.get("Completed").size();
            int totalProcessedDonations = donationsByStatus.get("Completed").size() +
                    donationsByStatus.get("Expired").size();

            double successRate = totalProcessedDonations > 0
                    ? ((double) successfulDonations / totalProcessedDonations) * 100
                    : 0.0;

            stats.put("successRate", Math.round(successRate));

            // Additional metadata
            stats.put("asOfDate", LocalDate.now().toString());
            stats.put("lastUpdated", new Date().toString());

            // Log successful stats generation
            logger.info("Donation statistics generated successfully: {}", stats);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // Comprehensive error logging
            logger.error("Critical error in donation statistics retrieval", e);

            // Detailed error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve donation statistics");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", new Date());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * Get active donations with enhanced error handling
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveDonations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        try {
            Page<Donation> activeDonations = donationService.findByStatusOrderByCreatedAtDesc("Active", pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("donations", activeDonations.getContent());
            response.put("totalPages", activeDonations.getTotalPages());
            response.put("currentPage", activeDonations.getNumber());
            response.put("totalItems", activeDonations.getTotalElements());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch active donations"));
        }
    }
    /**
     * Get completed donations with enhanced error handling
     */
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedDonations() {
        try {
            logger.info("Fetching completed donations");
            List<Donation> completedDonations = donationService.findByStatusOrderByCreatedAtDesc("Completed");

            if (completedDonations.isEmpty()) {
                logger.info("No completed donations found");
                return ResponseEntity.ok(Collections.emptyList());
            }

            logger.info("Retrieved {} completed donations", completedDonations.size());
            return ResponseEntity.ok(completedDonations);
        } catch (Exception e) {
            logger.error("Error fetching completed donations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch completed donations", "details", e.getMessage()));
        }
    }

    /**
     * Get expired donations with enhanced error handling
     */
    @GetMapping("/expired")
    public ResponseEntity<?> getExpiredDonations() {
        try {
            logger.info("Fetching expired donations");
            List<Donation> expiredDonations = donationService.findByStatusOrderByCreatedAtDesc("Expired");

            if (expiredDonations.isEmpty()) {
                logger.info("No expired donations found");
                return ResponseEntity.ok(Collections.emptyList());
            }

            logger.info("Retrieved {} expired donations", expiredDonations.size());
            return ResponseEntity.ok(expiredDonations);
        } catch (Exception e) {
            logger.error("Error fetching expired donations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch expired donations", "details", e.getMessage()));
        }
    }

    /**
     * Pause/Unpause a donation (Admin only)
     */
    @PutMapping("/{id}/pause")
    public ResponseEntity<?> pauseDonation(@PathVariable Long id) {
        logger.info("Admin pausing/unpausing donation with ID: {}", id);
        try {
            Donation donation = donationService.getDonationById(id);

            // Toggle between Active and Paused
            String newStatus = "Active".equals(donation.getStatus()) ? "Paused" : "Active";

            Donation updatedDonation = donationService.updateDonationStatus(id, newStatus);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Donation " + newStatus.toLowerCase() + " successfully");
            response.put("donation", updatedDonation);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error pausing/unpausing donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to pause/unpause donation: " + e.getMessage()));
        }
    }

    /**
     * Permanently delete a donation (Admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(@PathVariable Long id) {
        logger.info("Admin deleting donation with ID: {}", id);
        try {
            // Check if donation exists
            Donation donation = donationService.getDonationById(id);

            // Permanently delete the donation
            donationService.deleteDonation(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Donation deleted successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.error("Error deleting donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Donation not found with ID: " + id));
        } catch (Exception e) {
            logger.error("Error deleting donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete donation: " + e.getMessage()));
        }
    }
}