# Use Eclipse Temurin 17 as base image (modern, maintained Java distribution)
FROM eclipse-temurin:17-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && \
    apt-get install -y maven && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Maven files first (for better caching)
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Expose port
EXPOSE 8080

# Set environment variable for Spring profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run the application
CMD ["java", "-Dspring.profiles.active=prod", "-Dserver.port=${PORT:-8080}", "-jar", "target/FoodBridgeBangladesh-0.0.1-SNAPSHOT.jar"]
