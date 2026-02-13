package com.FoodBridgeBangladesh.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(
        origins = {"http://localhost:3000", "https://foodbridge-frontend.onrender.com","https://foodbridgebangladesh-k0sb.onrender.com"},
        allowCredentials = "true"
)
public class navigationControllelr  {

    @GetMapping("/")
    public String home() {
        return "Welcome to FoodBridge Bangladesh";
    }

    @GetMapping("/login")
    public String login() {
        return "Login Page";
    }

    @GetMapping("/signup")
    public String signup() {
        return "Signup Page";
    }

    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "Forgot Password Page";
    }

    @GetMapping("/donor-dashboard")
    public String donorDashboard() {
        return "Donor Dashboard";
    }

    @GetMapping("/receiver-dashboard")
    public String receiverDashboard() {
        return "Receiver Dashboard";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard() {
        return "Admin Dashboard";
    }

    @GetMapping("/merchant-dashboard")
    public String merchantDashboard() {
        return "Merchant Dashboard";
    }
}