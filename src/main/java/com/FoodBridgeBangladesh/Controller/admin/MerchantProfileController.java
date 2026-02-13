package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.admin.MerchantEntity;
import com.FoodBridgeBangladesh.Repository.admin.MerchantAddRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/merchant/profile")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class MerchantProfileController {

    private static final Logger logger = Logger.getLogger(MerchantProfileController.class.getName());

    @Autowired
    private MerchantAddRepository merchantRepository;

    /**
     * Get merchant profile by merchantId
     */
    @GetMapping
    public ResponseEntity<?> getMerchantProfile(@RequestParam Long merchantId) {
        try {
            logger.info("Fetching profile for merchant ID: " + merchantId);

            // Find merchant by id
            Optional<MerchantEntity> merchantOpt = merchantRepository.findById(merchantId);

            if (merchantOpt.isPresent()) {
                MerchantEntity merchant = merchantOpt.get();
                logger.info("Found merchant profile: " + merchant.getBusinessName());
                return ResponseEntity.ok(merchant);
            } else {
                logger.warning("Merchant profile not found for ID: " + merchantId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Merchant profile not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching merchant profile: " + e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error fetching merchant profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Update merchant profile
     */
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateMerchantProfile(
            @RequestParam Long merchantId,
            @RequestParam String ownerFirstName,
            @RequestParam String ownerLastName,
            @RequestParam String businessName,
            @RequestParam String email,
            @RequestParam String phoneNumber,
            @RequestParam String businessAddress,
            @RequestParam(required = false) String businessDescription,
            @RequestParam String businessType,
            @RequestParam String businessLicenseNumber,
            @RequestParam String city,
            @RequestParam String stateProvince,
            @RequestParam String postalCode,
            @RequestPart(required = false) MultipartFile logo) {

        try {
            logger.info("Updating profile for merchant ID: " + merchantId);

            // Find merchant by id
            Optional<MerchantEntity> merchantOpt = merchantRepository.findById(merchantId);

            if (!merchantOpt.isPresent()) {
                logger.warning("Merchant not found for ID: " + merchantId);
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Merchant not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            MerchantEntity merchant = merchantOpt.get();

            // Update merchant fields
            merchant.setOwnerFirstName(ownerFirstName);
            merchant.setOwnerLastName(ownerLastName);
            merchant.setBusinessName(businessName);
            merchant.setEmail(email);
            merchant.setPhoneNumber(phoneNumber);
            merchant.setBusinessAddress(businessAddress);
            merchant.setBusinessDescription(businessDescription);
            merchant.setBusinessType(businessType);
            merchant.setBusinessLicenseNumber(businessLicenseNumber);
            merchant.setCity(city);
            merchant.setStateProvince(stateProvince);
            merchant.setPostalCode(postalCode);

            // Update logo if provided
            if (logo != null && !logo.isEmpty()) {
                logger.info("Processing new logo: " + logo.getOriginalFilename());
                merchant.setLogoBase64(Base64.getEncoder().encodeToString(logo.getBytes()));
                merchant.setLogoName(logo.getOriginalFilename());
                merchant.setLogoType(logo.getContentType());
                logger.info("Logo processed successfully");
            }

            // Update timestamp
            merchant.setUpdatedAt(LocalDateTime.now());

            // Save merchant
            MerchantEntity updatedMerchant = merchantRepository.save(merchant);
            logger.info("Merchant profile updated successfully");

            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("merchantId", updatedMerchant.getMerchantId());
            response.put("businessName", updatedMerchant.getBusinessName());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.log(Level.SEVERE, "Error processing logo: " + e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing logo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error updating merchant profile: " + e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error updating merchant profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get merchant logo
     */
    @GetMapping("/{merchantId}/logo")
    public ResponseEntity<byte[]> getMerchantLogo(@PathVariable Long merchantId) {
        try {
            Optional<MerchantEntity> merchantOpt = merchantRepository.findById(merchantId);

            if (merchantOpt.isPresent() && merchantOpt.get().getLogoBase64() != null
                    && !merchantOpt.get().getLogoBase64().isEmpty()) {
                MerchantEntity merchant = merchantOpt.get();
                byte[] logoData = Base64.getDecoder().decode(merchant.getLogoBase64());
                return ResponseEntity
                        .ok()
                        .contentType(MediaType.parseMediaType(merchant.getLogoType()))
                        .body(logoData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Error fetching merchant logo: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}