package com.FoodBridgeBangladesh.Controller;

import com.FoodBridgeBangladesh.Service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    /**
     * Get homepage statistics
     */
    @GetMapping("/homepage")
    public ResponseEntity<Map<String, Object>> getHomepageStatistics() {
        try {
            Map<String, Object> statistics = statisticsService.getHomepageStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to fetch statistics",
                    "message", e.getMessage()
            ));
        }
    }
}