package com.FoodBridgeBangladesh.Controller.donor;

import com.FoodBridgeBangladesh.Model.User;
import com.FoodBridgeBangladesh.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonorProfileController {

    private static final Logger log = LoggerFactory.getLogger(DonorProfileController.class);

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile/{donorId}")
    public ResponseEntity<?> getDonorProfile(@PathVariable Long donorId) {
        log.info("Fetching profile for donor ID: {}", donorId);

        try {
            // Find the user by ID
            Optional<User> userOptional = userRepository.findById(donorId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Create a map with full user info
                Map<String, Object> profile = new HashMap<>();
                profile.put("firstName", user.getFirstName());
                profile.put("lastName", user.getLastName());
                profile.put("email", user.getEmail());
                profile.put("phone", user.getPhone());
                profile.put("birthdate", user.getBirthdate());
                profile.put("bloodGroup", user.getBloodGroup());
                profile.put("address", user.getAddress());
                profile.put("addressDescription", user.getAddressDescription());
                profile.put("bio", user.getBio());

                // Convert the photo to Base64 format
                if (user.getUserPhoto() != null) {
                    byte[] photoBytes = user.getUserPhoto();
                    String base64Photo = Base64.getEncoder().encodeToString(photoBytes);
                    profile.put("userPhotoBase64", base64Photo);
                    profile.put("photoContentType", user.getPhotoContentType());
                }

                log.info("Profile fetched successfully for donor ID: {}", donorId);
                return ResponseEntity.ok(profile);
            } else {
                log.warn("User not found with ID: {}", donorId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "User not found with ID: " + donorId
                        ));
            }
        } catch (Exception e) {
            log.error("Error fetching profile for donor ID: {}", donorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error fetching profile: " + e.getMessage()
                    ));
        }
    }

    @GetMapping("/profile/{donorId}/basic")
    public ResponseEntity<?> getDonorBasicProfile(@PathVariable Long donorId) {
        log.info("Fetching basic profile for donor ID: {}", donorId);

        try {
            // Find the user by ID
            Optional<User> userOptional = userRepository.findById(donorId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Create a map with only the basic user info (no LOB data)
                Map<String, Object> basicProfile = new HashMap<>();
                basicProfile.put("firstName", user.getFirstName());
                basicProfile.put("lastName", user.getLastName());
                basicProfile.put("email", user.getEmail());
                basicProfile.put("phone", user.getPhone());
                basicProfile.put("birthdate", user.getBirthdate());
                basicProfile.put("bloodGroup", user.getBloodGroup());
                basicProfile.put("address", user.getAddress());
                basicProfile.put("addressDescription", user.getAddressDescription());
                basicProfile.put("bio", user.getBio());
                // Do not include userPhoto which is the LOB field

                log.info("Basic profile fetched successfully for donor ID: {}", donorId);
                return ResponseEntity.ok(basicProfile);
            } else {
                log.warn("User not found with ID: {}", donorId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "User not found with ID: " + donorId
                        ));
            }
        } catch (Exception e) {
            log.error("Error fetching basic profile for donor ID: {}", donorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error fetching basic profile: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/profile/{donorId}")
    public ResponseEntity<?> updateDonorProfile(
            @PathVariable Long donorId,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String addressDescription,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) MultipartFile userPhoto) {

        log.info("Updating profile for donor ID: {}", donorId);

        try {
            Optional<User> userOptional = userRepository.findById(donorId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Update the user fields if provided
                if (firstName != null) user.setFirstName(firstName);
                if (lastName != null) user.setLastName(lastName);
                if (phone != null) user.setPhone(phone);
                if (bloodGroup != null) user.setBloodGroup(bloodGroup);
                if (address != null) user.setAddress(address);
                if (addressDescription != null) user.setAddressDescription(addressDescription);
                if (bio != null) user.setBio(bio);

                // Update photo if provided
                if (userPhoto != null && !userPhoto.isEmpty()) {
                    user.setUserPhoto(userPhoto.getBytes());
                    user.setPhotoContentType(userPhoto.getContentType());
                }

                // Save the updated user
                User updatedUser = userRepository.save(user);

                // Create response with updated profile data
                Map<String, Object> profile = new HashMap<>();
                profile.put("firstName", updatedUser.getFirstName());
                profile.put("lastName", updatedUser.getLastName());
                profile.put("email", updatedUser.getEmail());
                profile.put("phone", updatedUser.getPhone());
                profile.put("birthdate", updatedUser.getBirthdate());
                profile.put("bloodGroup", updatedUser.getBloodGroup());
                profile.put("address", updatedUser.getAddress());
                profile.put("addressDescription", updatedUser.getAddressDescription());
                profile.put("bio", updatedUser.getBio());

                // Include the updated photo if it exists
                if (updatedUser.getUserPhoto() != null) {
                    String base64Photo = Base64.getEncoder().encodeToString(updatedUser.getUserPhoto());
                    profile.put("userPhotoBase64", base64Photo);
                    profile.put("photoContentType", updatedUser.getPhotoContentType());
                }

                log.info("Profile updated successfully for donor ID: {}", donorId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Profile updated successfully",
                        "donor", profile
                ));
            } else {
                log.warn("User not found with ID: {}", donorId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "User not found with ID: " + donorId
                        ));
            }
        } catch (IOException e) {
            log.error("Error processing file upload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error processing file upload: " + e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("Error updating profile for donor ID: {}", donorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error updating profile: " + e.getMessage()
                    ));
        }
    }

    @PutMapping("/profile/{donorId}/password")
    public ResponseEntity<?> updateDonorPassword(
            @PathVariable Long donorId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {

        log.info("Updating password for donor ID: {}", donorId);

        try {
            Optional<User> userOptional = userRepository.findById(donorId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Verify the current password
                if (!user.getPassword().equals(currentPassword)) {
                    log.warn("Current password is incorrect for donor ID: {}", donorId);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Current password is incorrect"
                            ));
                }

                // Update the password
                user.setPassword(newPassword);
                userRepository.save(user);

                log.info("Password updated successfully for donor ID: {}", donorId);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Password updated successfully"
                ));
            } else {
                log.warn("User not found with ID: {}", donorId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "User not found with ID: " + donorId
                        ));
            }
        } catch (Exception e) {
            log.error("Error updating password for donor ID: {}", donorId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error updating password: " + e.getMessage()
                    ));
        }
    }
}