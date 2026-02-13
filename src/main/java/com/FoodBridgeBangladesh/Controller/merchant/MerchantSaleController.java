package com.FoodBridgeBangladesh.Controller.merchant;

import com.FoodBridgeBangladesh.Model.merchant.MerchantSale;
import com.FoodBridgeBangladesh.Service.merchant.MerchantSaleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/merchant/sales")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MerchantSaleController {

    private final Logger logger = LoggerFactory.getLogger(MerchantSaleController.class);
    private final MerchantSaleService merchantSaleService;

    @Autowired
    public MerchantSaleController(MerchantSaleService merchantSaleService) {
        this.merchantSaleService = merchantSaleService;
    }

    /**
     * Create a new sale and donation
     */
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createSaleAndDonation(
            @RequestParam Long foodItemId,
            @RequestParam Long donorId,
            @RequestParam Integer quantity,
            @RequestParam(defaultValue = "CASH") String paymentMethod,
            @RequestParam(required = false) String deliveryAddress,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String customerPhone,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        logger.info("Creating sale and donation for food item ID: {}, donor ID: {}, quantity: {}, customer: {}",
                foodItemId, donorId, quantity, customerName);

        try {
            Map<String, Object> result = merchantSaleService.createSaleAndDonation(
                    foodItemId, donorId, quantity, paymentMethod, imageFile);

            // Add customer information to the response
            if (customerName != null) {
                result.put("customerName", customerName);
            }
            if (customerPhone != null) {
                result.put("customerPhone", customerPhone);
            }
            if (deliveryAddress != null) {
                result.put("deliveryAddress", deliveryAddress);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid input for sale creation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid input",
                    "message", e.getMessage()
            ));
        } catch (IllegalStateException e) {
            logger.warn("Food item unavailable: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Food item unavailable",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error creating sale and donation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get merchant sales with detailed information
     */
    @GetMapping("/merchant/{merchantId}/detailed")
    public ResponseEntity<?> getMerchantSalesDetailed(@PathVariable Long merchantId) {
        logger.info("Getting detailed sales for merchant ID: {}", merchantId);

        try {
            List<Map<String, Object>> salesDetails = merchantSaleService.getMerchantSalesWithDetails(merchantId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "sales", salesDetails,
                    "totalSales", salesDetails.size()
            ));
        } catch (Exception e) {
            logger.error("Error getting merchant sales details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get merchant sales
     */
    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<?> getMerchantSales(@PathVariable Long merchantId) {
        logger.info("Getting sales for merchant ID: {}", merchantId);

        try {
            List<MerchantSale> sales = merchantSaleService.getMerchantSales(merchantId);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            logger.error("Error getting merchant sales: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Delete a sale permanently
     */
    @DeleteMapping("/{saleId}")
    public ResponseEntity<?> deleteSale(
            @PathVariable Long saleId,
            @RequestParam Long merchantId) {

        logger.info("Deleting sale ID: {} for merchant ID: {}", saleId, merchantId);

        try {
            boolean deleted = merchantSaleService.deleteSale(saleId, merchantId);

            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Sale deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "success", false,
                        "message", "Failed to delete sale"
                ));
            }
        } catch (SecurityException e) {
            logger.warn("Security violation - merchant {} tried to delete sale {} they don't own", merchantId, saleId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Forbidden",
                    "message", "You don't have permission to delete this sale"
            ));
        } catch (IllegalStateException e) {
            logger.warn("Invalid state for sale deletion: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid state",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Error deleting sale: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get donor purchases
     */
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<?> getDonorPurchases(@PathVariable Long donorId) {
        logger.info("Getting purchases for donor ID: {}", donorId);

        try {
            List<MerchantSale> purchases = merchantSaleService.getDonorSales(donorId);
            return ResponseEntity.ok(purchases);
        } catch (Exception e) {
            logger.error("Error getting donor purchases: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get remaining quantity for a food item
     */
    @GetMapping("/remaining-quantity/{foodItemId}")
    public ResponseEntity<?> getRemainingQuantity(@PathVariable Long foodItemId) {
        logger.info("Getting remaining quantity for food item ID: {}", foodItemId);

        try {
            Integer remainingQuantity = merchantSaleService.getRemainingQuantity(foodItemId);
            return ResponseEntity.ok(Map.of("remainingQuantity", remainingQuantity));
        } catch (Exception e) {
            logger.error("Error getting remaining quantity: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Update sale status
     */
    @PutMapping("/{saleId}/status")
    public ResponseEntity<?> updateSaleStatus(
            @PathVariable Long saleId,
            @RequestParam String status) {

        logger.info("Updating sale status for ID: {} to {}", saleId, status);

        try {
            MerchantSale updatedSale = merchantSaleService.updateSaleStatus(saleId, status);
            return ResponseEntity.ok(updatedSale);
        } catch (Exception e) {
            logger.error("Error updating sale status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Server error",
                    "message", e.getMessage()
            ));
        }
    }
}