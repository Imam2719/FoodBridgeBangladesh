package com.FoodBridgeBangladesh.Controller.admin;

import com.FoodBridgeBangladesh.Model.dto.FoodReportDTO;
import com.FoodBridgeBangladesh.Service.receiver.FoodReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/food-reports")
@CrossOrigin(
        origins = {"https://foodbridgebangladesh-k0sb.onrender.com","http://localhost:3000", "https://foodbridge-frontend.onrender.com"},
        allowCredentials = "true"
)
public class AdminFoodReportController {

    @Autowired
    private FoodReportService foodReportService;

    /**
     * Get all reports with pagination
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String status) {

        Map<String, Object> response = new HashMap<>();
        try {
            Page<FoodReportDTO.FoodReportResponseDTO> reports;

            if ("all".equals(status)) {
                reports = foodReportService.getAllReportsPaginated(page, size);
            } else {
                reports = foodReportService.getReportsByStatusPaginated(status, page, size);
            }

            response.put("success", true);
            response.put("reports", reports.getContent());
            response.put("currentPage", reports.getNumber());
            response.put("totalPages", reports.getTotalPages());
            response.put("totalElements", reports.getTotalElements());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch reports");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get reports statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReportsStats() {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Long> stats = foodReportService.getAdminReportsStats();
            response.put("success", true);
            response.put("stats", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch stats");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Update report status
     */
    @PutMapping("/{reportId}/status")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status,
            @RequestParam(required = false) String adminNotes,
            @RequestParam Long adminId) {

        Map<String, Object> response = new HashMap<>();
        try {
            FoodReportDTO updatedReport = foodReportService.updateReportStatus(reportId, status, adminNotes, adminId);
            response.put("success", true);
            response.put("message", "Report status updated successfully");
            response.put("report", updatedReport);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update report status");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Delete report
     */
    @DeleteMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable Long reportId) {
        Map<String, Object> response = new HashMap<>();
        try {
            foodReportService.deleteReport(reportId);
            response.put("success", true);
            response.put("message", "Report deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete report");
            return ResponseEntity.status(500).body(response);
        }
    }
    /**
     * Get report details by ID
     */
    @GetMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> getReportDetails(@PathVariable Long reportId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<FoodReportDTO> report = foodReportService.getReportById(reportId);
            if (report.isPresent()) {
                response.put("success", true);
                response.put("report", report.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Report not found");
                return ResponseEntity.status(404).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to fetch report details");
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Download evidence file
     */
    @GetMapping("/{reportId}/evidence/{fileNumber}")
    public ResponseEntity<byte[]> downloadEvidenceFile(
            @PathVariable Long reportId,
            @PathVariable int fileNumber) {
        try {
            return foodReportService.downloadEvidenceFile(reportId, fileNumber);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * View evidence file inline
     */
    @GetMapping("/{reportId}/evidence/{fileNumber}/view")
    public ResponseEntity<byte[]> viewEvidenceFile(
            @PathVariable Long reportId,
            @PathVariable int fileNumber) {
        try {
            return foodReportService.viewEvidenceFile(reportId, fileNumber);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}