package com.FoodBridgeBangladesh.Controller.merchant;

import com.FoodBridgeBangladesh.Model.donor.Donation;
import com.FoodBridgeBangladesh.Model.dto.DonationFormDTO;
import com.FoodBridgeBangladesh.Repository.merchant.FoodItemRepository;
import com.FoodBridgeBangladesh.Repository.donor.DonationRepository;
import com.FoodBridgeBangladesh.Model.merchant.FoodItem;
import com.FoodBridgeBangladesh.Service.donor.DonationService;
import com.FoodBridgeBangladesh.Service.merchant.MerchantDonationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/merchant/donate")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MerchantDonationController {

    private final Logger logger = LoggerFactory.getLogger(MerchantDonationController.class);
    private final MerchantDonationService merchantDonationService;
    private final DonationService donationService;

    @Autowired
    public MerchantDonationController(
            MerchantDonationService merchantDonationService,
            DonationService donationService) {
        this.merchantDonationService = merchantDonationService;
        this.donationService = donationService;
    }

    /**
     * Create a new donation directly from a merchant's food item
     */
    @PostMapping("/create")
    public ResponseEntity<?> createDonation(@RequestBody Map<String, Object> payload) {
        logger.info("Creating merchant donation with payload: {}", payload);

        try {
            // Extract required parameters
            if (!payload.containsKey("foodItemId") || !payload.containsKey("merchantId") ||
                    !payload.containsKey("quantity")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid input",
                        "message", "Food item ID, merchant ID, and quantity are required"
                ));
            }

            Long foodItemId = Long.valueOf(payload.get("foodItemId").toString());
            Long merchantId = Long.valueOf(payload.get("merchantId").toString());
            Integer quantity = Integer.valueOf(payload.get("quantity").toString());

            // Create a complete donation form DTO with all fields from the payload
            DonationFormDTO donationForm = new DonationFormDTO();
            donationForm.setFoodName(getStringFromPayload(payload, "foodName"));
            donationForm.setDescription(getStringFromPayload(payload, "description"));
            donationForm.setCategory(getStringFromPayload(payload, "category"));
            donationForm.setQuantity(String.valueOf(quantity));
            donationForm.setExpiryDate(getStringFromPayload(payload, "expiryDate"));
            donationForm.setPreparationDate(getStringFromPayload(payload, "preparationDate"));
            donationForm.setLocation(getStringFromPayload(payload, "location"));
            donationForm.setDonorType(getStringFromPayload(payload, "donorType"));
            donationForm.setPackaging(getStringFromPayload(payload, "packaging"));
            donationForm.setStorageInstructions(getStringFromPayload(payload, "storageInstructions"));
            donationForm.setNotes(getStringFromPayload(payload, "notes"));
            donationForm.setFoodType(getStringFromPayload(payload, "foodType"));
            donationForm.setStoreName(getStringFromPayload(payload, "storeName"));
            donationForm.setOriginalFoodItemId(foodItemId);
            donationForm.setDonorId(merchantId);
            donationForm.setDonorRole("MERCHANT");

            // Extract dietary info if present
            if (payload.containsKey("dietaryInfo") && payload.get("dietaryInfo") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> dietaryInfo = (List<String>) payload.get("dietaryInfo");
                donationForm.setDietaryInfo(dietaryInfo);
            }

            // Call service method to create donation
            Donation savedDonation = merchantDonationService.createMerchantDonationFromForm(donationForm);

            // Return success response with the complete donation object
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("donation", savedDonation);
            response.put("message", "Donation created successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    // Helper method to safely get String values from payload
    private String getStringFromPayload(Map<String, Object> payload, String key) {
        return payload.containsKey(key) && payload.get(key) != null ? payload.get(key).toString() : null;
    }

    /**
     * Get all donations for a merchant
     */
    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<?> getMerchantDonations(@PathVariable Long merchantId) {
        logger.info("Getting donations for merchant ID: {}", merchantId);

        try {
            List<Donation> donations = merchantDonationService.getMerchantDonations(merchantId);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            logger.error("Error getting merchant donations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/merchant/{merchantId}/status/{status}")
    public ResponseEntity<?> getMerchantDonationsByStatus(
            @PathVariable Long merchantId,
            @PathVariable String status) {

        logger.info("Getting donations for merchant ID: {} with status: {}", merchantId, status);

        try {
            // Log the exact status string being used for debugging
            logger.info("Searching with exact status string: '{}'", status);

            // Call service method to get donations
            List<Donation> donations = merchantDonationService.getMerchantDonationsByStatus(merchantId, status);

            // Log results for debugging
            logger.info("Found {} donations with status '{}' for merchant ID: {}",
                    donations.size(), status, merchantId);

            // Log details of each donation for troubleshooting
            if (donations.isEmpty()) {
                logger.info("No donations found for merchant ID: {} with status: {}", merchantId, status);
            } else {
                for (Donation donation : donations) {
                    logger.info("Donation [ID: {}, Name: {}, Status: '{}']",
                            donation.getId(),
                            donation.getFoodName(),
                            donation.getStatus());
                }
            }

            // Return just the donations array as before
            return ResponseEntity.ok(donations);

        } catch (Exception e) {
            logger.error("Error getting merchant donations by status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }
    /**
     * Update donation status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDonationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestParam Long merchantId) {

        logger.info("Updating merchant donation status for ID: {} by merchant ID: {}", id, merchantId);

        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid input",
                    "message", "Status is required"
            ));
        }

        try {
            Donation donation =
                    merchantDonationService.updateDonationStatus(id, status, merchantId);
            return ResponseEntity.ok(donation);
        } catch (IllegalStateException e) {
            logger.warn("Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Operation not allowed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error updating merchant donation status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get donation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(
            @PathVariable Long id,
            @RequestParam Long merchantId) {

        logger.info("Getting merchant donation with ID: {} for merchant ID: {}", id, merchantId);

        try {
            Donation donation = merchantDonationService.getDonationById(id, merchantId);
            return ResponseEntity.ok(donation);
        } catch (IllegalStateException e) {
            logger.warn("Business rule violation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Operation not allowed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error getting merchant donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }
    /**
     * Delete a donation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(
            @PathVariable Long id,
            @RequestParam Long merchantId) {

        logger.info("Deleting donation with ID: {} by merchant ID: {}", id, merchantId);

        try {
            // Use MerchantDonationService instead of DonationService
            merchantDonationService.deleteDonation(id, merchantId);  // ✅

            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            logger.warn("Business rule violation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Operation not allowed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error deleting merchant donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Update donation details
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDonation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @RequestParam Long merchantId) {

        logger.info("Updating donation with ID: {} for merchant ID: {}", id, merchantId);

        try {
            // Create a donation form DTO from the payload
            DonationFormDTO donationForm = new DonationFormDTO();

            // Set fields from payload
            if (payload.containsKey("foodName")) {
                donationForm.setFoodName(payload.get("foodName").toString());
            }
            if (payload.containsKey("category")) {
                donationForm.setCategory(payload.get("category").toString());
            }
            if (payload.containsKey("quantity")) {
                donationForm.setQuantity(payload.get("quantity").toString());
            }
            if (payload.containsKey("expiryDate")) {
                donationForm.setExpiryDate(payload.get("expiryDate").toString());
            }
            if (payload.containsKey("location")) {
                donationForm.setLocation(payload.get("location").toString());
            }
            if (payload.containsKey("packaging")) {
                donationForm.setPackaging(payload.get("packaging").toString());
            }
            if (payload.containsKey("storageInstructions")) {
                donationForm.setStorageInstructions(payload.get("storageInstructions").toString());
            }

            // Extract dietary info if present
            if (payload.containsKey("dietaryInfo") && payload.get("dietaryInfo") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> dietaryInfo = (List<String>) payload.get("dietaryInfo");
                donationForm.setDietaryInfo(dietaryInfo);
            }

            donationForm.setDonorId(merchantId);

            // Call donation service to update the donation
            Donation updatedDonation = donationService.updateDonation(id, donationForm, null, merchantId);

            return ResponseEntity.ok(updatedDonation);
        } catch (IllegalStateException e) {
            logger.warn("Business rule violation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Operation not allowed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error updating merchant donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }
}