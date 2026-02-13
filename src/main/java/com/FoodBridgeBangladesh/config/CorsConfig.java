package com.FoodBridgeBangladesh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class CorsConfig {

    private static final Logger logger = LoggerFactory.getLogger(CorsConfig.class);

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Your existing origins + improvements
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://localhost:3001");  // ADD THIS
        config.addAllowedOrigin("https://foodbridge-frontend.onrender.com");
           config.addAllowedOrigin("https://foodbridgebangladesh-k0sb.onrender.com");

        // Your existing headers (keep as is)
        config.addAllowedHeader("*");

        // REPLACE: Be more explicit about methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");  // ADD THIS - Very important!
        config.addAllowedMethod("HEAD");
        config.addAllowedMethod("PATCH");

        // Your existing credentials (keep as is)
        config.setAllowCredentials(true);

        // ADD: Cache preflight requests
        config.setMaxAge(3600L);

        // ADD: Expose headers for frontend
        config.addExposedHeader("Content-Length");
        config.addExposedHeader("Content-Type");

        // Your existing path mapping (keep as is)
        source.registerCorsConfiguration("/**", config);

        // ADD: Debug logging
        logger.info("CORS configuration loaded successfully");

        return new CorsFilter(source);
    }
}
