package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class AuthController {

    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    @Autowired
    private AuthenticationService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            // Extract email and password from request
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            logger.info("Login attempt for email: " + email);

            // Basic validation
            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Email and password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Authenticate user
            Map<String, Object> authResult = authService.authenticate(email, password);

            // Prepare response
            Map<String, Object> response = new HashMap<>();

            if ((Boolean) authResult.get("authenticated")) {
                logger.info("Login successful for user type: " + authResult.get("userType"));

                response.put("success", true);
                response.put("message", "Login successful");
                response.put("data", authResult);

                return ResponseEntity.ok(response);
            } else {
                logger.info("Login failed for email: " + email);

                response.put("success", false);
                response.put("message", "Invalid email or password");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            logger.severe("Error during authentication: " + e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);

            if (e.getMessage() != null && e.getMessage().contains("lob stream")) {
                response.put("message", "Unable to access user data. Please try again or contact support.");
            } else {
                response.put("message", "An error occurred during authentication: " + e.getMessage());
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login/no-lob")
    public ResponseEntity<?> loginWithoutLobData(@RequestBody Map<String, String> loginRequest) {
        try {
            // Extract email and password from request
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            logger.info("Login attempt (without LOB) for email: " + email);

            // Basic validation
            if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Email and password are required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Call regular authenticate but catch any LOB-related exceptions
            Map<String, Object> authResult = authService.authenticate(email, password);

            // Prepare response
            Map<String, Object> response = new HashMap<>();

            if ((Boolean) authResult.get("authenticated")) {
                logger.info("Login (without LOB) successful for user type: " + authResult.get("userType"));

                response.put("success", true);
                response.put("message", "Login successful");
                response.put("data", authResult);

                return ResponseEntity.ok(response);
            } else {
                logger.info("Login (without LOB) failed for email: " + email);

                response.put("success", false);
                response.put("message", "Invalid email or password");

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            logger.severe("Error during no-LOB authentication: " + e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "An error occurred during authentication: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
