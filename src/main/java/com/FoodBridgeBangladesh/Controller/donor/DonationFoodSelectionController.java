package com.FoodBridgeBangladesh.Controller.donor;

import com.FoodBridgeBangladesh.Model.dto.FoodItemDTO;
import com.FoodBridgeBangladesh.Model.merchant.FoodItem;
import com.FoodBridgeBangladesh.Repository.merchant.FoodItemRepository;
import com.FoodBridgeBangladesh.Service.donor.DonationFoodItemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donor/food-items")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonationFoodSelectionController {

    private final Logger logger = LoggerFactory.getLogger(DonationFoodSelectionController.class);
    private final DonationFoodItemService donationFoodItemService;
    private final FoodItemRepository foodItemRepository;

    @Autowired
    public DonationFoodSelectionController(DonationFoodItemService donationFoodItemService,
                                           FoodItemRepository foodItemRepository) {
        this.donationFoodItemService = donationFoodItemService;
        this.foodItemRepository = foodItemRepository;
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<FoodItemDTO>> getFoodItemsByCategory(@RequestParam String category) {
        logger.info("API CALL: Fetching food items for donation by category: '{}'", category);

        try {
            FoodItem.FoodCategory foodCategory;

            if (category.equalsIgnoreCase("restaurant") ||
                    category.equalsIgnoreCase("Restaurant & Café Surplus")) {
                foodCategory = FoodItem.FoodCategory.RESTAURANT;
            } else if (category.equalsIgnoreCase("grocery") ||
                    category.equalsIgnoreCase("Grocery Store Excess")) {
                foodCategory = FoodItem.FoodCategory.GROCERY;
            } else {
                foodCategory = FoodItem.FoodCategory.OTHER;
            }

            logger.info("Converted category '{}' to enum value: {}", category, foodCategory);

            List<FoodItemDTO> foodItems = donationFoodItemService.getFoodItemsByCategory(foodCategory);

            // Ensure we never return null - always return a list (even if empty)
            if (foodItems == null) {
                foodItems = new ArrayList<>();
            }

            logger.info("Returning {} food items for category {}", foodItems.size(), category);

            // Always return 200 OK with the list (even if empty)
            return ResponseEntity.ok(foodItems);

        } catch (Exception e) {
            logger.error("Error fetching food items by category '{}': {}", category, e.getMessage(), e);

            // Return empty list instead of error to prevent JSON parsing issues
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Get all food items for donation (combined from all categories)
     * FIXED: Proper empty handling and JSON response
     */
    @GetMapping("/all")
    public ResponseEntity<List<FoodItemDTO>> getAllFoodItems() {
        try {
            List<FoodItemDTO> allItems = new ArrayList<>();

            // ✅ Fetch ALL three categories
            for (FoodItem.FoodCategory category : FoodItem.FoodCategory.values()) {
                try {
                    List<FoodItemDTO> categoryItems = donationFoodItemService.getFoodItemsByCategory(category);
                    if (categoryItems != null) {
                        allItems.addAll(categoryItems);
                    }
                } catch (Exception e) {
                    logger.warn("Error fetching {} items: {}", category, e.getMessage());
                }
            }

            // Filter by remaining quantity
            allItems = allItems.stream()
                    .filter(item -> item.getRemainingQuantity() != null && item.getRemainingQuantity() > 0)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(allItems);
        } catch (Exception e) {
            logger.error("Error fetching all food items: {}", e.getMessage(), e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
    /**
     * Get all available food items for donation
     * FIXED: Proper empty handling
     */
    @GetMapping("/available")
    public ResponseEntity<List<FoodItemDTO>> getAllAvailableFoodItems() {
        logger.info("Fetching all available food items for donation");
        try {
            List<FoodItemDTO> foodItems = donationFoodItemService.getAllAvailableFoodItems();

            // Ensure we never return null
            if (foodItems == null) {
                foodItems = new ArrayList<>();
            }

            logger.info("Returning {} available food items", foodItems.size());
            return ResponseEntity.ok(foodItems);

        } catch (Exception e) {
            logger.error("Error fetching all available food items: {}", e.getMessage(), e);

            // Return empty list instead of error
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Get food item details for donation
     */
    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDTO> getFoodItemDetailsForDonation(@PathVariable Long id) {
        logger.info("Fetching food item details for donation, item ID: {}", id);
        try {
            FoodItemDTO foodItem = donationFoodItemService.getFoodItemDetailsById(id);
            logger.info("Successfully retrieved food item with ID: {}", id);
            return ResponseEntity.ok(foodItem);
        } catch (Exception e) {
            logger.error("Error fetching food item details for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get count of food items by category - for testing API connectivity
     */
    @GetMapping("/count-by-category")
    public ResponseEntity<Map<String, Object>> getFoodItemCountByCategory(@RequestParam String category) {
        logger.info("API TEST: Counting food items for category: '{}'", category);

        try {
            FoodItem.FoodCategory foodCategory;

            if (category.equalsIgnoreCase("restaurant") ||
                    category.equalsIgnoreCase("Restaurant & Café Surplus")) {
                foodCategory = FoodItem.FoodCategory.RESTAURANT;
            } else if (category.equalsIgnoreCase("grocery") ||
                    category.equalsIgnoreCase("Grocery Store Excess")) {
                foodCategory = FoodItem.FoodCategory.GROCERY;
            } else {
                foodCategory = FoodItem.FoodCategory.OTHER;
            }

            // Use a query that doesn't fetch LOB data
            long count = foodItemRepository.countByFoodCategoryAndIsPausedFalse(foodCategory);

            // Return proper JSON response
            Map<String, Object> response = Map.of(
                    "category", category,
                    "count", count,
                    "status", "success"
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error counting items for category '{}': {}", category, e.getMessage());

            // Return error as JSON
            Map<String, Object> errorResponse = Map.of(
                    "category", category,
                    "count", 0,
                    "status", "error",
                    "message", e.getMessage()
            );

            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            long totalCount = foodItemRepository.count();
            long activeCount = foodItemRepository.countByFoodCategoryAndIsPausedFalse(FoodItem.FoodCategory.RESTAURANT) +
                    foodItemRepository.countByFoodCategoryAndIsPausedFalse(FoodItem.FoodCategory.GROCERY);

            Map<String, Object> health = Map.of(
                    "status", "healthy",
                    "totalFoodItems", totalCount,
                    "activeFoodItems", activeCount,
                    "timestamp", System.currentTimeMillis()
            );

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            Map<String, Object> health = Map.of(
                    "status", "error",
                    "message", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(health);
        }
    }
}