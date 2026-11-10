package com.sovereign.service;

import com.sovereign.dto.AuthRequest;
import com.sovereign.dto.AuthResponse;
import com.sovereign.dto.LoginRequest;
import com.sovereign.entity.Brand;
import com.sovereign.entity.Creator;
import com.sovereign.repository.BrandRepository;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final CreatorRepository creatorRepository;
    private final BrandRepository brandRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(CreatorRepository creatorRepository,
                       BrandRepository brandRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.creatorRepository = creatorRepository;
        this.brandRepository = brandRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new Creator or Brand.
     */
    public AuthResponse register(AuthRequest request) {
        String role = request.getRole().toUpperCase();

        if ("CREATOR".equals(role)) {
            if (creatorRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }

            Creator creator = new Creator();
            creator.setName(request.getName());
            creator.setEmail(request.getEmail());
            creator.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            creator.setNiche(request.getNiche());
            creator.setSlug(generateSlug(request.getName()));
            creator = creatorRepository.save(creator);

            String token = jwtUtil.generateToken(creator.getEmail(),
                    Map.of("role", "CREATOR", "userId", creator.getId().toString()));

            return new AuthResponse(token, creator.getId(), creator.getName(), creator.getEmail(), "CREATOR");

        } else if ("BRAND".equals(role)) {
            if (brandRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
            }

            Brand brand = new Brand();
            brand.setName(request.getName());
            brand.setEmail(request.getEmail());
            brand.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            brand.setIndustry(request.getIndustry());
            brand = brandRepository.save(brand);

            String token = jwtUtil.generateToken(brand.getEmail(),
                    Map.of("role", "BRAND", "userId", brand.getId().toString()));

            return new AuthResponse(token, brand.getId(), brand.getName(), brand.getEmail(), "BRAND");

        } else {
            throw new RuntimeException("Invalid role: " + role + ". Must be CREATOR or BRAND.");
        }
    }

    /**
     * Authenticate an existing user.
     */
    public AuthResponse login(LoginRequest request) {
        // Try Creator first
        var creatorOpt = creatorRepository.findByEmail(request.getEmail());
        if (creatorOpt.isPresent()) {
            Creator creator = creatorOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), creator.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
            String token = jwtUtil.generateToken(creator.getEmail(),
                    Map.of("role", "CREATOR", "userId", creator.getId().toString()));
            return new AuthResponse(token, creator.getId(), creator.getName(), creator.getEmail(), "CREATOR");
        }

        // Try Brand
        var brandOpt = brandRepository.findByEmail(request.getEmail());
        if (brandOpt.isPresent()) {
            Brand brand = brandOpt.get();
            if (!passwordEncoder.matches(request.getPassword(), brand.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
            String token = jwtUtil.generateToken(brand.getEmail(),
                    Map.of("role", "BRAND", "userId", brand.getId().toString()));
            return new AuthResponse(token, brand.getId(), brand.getName(), brand.getEmail(), "BRAND");
        }

        throw new RuntimeException("Invalid credentials");
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
