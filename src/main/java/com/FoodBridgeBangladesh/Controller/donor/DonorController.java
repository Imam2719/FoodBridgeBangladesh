package com.FoodBridgeBangladesh.Controller.donor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
@RequiredArgsConstructor
@Slf4j
public class DonorController {

    /**
     * Get donor dashboard data
     */
    @GetMapping("/dashboard/{donorId}")
    public ResponseEntity<Map<String, Object>> getDonorDashboard(@PathVariable Long donorId) {
        // This would typically call a service to get dashboard data

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Dashboard data fetched successfully");

        // Dummy data for demonstration
        response.put("activeDonations", 5);
        response.put("totalDonations", 12);
        response.put("peopleHelped", 45);
        response.put("pendingRequests", 8);

        return ResponseEntity.ok(response);
    }

    /**
     * Get donor notifications
     */
    @GetMapping("/notifications/{donorId}")
    public ResponseEntity<Map<String, Object>> getDonorNotifications(@PathVariable Long donorId) {
        // This would typically call a service to get notifications

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifications fetched successfully");

        // Dummy data for demonstration
        Map<String, Object>[] notifications = new Map[2];

        Map<String, Object> notification1 = new HashMap<>();
        notification1.put("id", 1);
        notification1.put("message", "Your donation was accepted by Food Bank A");
        notification1.put("timestamp", "2025-04-10T14:30:00");
        notification1.put("read", false);

        Map<String, Object> notification2 = new HashMap<>();
        notification2.put("id", 2);
        notification2.put("message", "New request for your Biryani donation");
        notification2.put("timestamp", "2025-04-11T09:15:00");
        notification2.put("read", true);

        notifications[0] = notification1;
        notifications[1] = notification2;

        response.put("notifications", notifications);

        return ResponseEntity.ok(response);
    }
}