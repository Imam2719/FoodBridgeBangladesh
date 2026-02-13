package com.FoodBridgeBangladesh.Controller.merchant;

import com.FoodBridgeBangladesh.Model.dto.FoodItemDTO;
import com.FoodBridgeBangladesh.Repository.merchant.FoodItemRepository;
import com.FoodBridgeBangladesh.Model.merchant.FoodItem;
import com.FoodBridgeBangladesh.Service.merchant.FoodItemService;
import com.FoodBridgeBangladesh.Service.merchant.MerchantDonationService;
import com.FoodBridgeBangladesh.Service.merchant.MerchantSaleService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/merchant/food-items")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class FoodItemController {

    private final Logger logger = LoggerFactory.getLogger(FoodItemController.class);
    private final FoodItemService foodItemService;
    private final FoodItemRepository foodItemRepository;
    private final MerchantSaleService merchantSaleService;
    private final MerchantDonationService merchantDonationService;

    @Autowired
    public FoodItemController(
            FoodItemService foodItemService,
            FoodItemRepository foodItemRepository,
            MerchantSaleService merchantSaleService,
            MerchantDonationService merchantDonationService) {
        this.foodItemService = foodItemService;
        this.foodItemRepository = foodItemRepository;
        this.merchantSaleService = merchantSaleService;
        this.merchantDonationService = merchantDonationService;
    }

    /**
     * Get all food items for the merchant
     */
    @GetMapping
    public ResponseEntity<List<FoodItemDTO>> getAllMerchantFoodItems(@RequestParam Long merchantId) {
        logger.info("Getting all food items for merchant ID: {}", merchantId);
        List<FoodItem> foodItems = foodItemService.getMerchantFoodItems(merchantId);
        List<FoodItemDTO> foodItemDTOs = foodItems.stream()
                .map(item -> {
                    FoodItemDTO dto = FoodItemDTO.fromEntity(item);
                    // Include Base64 image data
                    dto.setImageBase64(item.getImageData());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(foodItemDTOs);
    }

    /**
     * Get food item by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDTO> getFoodItemById(@PathVariable Long id) {
        logger.info("Getting food item with ID: {}", id);
        try {
            FoodItem foodItem = foodItemService.getFoodItemById(id);
            FoodItemDTO dto = FoodItemDTO.fromEntity(foodItem);

            // ✅ FIXED: Use actual remaining quantity (no double deduction)
            dto.setRemainingQuantity(foodItem.getQuantity());

            // Make sure image data is included
            dto.setImageBase64(foodItemService.getImageBase64(id));

            // Set image content type if available
            if (foodItem.getImageContentType() != null) {
                dto.setImageContentType(foodItem.getImageContentType());
            } else {
                dto.setImageContentType("image/jpeg");
            }

            logger.info("Successfully retrieved food item with ID: {}, remaining quantity: {}, image present: {}",
                    id,
                    foodItem.getQuantity(),
                    dto.getImageBase64() != null);

            return ResponseEntity.ok(dto);
        } catch (EntityNotFoundException e) {
            logger.warn("Food item not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error retrieving food item with ID: {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    /**
     * Create a new food item - updated to accept form fields directly
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createFoodItem(
            @RequestParam(required = false) String id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String foodCategory,
            @RequestParam String foodType,
            @RequestParam String price,
            @RequestParam String quantity,
            @RequestParam String expiryDate,
            @RequestParam String location,
            @RequestParam String storeName,
            @RequestParam String makingTime,
            @RequestParam String deliveryTime,
            @RequestParam(required = false) List<String> dietaryInfo,
            @RequestParam(defaultValue = "false") Boolean isPaused,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            @RequestParam Long merchantId) {

        logger.info("Creating new food item for merchant ID: {}", merchantId);
        try {
            // Create a new FoodItem entity from the form data
            FoodItem foodItem = new FoodItem();
            if (id != null && !id.isEmpty()) {
                try {
                    foodItem.setId(Long.parseLong(id));
                } catch (NumberFormatException e) {
                    logger.warn("Invalid ID format: {}", id);
                    // Ignore if id is not a valid number
                }
            }

            foodItem.setName(name);
            foodItem.setDescription(description);
            try {
                foodItem.setFoodCategory(FoodItem.FoodCategory.valueOf(foodCategory));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid food category: {}", foodCategory);
                return ResponseEntity.badRequest().body("Invalid food category: " + foodCategory);
            }
            foodItem.setFoodType(foodType);

            try {
                foodItem.setPrice(new BigDecimal(price));
            } catch (NumberFormatException e) {
                logger.warn("Invalid price format: {}", price);
                return ResponseEntity.badRequest().body("Invalid price format");
            }

            try {
                foodItem.setQuantity(Integer.parseInt(quantity));
            } catch (NumberFormatException e) {
                logger.warn("Invalid quantity format: {}", quantity);
                return ResponseEntity.badRequest().body("Invalid quantity format");
            }

            try {
                foodItem.setExpiryDate(LocalDate.parse(expiryDate));
            } catch (Exception e) {
                logger.warn("Invalid expiry date format: {}", expiryDate);
                return ResponseEntity.badRequest().body("Invalid expiry date format. Use YYYY-MM-DD");
            }

            foodItem.setLocation(location);
            foodItem.setStoreName(storeName);

            try {
                foodItem.setMakingTime(LocalTime.parse(makingTime));
            } catch (Exception e) {
                logger.warn("Invalid making time format: {}", makingTime);
                return ResponseEntity.badRequest().body("Invalid making time format. Use HH:MM");
            }

            foodItem.setDeliveryTime(deliveryTime);

            if (dietaryInfo != null) {
                foodItem.setDietaryInfo(dietaryInfo);
            }

            foodItem.setPaused(isPaused);
            foodItem.setMerchantId(merchantId);
            foodItem.setCreatedAt(LocalDate.now());

            // Log image file details if present
            if (imageFile != null && !imageFile.isEmpty()) {
                logger.info("Image file received: {} ({}), size: {} bytes",
                        imageFile.getOriginalFilename(),
                        imageFile.getContentType(),
                        imageFile.getSize());
            } else {
                logger.info("No image file received");
            }

            FoodItem createdItem = foodItemService.createFoodItem(foodItem, imageFile);
            logger.info("Food item created successfully with ID: {}", createdItem.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(FoodItemDTO.fromEntity(createdItem));
        } catch (IOException e) {
            logger.error("Error processing image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing image: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error creating food item: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating food item: " + e.getMessage());
        }
    }

    /**
     * Update an existing food item - updated to accept form fields directly
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam String foodCategory,
            @RequestParam String foodType,
            @RequestParam String price,
            @RequestParam String quantity,
            @RequestParam String expiryDate,
            @RequestParam String location,
            @RequestParam String storeName,
            @RequestParam String makingTime,
            @RequestParam String deliveryTime,
            @RequestParam(required = false) List<String> dietaryInfo,
            @RequestParam(defaultValue = "false") Boolean isPaused,
            @RequestParam(required = false) Long merchantId,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        logger.info("Updating food item with ID: {}", id);
        try {
            // Create entity from form data
            FoodItem foodItem = new FoodItem();
            foodItem.setId(id);
            foodItem.setName(name);
            foodItem.setDescription(description);

            try {
                foodItem.setFoodCategory(FoodItem.FoodCategory.valueOf(foodCategory));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid food category: {}", foodCategory);
                return ResponseEntity.badRequest().body("Invalid food category: " + foodCategory);
            }

            foodItem.setFoodType(foodType);

            try {
                foodItem.setPrice(new BigDecimal(price));
            } catch (NumberFormatException e) {
                logger.warn("Invalid price format: {}", price);
                return ResponseEntity.badRequest().body("Invalid price format");
            }

            try {
                foodItem.setQuantity(Integer.parseInt(quantity));
            } catch (NumberFormatException e) {
                logger.warn("Invalid quantity format: {}", quantity);
                return ResponseEntity.badRequest().body("Invalid quantity format");
            }

            try {
                foodItem.setExpiryDate(LocalDate.parse(expiryDate));
            } catch (Exception e) {
                logger.warn("Invalid expiry date format: {}", expiryDate);
                return ResponseEntity.badRequest().body("Invalid expiry date format. Use YYYY-MM-DD");
            }

            foodItem.setLocation(location);
            foodItem.setStoreName(storeName);

            try {
                foodItem.setMakingTime(LocalTime.parse(makingTime));
            } catch (Exception e) {
                logger.warn("Invalid making time format: {}", makingTime);
                return ResponseEntity.badRequest().body("Invalid making time format. Use HH:MM");
            }

            foodItem.setDeliveryTime(deliveryTime);

            if (dietaryInfo != null) {
                foodItem.setDietaryInfo(dietaryInfo);
            }

            foodItem.setPaused(isPaused);

            // Set merchantId if provided
            if (merchantId != null) {
                foodItem.setMerchantId(merchantId);
            }

            // Log image file details if present
            if (imageFile != null && !imageFile.isEmpty()) {
                logger.info("Image file received for update: {} ({}), size: {} bytes",
                        imageFile.getOriginalFilename(),
                        imageFile.getContentType(),
                        imageFile.getSize());
            } else {
                logger.info("No image file received for update");
            }

            FoodItem updatedItem = foodItemService.updateFoodItem(id, foodItem, imageFile);
            logger.info("Food item updated successfully with ID: {}", updatedItem.getId());
            return ResponseEntity.ok(FoodItemDTO.fromEntity(updatedItem));
        } catch (EntityNotFoundException e) {
            logger.warn("Food item not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            logger.error("Error processing image: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing image: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating food item: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating food item: " + e.getMessage());
        }
    }

    /**
     * Delete a food item
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        logger.info("Deleting food item with ID: {}", id);
        try {
            foodItemService.deleteFoodItem(id);
            logger.info("Food item deleted successfully with ID: {}", id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            logger.warn("Food item not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Toggle pause status of a food item
     */
    @PutMapping("/{id}/toggle-pause")
    public ResponseEntity<FoodItemDTO> togglePauseStatus(@PathVariable Long id) {
        logger.info("Toggling pause status for food item with ID: {}", id);
        try {
            FoodItem updatedItem = foodItemService.togglePauseStatus(id);
            logger.info("Pause status toggled for food item ID: {}, new status: {}", id, updatedItem.isPaused());
            return ResponseEntity.ok(FoodItemDTO.fromEntity(updatedItem));
        } catch (EntityNotFoundException e) {
            logger.warn("Food item not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all active (non-paused) food items
     */
    @GetMapping("/active")
    public ResponseEntity<List<FoodItemDTO>> getAllActiveFoodItems() {
        logger.info("Getting all active food items");
        List<FoodItem> activeItems = foodItemService.getAllActiveFoodItems();
        List<FoodItemDTO> dtos = activeItems.stream()
                .map(FoodItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    /**
     * Search food items by name or description
     */
    @GetMapping("/search")
    public ResponseEntity<List<FoodItemDTO>> searchFoodItems(@RequestParam String query) {
        logger.info("Searching for food items with query: {}", query);
        List<FoodItem> searchResults = foodItemService.searchFoodItems(query);
        List<FoodItemDTO> dtos = searchResults.stream()
                .map(FoodItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Filter food items by category
     */
    @GetMapping("/filter")
    public ResponseEntity<List<FoodItemDTO>> filterByCategory(@RequestParam String category) {
        logger.info("Filtering food items by category: {}", category);
        try {
            FoodItem.FoodCategory foodCategory = FoodItem.FoodCategory.valueOf(category.toUpperCase());
            List<FoodItem> filteredItems = foodItemService.filterByCategory(foodCategory);
            List<FoodItemDTO> dtos = filteredItems.stream()
                    .map(FoodItemDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid category for filtering: {}", category);
            return ResponseEntity.badRequest().build();
        }
    }
    /**
     * Get food item image directly
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getFoodItemImage(@PathVariable Long id) {
        logger.info("Getting image for food item with ID: {}", id);
        try {
            byte[] imageData = foodItemService.getFoodItemImage(id); // Use service method that decodes Base64

            if (imageData == null) {
                logger.warn("No image found for food item with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            FoodItem foodItem = foodItemService.getFoodItemById(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(foodItem.getImageContentType()));

            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            logger.warn("Food item not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
    /**
     * For debugging - test endpoint to check if controller is working
     */
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        logger.info("Status check requested");
        return ResponseEntity.ok("FoodItemController is working correctly. Server time: " + LocalDate.now());
    }

    /**
     * Handle exceptions explicitly for improved error messages
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        logger.error("Unhandled exception in FoodItemController: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + e.getMessage());
    }
    /**
     * Get a food item with remaining quantity information
     */
    @GetMapping("/{id}/with-remaining")
    public ResponseEntity<?> getFoodItemWithRemainingQuantity(@PathVariable Long id) {
        logger.info("Getting food item with remaining quantity, ID: {}", id);

        try {
            FoodItem foodItem = foodItemRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Food item not found with ID: " + id));

            FoodItemDTO dto = FoodItemDTO.fromEntity(foodItem);
            dto.setImageBase64(foodItem.getImageData());

            Integer remainingQuantity = foodItem.getQuantity();

            Map<String, Object> response = new HashMap<>();
            response.put("foodItem", dto);
            response.put("remainingQuantity", remainingQuantity);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting food item with remaining quantity: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting food item: " + e.getMessage());
        }
    }
}