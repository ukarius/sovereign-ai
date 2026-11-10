# ═══════════════════════════════════════════════════════════════
# Project Sovereign — Backend Dockerfile
# Multi-stage Maven build for Java 21 Spring Boot application
# ═══════════════════════════════════════════════════════════════

# ───── Stage 1: Build ─────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B && \
    mkdir -p target/dependency && \
    cd target/dependency && \
    jar -xf ../*.jar

# ───── Stage 2: Runtime ─────
FROM eclipse-temurin:21-jre-alpine

# Create non-root user for security
RUN addgroup -S sovereign && adduser -S sovereign -G sovereign

WORKDIR /app

# Copy extracted JAR layers from builder
COPY --from=builder /build/target/dependency/BOOT-INF/lib /app/lib
COPY --from=builder /build/target/dependency/META-INF /app/META-INF
COPY --from=builder /build/target/dependency/BOOT-INF/classes /app

# Set ownership
RUN chown -R sovereign:sovereign /app

USER sovereign

# Expose application port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# JVM optimized for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+OptimizeStringConcat -XX:+UseStringDeduplication"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -cp /app:/app/lib/* com.sovereign.SovereignApplication"]
