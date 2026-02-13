package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.admin.dto.adminManagementDto;
import com.FoodBridgeBangladesh.Service.admin.adminManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/management")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class adminManagementController {

    @Autowired
    private adminManagementService adminService;

    /**
     * Get all admins
     */
    @GetMapping("/all")
    public ResponseEntity<List<adminManagementDto.AdminResponse>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    /**
     * Get admin by email
     */
    @GetMapping("/profile")
    public ResponseEntity<adminManagementDto.AdminResponse> getAdminByEmail(@RequestParam String email) {
        try {
            return ResponseEntity.ok(adminService.getAdminByEmail(email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get admin by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<adminManagementDto.AdminResponse> getAdminById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.getAdminById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create new admin
     */
    @PostMapping("/add")
    public ResponseEntity<?> createAdmin(@RequestParam("firstName") String firstName,
                                         @RequestParam("lastName") String lastName,
                                         @RequestParam("email") String email,
                                         @RequestParam("phoneNumber") String phoneNumber,
                                         @RequestParam("password") String password,
                                         @RequestParam("role") String role,
                                         @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        try {
            adminManagementDto adminDto = new adminManagementDto();
            adminDto.setFirstName(firstName);
            adminDto.setLastName(lastName);
            adminDto.setEmail(email);
            adminDto.setPhoneNumber(phoneNumber);
            adminDto.setPassword(password);
            adminDto.setRole(role);

            // Process profile photo if provided
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(profilePhoto.getBytes());
                adminDto.setProfilePhotoBase64(base64Image);
            }

            adminManagementDto.AdminResponse createdAdmin = adminService.createAdmin(adminDto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin created successfully");
            response.put("admin", createdAdmin);

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing profile photo: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update admin
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id,
                                         @RequestParam(value = "firstName", required = false) String firstName,
                                         @RequestParam(value = "lastName", required = false) String lastName,
                                         @RequestParam(value = "email", required = false) String email,
                                         @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
                                         @RequestParam(value = "password", required = false) String password,
                                         @RequestParam(value = "role", required = false) String role,
                                         @RequestParam(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        try {
            adminManagementDto adminDto = new adminManagementDto();

            if (firstName != null) adminDto.setFirstName(firstName);
            if (lastName != null) adminDto.setLastName(lastName);
            if (email != null) adminDto.setEmail(email);
            if (phoneNumber != null) adminDto.setPhoneNumber(phoneNumber);
            if (password != null) adminDto.setPassword(password);
            if (role != null) adminDto.setRole(role);

            // Process profile photo if provided
            if (profilePhoto != null && !profilePhoto.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(profilePhoto.getBytes());
                adminDto.setProfilePhotoBase64(base64Image);
            }

            adminManagementDto.AdminResponse updatedAdmin = adminService.updateAdmin(id, adminDto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin updated successfully");
            response.put("admin", updatedAdmin);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error processing profile photo: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Update admin status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAdminStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            // Validate status value
            if (!status.equals("Active") && !status.equals("Inactive")) {
                throw new IllegalArgumentException("Status must be either 'Active' or 'Inactive'");
            }

            adminManagementDto.AdminResponse updatedAdmin = adminService.updateAdminStatus(id, status);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin status updated successfully");
            response.put("admin", updatedAdmin);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Delete admin
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        try {
            adminService.deleteAdmin(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin deleted successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Get admin statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    /**
     * Alternative JSON-based admin creation
     * This method can be used instead of the form-data based method above
     */
    @PostMapping("/create")
    public ResponseEntity<?> createAdminJson(@RequestBody adminManagementDto adminDto) {
        try {
            adminManagementDto.AdminResponse createdAdmin = adminService.createAdmin(adminDto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin created successfully");
            response.put("admin", createdAdmin);

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
    /**
     * Create default admin - FOR TESTING ONLY
     */
    @PostMapping("/create-default")
    public ResponseEntity<?> createDefaultAdmin() {
        try {
            adminManagementDto adminDto = new adminManagementDto();
            adminDto.setFirstName("System");
            adminDto.setLastName("Admin");
            adminDto.setEmail("admin@foodbridge.com");
            adminDto.setPhoneNumber("+8801712345678");
            adminDto.setPassword("Admin123!");
            adminDto.setRole("system_admin");

            adminManagementDto.AdminResponse createdAdmin = adminService.createAdmin(adminDto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Default admin created successfully");
            response.put("admin", createdAdmin);

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}