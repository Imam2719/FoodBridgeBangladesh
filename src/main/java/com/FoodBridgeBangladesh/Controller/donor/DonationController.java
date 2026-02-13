package com.FoodBridgeBangladesh.Controller.donor;

import com.FoodBridgeBangladesh.Model.donor.Donation;
import com.FoodBridgeBangladesh.Model.dto.DonationDTO;
import com.FoodBridgeBangladesh.Model.dto.DonationFormDTO;
import com.FoodBridgeBangladesh.Model.merchant.FoodItem;
import com.FoodBridgeBangladesh.Repository.donor.DonationRepository;
import com.FoodBridgeBangladesh.Repository.merchant.FoodItemRepository;
import com.FoodBridgeBangladesh.Service.donor.DonationService;
import com.FoodBridgeBangladesh.Service.receiver.Receiver_ActiveFood_Request_Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donor/donations")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonationController {

    private final Logger logger = LoggerFactory.getLogger(DonationController.class);
    private final DonationService donationService;
    private final DonationRepository donationRepository;
    private final FoodItemRepository foodItemRepository;

    @Autowired
    private Receiver_ActiveFood_Request_Service receiverActiveRequestService;
    @Autowired
    public DonationController(
            DonationService donationService,
            DonationRepository donationRepository,
            FoodItemRepository foodItemRepository) {
        this.donationService = donationService;
        this.donationRepository = donationRepository;
        this.foodItemRepository = foodItemRepository;
    }

    /**
     * Create a new donation from a merchant food item
     */
    @PostMapping("/from-food-item")
    public ResponseEntity<?> createDonationFromFoodItem(@RequestBody Map<String, Object> payload) {
        logger.info("Creating donation from food item");

        try {
            // Extract and validate required parameters
            if (!payload.containsKey("foodItemId") || !payload.containsKey("donorId")) {
                return ResponseEntity.badRequest().body("Food item ID and donor ID are required");
            }

            Long foodItemId = Long.valueOf(payload.get("foodItemId").toString());
            Long donorId = Long.valueOf(payload.get("donorId").toString());
            String donorRole = payload.containsKey("donorRole") ? payload.get("donorRole").toString() : "DONOR";

            // Fetch the food item
            FoodItem foodItem = foodItemRepository.findById(foodItemId)
                    .orElseThrow(() -> new RuntimeException("Food item not found with ID: " + foodItemId));

            // Create a donation form DTO from the food item
            DonationFormDTO donationForm = new DonationFormDTO();
            donationForm.setFoodName(foodItem.getName());
            donationForm.setDescription(foodItem.getDescription());

            // Set category based on food item category
            if (foodItem.getFoodCategory() == FoodItem.FoodCategory.RESTAURANT) {
                donationForm.setCategory("RESTAURANT_SURPLUS");
                donationForm.setDonorType("Restaurant");
                donationForm.setCuisineType(foodItem.getFoodType());
            } else if (foodItem.getFoodCategory() == FoodItem.FoodCategory.GROCERY) {
                donationForm.setCategory("GROCERY_EXCESS");
                donationForm.setDonorType("Grocery Store");
                donationForm.setProductType(foodItem.getFoodType());
            } else {
                donationForm.setCategory("OTHER");
                donationForm.setDonorType("Other");
            }

            donationForm.setQuantity(foodItem.getQuantity().toString());
            donationForm.setExpiryDate(foodItem.getExpiryDate().toString());
            donationForm.setLocation(foodItem.getLocation());
            donationForm.setCorporateName(foodItem.getStoreName());
            donationForm.setDietaryInfo(foodItem.getDietaryInfo());
            donationForm.setDonorId(donorId);
            donationForm.setDonorRole(donorRole);
            donationForm.setOriginalFoodItemId(foodItemId);

            // Very important: Set the image data from the food item
            donationForm.setImageBase64(foodItem.getImageData());
            donationForm.setImageContentType(foodItem.getImageContentType());

            // Create the donation from the form without additional image file
            Donation donation = donationService.createDonation(donationForm, null);

            return ResponseEntity.status(HttpStatus.CREATED).body(donation);
        } catch (NumberFormatException e) {
            logger.error("Invalid ID format: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid ID format: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating donation from food item: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating donation: " + e.getMessage());
        }
    }

    /**
     * Create a new donation from form data
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createDonation(
            @RequestParam String foodName,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String quantity,
            @RequestParam String expiryDate,
            @RequestParam String location,
            @RequestParam String donorType,
            @RequestParam(required = false) String preparationDate,
            @RequestParam(required = false) List<String> dietaryInfo,
            @RequestParam(required = false) String packaging,
            @RequestParam(required = false) String storageInstructions,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String servedTime,
            @RequestParam(required = false) String temperatureRequirements,
            @RequestParam(required = false) String ingredients,
            @RequestParam(required = false) String servingSize,
            @RequestParam(required = false) String eventName,
            @RequestParam(required = false) String corporateName,
            @RequestParam(required = false) String contactPerson,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String bestBeforeDate,
            @RequestParam(required = false) Long originalFoodItemId,
            @RequestParam Long donorId,
            @RequestParam(required = false) String donorRole,
            @RequestParam(required = false) String imageBase64,
            @RequestParam(required = false) String imageContentType,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        logger.info("Creating new donation for donor ID: {}", donorId);

        try {
            // Create a DTO from the form data
            DonationFormDTO formDTO = new DonationFormDTO();
            formDTO.setFoodName(foodName);
            formDTO.setDescription(description);
            formDTO.setCategory(category);
            formDTO.setQuantity(quantity);
            formDTO.setExpiryDate(expiryDate);
            formDTO.setLocation(location);
            formDTO.setDonorType(donorType);
            formDTO.setPreparationDate(preparationDate);
            formDTO.setDietaryInfo(dietaryInfo);
            formDTO.setPackaging(packaging);
            formDTO.setStorageInstructions(storageInstructions);
            formDTO.setCuisineType(cuisineType);
            formDTO.setServedTime(servedTime);
            formDTO.setTemperatureRequirements(temperatureRequirements);
            formDTO.setIngredients(ingredients);
            formDTO.setServingSize(servingSize);
            formDTO.setEventName(eventName);
            formDTO.setCorporateName(corporateName);
            formDTO.setContactPerson(contactPerson);
            formDTO.setProductType(productType);
            formDTO.setBrandName(brandName);
            formDTO.setBestBeforeDate(bestBeforeDate);
            formDTO.setOriginalFoodItemId(originalFoodItemId);
            formDTO.setDonorId(donorId);
            formDTO.setDonorRole(donorRole != null ? donorRole : "DONOR");
            formDTO.setImageBase64(imageBase64);
            formDTO.setImageContentType(imageContentType);

            // If we have an original food item ID but no image, try to get the image from the food item
            FoodItem originalFoodItem = null;
            if (originalFoodItemId != null && (imageFile == null || imageFile.isEmpty()) &&
                    (imageBase64 == null || imageBase64.isEmpty())) {
                logger.info("Trying to get image from original food item ID: {}", originalFoodItemId);
                try {
                    originalFoodItem = foodItemRepository.findById(originalFoodItemId).orElse(null);
                    if (originalFoodItem != null && originalFoodItem.getImageData() != null) {
                        formDTO.setImageBase64(originalFoodItem.getImageData());
                        formDTO.setImageContentType(originalFoodItem.getImageContentType());
                        logger.info("Successfully retrieved image from original food item");
                    }
                } catch (Exception e) {
                    logger.warn("Error retrieving original food item image: {}", e.getMessage());
                    // Continue without the image if there's an error
                }
            }

            // Create donation with the original food item reference for image if needed
            Donation donation = originalFoodItem != null ?
                    donationService.createDonation(formDTO, imageFile, originalFoodItem) :
                    donationService.createDonation(formDTO, imageFile);

            return ResponseEntity.status(HttpStatus.CREATED).body(donation);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            logger.error("Error processing image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing image: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating donation: " + e.getMessage());
        }
    }

    /**
     * Get active donations for a donor
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveDonations(@RequestParam Long donorId) {
        logger.info("Getting active donations for donor ID: {}", donorId);

        try {
            List<Donation> donations = donationService.getActiveDonations(donorId);
            return ResponseEntity.ok(donations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error getting active donations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting active donations: " + e.getMessage());
        }
    }

    /**
     * Get donation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getDonationById(
            @PathVariable Long id,
            @RequestParam(required = false) Long donorId) {

        logger.info("Getting donation with ID: {} for donor ID: {}", id, donorId);

        try {
            Donation donation;

            if (donorId != null) {
                // Verify ownership if donor ID is provided
                donation = donationService.getDonationById(id, donorId);
            } else {
                // Public view if no donor ID (can be restricted based on requirements)
                donation = donationService.getDonationById(id);
            }

            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            logger.error("Error getting donation: {}", e.getMessage());

            if (e instanceof org.springframework.web.server.ResponseStatusException) {
                org.springframework.web.server.ResponseStatusException rse =
                        (org.springframework.web.server.ResponseStatusException) e;
                return ResponseEntity.status(rse.getStatusCode()).body(rse.getReason());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting donation: " + e.getMessage());
        }
    }

    /**
     * Update donation status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateDonationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestParam Long donorId) {

        logger.info("Updating donation status for ID: {} by donor ID: {}", id, donorId);

        String status = payload.get("status");
        if (status == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        try {
            Donation donation = donationService.updateDonationStatus(id, status, donorId);
            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            logger.error("Error updating donation status: {}", e.getMessage());

            if (e instanceof org.springframework.web.server.ResponseStatusException) {
                org.springframework.web.server.ResponseStatusException rse =
                        (org.springframework.web.server.ResponseStatusException) e;
                return ResponseEntity.status(rse.getStatusCode()).body(rse.getReason());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating donation status: " + e.getMessage());
        }
    }

    /**
     * Update donation details
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDonation(
            @PathVariable Long id,
            @RequestParam(required = false) String foodName,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String quantity,
            @RequestParam(required = false) String expiryDate,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String donorType,
            @RequestParam(required = false) String preparationDate,
            @RequestParam(required = false) List<String> dietaryInfo,
            @RequestParam(required = false) String packaging,
            @RequestParam(required = false) String storageInstructions,
            @RequestParam(required = false) String cuisineType,
            @RequestParam(required = false) String servedTime,
            @RequestParam(required = false) String temperatureRequirements,
            @RequestParam(required = false) String ingredients,
            @RequestParam(required = false) String servingSize,
            @RequestParam(required = false) String eventName,
            @RequestParam(required = false) String corporateName,
            @RequestParam(required = false) String contactPerson,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String bestBeforeDate,
            @RequestParam Long donorId,
            @RequestParam(required = false) String imageBase64,
            @RequestParam(required = false) String imageContentType,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        logger.info("Updating donation with ID: {} for donor ID: {}", id, donorId);

        try {
            // Create a DTO from the form data
            DonationFormDTO formDTO = new DonationFormDTO();
            formDTO.setFoodName(foodName);
            formDTO.setDescription(description);
            formDTO.setCategory(category);
            formDTO.setQuantity(quantity);
            formDTO.setExpiryDate(expiryDate);
            formDTO.setLocation(location);
            formDTO.setDonorType(donorType);
            formDTO.setPreparationDate(preparationDate);
            formDTO.setDietaryInfo(dietaryInfo);
            formDTO.setPackaging(packaging);
            formDTO.setStorageInstructions(storageInstructions);
            formDTO.setCuisineType(cuisineType);
            formDTO.setServedTime(servedTime);
            formDTO.setTemperatureRequirements(temperatureRequirements);
            formDTO.setIngredients(ingredients);
            formDTO.setServingSize(servingSize);
            formDTO.setEventName(eventName);
            formDTO.setCorporateName(corporateName);
            formDTO.setContactPerson(contactPerson);
            formDTO.setProductType(productType);
            formDTO.setBrandName(brandName);
            formDTO.setBestBeforeDate(bestBeforeDate);
            formDTO.setDonorId(donorId);
            formDTO.setImageBase64(imageBase64);
            formDTO.setImageContentType(imageContentType);

            // Log received category for debugging
            logger.info("Received category update: {}", category);

            Donation updatedDonation = donationService.updateDonation(id, formDTO, imageFile, donorId);
            return ResponseEntity.ok(updatedDonation);
        } catch (Exception e) {
            logger.error("Error updating donation: {}", e.getMessage());

            if (e instanceof org.springframework.web.server.ResponseStatusException) {
                org.springframework.web.server.ResponseStatusException rse =
                        (org.springframework.web.server.ResponseStatusException) e;
                return ResponseEntity.status(rse.getStatusCode()).body(rse.getReason());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating donation: " + e.getMessage());
        }
    }

    /**
     * Delete a donation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDonation(
            @PathVariable Long id,
            @RequestParam Long donorId) {

        logger.info("Deleting donation with ID: {} by donor ID: {}", id, donorId);

        try {
            donationService.deleteDonation(id, donorId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting donation: {}", e.getMessage());

            if (e instanceof org.springframework.web.server.ResponseStatusException) {
                org.springframework.web.server.ResponseStatusException rse =
                        (org.springframework.web.server.ResponseStatusException) e;
                return ResponseEntity.status(rse.getStatusCode()).body(rse.getReason());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting donation: " + e.getMessage());
        }
    }

    /**
     * Check if a user owns a donation
     */
    @GetMapping("/{id}/check-ownership")
    public ResponseEntity<?> checkDonationOwnership(
            @PathVariable Long id,
            @RequestParam Long donorId) {

        logger.info("Checking ownership of donation ID: {} for donor ID: {}", id, donorId);

        try {
            boolean isOwner = donationService.isDonationOwner(id, donorId);
            return ResponseEntity.ok(Map.of("isOwner", isOwner));
        } catch (Exception e) {
            logger.error("Error checking donation ownership: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking donation ownership: " + e.getMessage());
        }
    }

    /**
     * Accept donation request
     */
    @GetMapping("/{id}/accept-request")
    public ResponseEntity<?> acceptDonationRequest(
            @PathVariable Long id,
            @RequestParam Long donorId) {

        logger.info("Accepting request for donation with ID: {} by donor ID: {}", id, donorId);

        try {
            Donation donation = donationService.updateDonationToPending(id, donorId);
            return ResponseEntity.ok(donation);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error accepting donation request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error accepting donation request: " + e.getMessage());
        }
    }


    /**
     * Get pending donations for a donor
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingDonations(@RequestParam Long donorId) {
        logger.info("Getting donations with accepted requests for donor ID: {}", donorId);

        try {
            List<Donation> donations = donationService.getAcceptedRequestDonations(donorId);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            logger.error("Error getting donations with accepted requests: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting donations with accepted requests: " + e.getMessage());
        }
    }
    /**
     * Get rejected donations for a donor
     */
    @GetMapping("/rejected")
    public ResponseEntity<?> getRejectedDonations(@RequestParam Long donorId) {
        logger.info("Getting donations with rejected requests for donor ID: {}", donorId);

        try {
            List<Donation> donations = donationService.getRejectedRequestDonations(donorId);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            logger.error("Error getting donations with rejected requests: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting donations with rejected requests: " + e.getMessage());
        }
    }

    // Update these methods in DonationController.java

    /**
     * Get donations with completed pickup requests for a donor
     */
    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedDonations(@RequestParam Long donorId) {
        logger.info("Getting donations with completed requests for donor ID: {}", donorId);

        try {
            List<Donation> donations = donationService.getCompletedRequestDonations(donorId);

            // Optional: Convert to DTO for more controlled response
            List<DonationDTO> donationDTOs = donations.stream()
                    .map(DonationDTO::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(donationDTOs);
        } catch (Exception e) {
            logger.error("Error getting donations with completed requests: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to retrieve donations with completed requests",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Mark pickup request as completed (updates receiver_food_requests table)
     */
    @GetMapping("/{id}/mark-completed")
    public ResponseEntity<?> markDonationAsCompleted(
            @PathVariable Long id,
            @RequestParam Long donorId) {

        logger.info("Marking pickup request as completed for donation ID: {} by donor ID: {}", id, donorId);

        try {
            // Inject the receiver service
            receiverActiveRequestService.markRequestAsCompletedByDonor(id, donorId);

            // Return the donation for consistency
            Donation donation = donationService.getDonationById(id, donorId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Pickup request marked as completed successfully",
                    "donation", donation
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error marking pickup request as completed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error marking pickup request as completed: " + e.getMessage()
                    ));
        }
    }
}