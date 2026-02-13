package com.FoodBridgeBangladesh.Controller.donor;

import com.FoodBridgeBangladesh.Model.receiver.NeedFoodRequestModel;
import com.FoodBridgeBangladesh.Service.receiver.NeedFoodRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class DonationRequestController {

    private final NeedFoodRequestService needFoodRequestService;

    @Autowired
    public DonationRequestController(NeedFoodRequestService needFoodRequestService) {
        this.needFoodRequestService = needFoodRequestService;
    }

    /**
     * Get all food requests for donors to view
     */
    @GetMapping("/food-requests")
    public ResponseEntity<?> getAllFoodRequests(
            @RequestParam(value = "status", required = false) String status
    ) {
        try {
            // Get all pending requests or filter by status if provided
            List<NeedFoodRequestModel> requests;

            if (status != null && !status.isEmpty()) {
                requests = needFoodRequestService.getFoodRequestsByStatus(status);
            } else {
                // Default to only showing PENDING requests if no status specified
                requests = needFoodRequestService.getFoodRequestsByStatus("PENDING");
            }

            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Accept a food request
     */
    @PutMapping("/food-requests/{requestId}/accept")
    public ResponseEntity<?> acceptFoodRequest(
            @PathVariable Long requestId,
            @RequestParam("donorId") Long donorId
    ) {
        try {
            // Update the request status to ACCEPTED
            NeedFoodRequestModel updatedRequest = needFoodRequestService.updateFoodRequestStatus(requestId, "ACCEPTED");

            // Here you would also link the donor to this request in a real implementation
            // For example: needFoodRequestService.assignDonorToRequest(requestId, donorId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Food request accepted successfully");
            response.put("request", updatedRequest);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Decline a food request
     */
    @PutMapping("/food-requests/{requestId}/decline")
    public ResponseEntity<?> declineFoodRequest(
            @PathVariable Long requestId,
            @RequestParam("donorId") Long donorId
    ) {
        try {
            // Update the request status to REJECTED
            NeedFoodRequestModel updatedRequest = needFoodRequestService.updateFoodRequestStatus(requestId, "REJECTED");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Food request declined");
            response.put("request", updatedRequest);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get details of a specific food request
     */
    @GetMapping("/food-requests/{requestId}")
    public ResponseEntity<?> getFoodRequestDetails(
            @PathVariable Long requestId
    ) {
        try {
            NeedFoodRequestModel request = needFoodRequestService.getFoodRequestById(requestId);

            if (request == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Food request not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            return ResponseEntity.ok(request);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}