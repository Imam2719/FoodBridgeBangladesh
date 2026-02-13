package com.FoodBridgeBangladesh.Controller.merchant;

import com.FoodBridgeBangladesh.Service.merchant.PaymentFeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/merchant/fees")
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class PaymentFeeController {

    private static final Logger logger = Logger.getLogger(PaymentFeeController.class.getName());

    @Autowired
    private PaymentFeeService paymentFeeService;

    /**
     * Calculate fee data for merchant with month-specific logic
     */
    @GetMapping("/calculate")
    public ResponseEntity<?> calculateFee(
            @RequestParam String merchantId,
            @RequestParam(required = false) String selectedMonth,
            @RequestParam(required = false) Double totalRevenue) {
        try {
            // ✅ FIXED: Safe conversion to handle both String and Integer inputs
            String merchantIdStr = String.valueOf(merchantId).trim();

            logger.info("Received fee calculation request for merchantId: " + merchantIdStr +
                    " for month: " + selectedMonth + " with revenue: " + totalRevenue);

            // Validate merchantId format
            if (merchantIdStr.isEmpty() || "null".equals(merchantIdStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid merchant ID");
                return ResponseEntity.badRequest().body(response);
            }

            // If selectedMonth is not provided, use current month
            if (selectedMonth == null || selectedMonth.trim().isEmpty()) {
                selectedMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
            }

            // Validate month format
            if (!isValidPaymentMonth(selectedMonth)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid month format. Expected format: YYYY-MM");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> feeData = paymentFeeService.calculateFeeDataForMonth(merchantIdStr, selectedMonth);
            return ResponseEntity.ok(feeData);

        } catch (NumberFormatException e) {
            logger.severe("Invalid merchant ID format: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid merchant ID format");
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            logger.severe("Error calculating fees: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Process payment for merchant
     */
    @PostMapping("/process-payment")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            logger.info("Received payment processing request: " + paymentData);

            // ✅ FIXED: Safe validation and conversion of required fields
            Object merchantIdObj = paymentData.get("merchantId");
            Object amountObj = paymentData.get("amount");
            Object paymentMethodObj = paymentData.get("paymentMethod");
            Object paymentMonthObj = paymentData.get("paymentMonth");

            // Validate required fields exist
            if (merchantIdObj == null || amountObj == null || paymentMethodObj == null || paymentMonthObj == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Missing required payment data. Required: merchantId, amount, paymentMethod, paymentMonth");
                return ResponseEntity.badRequest().body(response);
            }

            // ✅ FIXED: Safe conversion of merchantId (handles both String and Integer)
            String merchantId = String.valueOf(merchantIdObj).trim();
            String paymentMethod = String.valueOf(paymentMethodObj).trim();
            String paymentMonth = String.valueOf(paymentMonthObj).trim();

            // ✅ FIXED: Safe conversion of amount
            Double amount;
            try {
                if (amountObj instanceof Number) {
                    amount = ((Number) amountObj).doubleValue();
                } else {
                    amount = Double.parseDouble(String.valueOf(amountObj));
                }
            } catch (NumberFormatException e) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid amount format: " + amountObj);
                return ResponseEntity.badRequest().body(response);
            }

            // Validate merchantId
            if (merchantId.isEmpty() || "null".equals(merchantId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid merchant ID");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate payment method
            if (!isValidPaymentMethod(paymentMethod)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid payment method. Must be bkash, nagad, or rocket");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate amount
            if (amount <= 0) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Payment amount must be greater than 0");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate payment month format (YYYY-MM)
            if (!isValidPaymentMonth(paymentMonth)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid payment month format. Expected format: YYYY-MM");
                return ResponseEntity.badRequest().body(response);
            }

            // Process payment
            Map<String, Object> result = paymentFeeService.processPayment(paymentData);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            logger.warning("Payment validation error: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            logger.severe("Error processing payment: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Payment processing failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payment history for merchant - ENHANCED VERSION
     */
    @GetMapping("/payment-history")
    public ResponseEntity<?> getPaymentHistory(@RequestParam String merchantId) {
        try {
            // ✅ FIXED: Safe conversion of merchantId
            String merchantIdStr = String.valueOf(merchantId).trim();

            logger.info("Fetching payment history for merchantId: " + merchantIdStr);

            if (merchantIdStr.isEmpty() || "null".equals(merchantIdStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid merchant ID");
                return ResponseEntity.badRequest().body(response);
            }

            // ✅ MAIN FIX: Get payment history and ensure proper response format
            List<Map<String, Object>> history = paymentFeeService.getPaymentHistory(merchantIdStr);

            // ✅ ENHANCED: Add debug logging
            logger.info("Found " + history.size() + " payment records for merchant: " + merchantIdStr);

            // ✅ ENHANCED: Return structured response with metadata
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("merchantId", merchantIdStr);
            response.put("totalRecords", history.size());
            response.put("paymentHistory", history);
            response.put("message", history.isEmpty() ? "No payment history found for this merchant" : "Payment history retrieved successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error fetching payment history: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment history: " + e.getMessage());
            response.put("paymentHistory", new ArrayList<>());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    /**
     * Check if merchant has paid for specific month
     */
    @GetMapping("/payment-status")
    public ResponseEntity<?> checkPaymentStatus(
            @RequestParam String merchantId,
            @RequestParam String paymentMonth) {
        try {
            // ✅ FIXED: Safe conversion
            String merchantIdStr = String.valueOf(merchantId).trim();
            String paymentMonthStr = String.valueOf(paymentMonth).trim();

            logger.info("Checking payment status for merchantId: " + merchantIdStr + ", month: " + paymentMonthStr);

            if (merchantIdStr.isEmpty() || "null".equals(merchantIdStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid merchant ID");
                return ResponseEntity.badRequest().body(response);
            }

            if (!isValidPaymentMonth(paymentMonthStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid payment month format");
                return ResponseEntity.badRequest().body(response);
            }

            boolean hasPaid = paymentFeeService.hasPaymentForMonth(merchantIdStr, paymentMonthStr);

            Map<String, Object> response = new HashMap<>();
            response.put("merchantId", merchantIdStr);
            response.put("paymentMonth", paymentMonthStr);
            response.put("hasPaid", hasPaid);
            response.put("status", hasPaid ? "PAID" : "UNPAID");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error checking payment status: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to check payment status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get payment statistics for merchant
     */
    @GetMapping("/payment-stats")
    public ResponseEntity<?> getPaymentStats(@RequestParam String merchantId) {
        try {
            // ✅ FIXED: Safe conversion
            String merchantIdStr = String.valueOf(merchantId).trim();

            logger.info("Fetching payment stats for merchantId: " + merchantIdStr);

            if (merchantIdStr.isEmpty() || "null".equals(merchantIdStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid merchant ID");
                return ResponseEntity.badRequest().body(response);
            }

            Map<String, Object> stats = paymentFeeService.getPaymentStats(merchantIdStr);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            logger.severe("Error fetching payment stats: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch payment stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all payments for a specific month (admin endpoint)
     */
    @GetMapping("/admin/monthly-payments")
    public ResponseEntity<?> getMonthlyPayments(@RequestParam String paymentMonth) {
        try {
            String paymentMonthStr = String.valueOf(paymentMonth).trim();

            logger.info("Fetching monthly payments for month: " + paymentMonthStr);

            if (!isValidPaymentMonth(paymentMonthStr)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Invalid payment month format");
                return ResponseEntity.badRequest().body(response);
            }

            // This would be used by admin to see all payments for a specific month
            // Implementation depends on admin requirements
            Map<String, Object> response = new HashMap<>();
            response.put("paymentMonth", paymentMonthStr);
            response.put("message", "Admin endpoint - implementation pending");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.severe("Error fetching monthly payments: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch monthly payments: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * ✅ ENHANCED: Validate payment method
     */
    private boolean isValidPaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.trim().isEmpty()) {
            return false;
        }

        String method = paymentMethod.toLowerCase().trim();
        return method.equals("bkash") || method.equals("nagad") || method.equals("rocket");
    }

    /**
     * ✅ NEW: Validate payment month format (YYYY-MM)
     */
    private boolean isValidPaymentMonth(String paymentMonth) {
        if (paymentMonth == null || paymentMonth.trim().isEmpty()) {
            return false;
        }

        // Check format YYYY-MM
        String monthPattern = "^\\d{4}-\\d{2}$";
        return paymentMonth.matches(monthPattern);
    }
}