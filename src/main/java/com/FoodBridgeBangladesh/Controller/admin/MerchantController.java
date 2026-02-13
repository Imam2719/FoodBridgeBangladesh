package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.admin.MerchantEntity;
import com.FoodBridgeBangladesh.Model.admin.dto.MerchantDTO;
import com.FoodBridgeBangladesh.Service.admin.MerchantAddService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin/merchants")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MerchantController {

    private final MerchantAddService merchantAddService;
    private static final Logger logger = Logger.getLogger(MerchantController.class.getName());

    @Autowired
    public MerchantController(MerchantAddService merchantAddService) {
        this.merchantAddService = merchantAddService;
    }

    @PostMapping(value = "/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addMerchant(@ModelAttribute MerchantDTO merchantDTO) {
        try {
            // Log incoming request
            logger.info("Received merchant registration request for: " + merchantDTO.getBusinessName());

            // Validate fee data
            if (merchantDTO.getFeeType() == null ||
                    (!merchantDTO.getFeeType().equals("contractual") && !merchantDTO.getFeeType().equals("percentage"))) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid fee type. Must be either 'contractual' or 'percentage'");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (merchantDTO.getFeeAmount() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Fee amount is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (merchantDTO.getFeeAmount() < 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Fee amount cannot be negative");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // For percentage fee type, ensure it's not greater than 100%
            if (merchantDTO.getFeeType().equals("percentage") && merchantDTO.getFeeAmount() > 100) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Percentage fee cannot exceed 100%");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Process the merchant registration
            MerchantEntity addedMerchant = merchantAddService.addMerchant(merchantDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Merchant added successfully");
            response.put("merchantId", addedMerchant.getMerchantId());
            response.put("businessName", addedMerchant.getBusinessName());
            response.put("feeType", addedMerchant.getFeeType());
            response.put("feeAmount", addedMerchant.getFeeAmount());

            logger.info("Merchant registration successful for: " + addedMerchant.getBusinessName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            logger.warning("Validation error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("errorType", "ValidationError");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (RuntimeException e) {
            logger.severe("Runtime error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("errorType", "RuntimeError");

            HttpStatus status = e.getMessage().contains("already") ?
                    HttpStatus.CONFLICT : HttpStatus.INTERNAL_SERVER_ERROR;

            return ResponseEntity.status(status).body(response);

        } catch (Exception e) {
            logger.severe("Unexpected error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An unexpected error occurred during merchant registration");
            response.put("errorType", "UnexpectedError");
            response.put("errorDetails", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<MerchantEntity>> getAllMerchants() {
        List<MerchantEntity> merchants = merchantAddService.getAllMerchants();
        return ResponseEntity.ok(merchants);
    }

    @GetMapping("/{merchantId}")
    public ResponseEntity<?> getMerchantById(@PathVariable String merchantId) {
        Optional<MerchantEntity> merchant = merchantAddService.getMerchantById(merchantId);

        if (merchant.isPresent()) {
            return ResponseEntity.ok(merchant.get());
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Merchant not found");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/{merchantId}/status")
    public ResponseEntity<?> updateMerchantStatus(
            @PathVariable String merchantId,
            @RequestParam String status) {
        try {
            MerchantEntity updatedMerchant = merchantAddService.updateMerchantStatus(merchantId, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Merchant status updated successfully");
            response.put("merchantId", updatedMerchant.getMerchantId());
            response.put("status", updatedMerchant.getStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update merchant status");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping(value = "/{merchantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMerchant(
            @PathVariable String merchantId,
            @ModelAttribute MerchantDTO merchantDTO) {
        try {
            // Log incoming request
            logger.info("Received merchant update request for ID: " + merchantId);

            // Get the existing merchant
            Optional<MerchantEntity> merchantOpt = merchantAddService.getMerchantById(merchantId);
            if (!merchantOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Merchant not found"));
            }

            // Update the merchant
            MerchantEntity updatedMerchant = merchantAddService.updateMerchant(merchantId, merchantDTO);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Merchant updated successfully");
            response.put("merchantId", updatedMerchant.getMerchantId());
            response.put("businessName", updatedMerchant.getBusinessName());

            logger.info("Merchant update successful for: " + updatedMerchant.getBusinessName());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error updating merchant: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating merchant: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{merchantId}")
    public ResponseEntity<?> deleteMerchant(@PathVariable String merchantId) {
        try {
            merchantAddService.deleteMerchant(merchantId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Merchant deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete merchant");
            response.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint to get merchant logo
    @GetMapping("/{merchantId}/logo")
    public ResponseEntity<byte[]> getMerchantLogo(@PathVariable String merchantId) {
        Optional<MerchantEntity> merchantOpt = merchantAddService.getMerchantById(merchantId);

        if (merchantOpt.isPresent() && merchantOpt.get().getLogoBase64() != null) {
            MerchantEntity merchant = merchantOpt.get();
            byte[] logoData = Base64.getDecoder().decode(merchant.getLogoBase64());
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.parseMediaType(merchant.getLogoType()))
                    .body(logoData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint to get merchant license document
    @GetMapping("/{merchantId}/license")
    public ResponseEntity<byte[]> getMerchantLicense(@PathVariable String merchantId) {
        Optional<MerchantEntity> merchantOpt = merchantAddService.getMerchantById(merchantId);

        if (merchantOpt.isPresent() && merchantOpt.get().getLicenseDocumentBase64() != null) {
            MerchantEntity merchant = merchantOpt.get();
            byte[] licenseData = Base64.getDecoder().decode(merchant.getLicenseDocumentBase64());
            return ResponseEntity
                    .ok()
                    .contentType(MediaType.parseMediaType(merchant.getLicenseDocumentType()))
                    .body(licenseData);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}