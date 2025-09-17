package com.skcet.attendance.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.UUID;

@Service
@Slf4j
public class TokenService {

    @Value("${qr.ttl.ms}")
    private long qrTtlMs;

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String SECRET_KEY = "attendance-secret-key-2024";

    public String generateToken() {
        long timestamp = System.currentTimeMillis();
        String randomId = UUID.randomUUID().toString().substring(0, 8);
        String payload = timestamp + "_" + randomId;
        
        try {
            String signature = generateSignature(payload);
            return Base64.getEncoder().encodeToString((payload + "_" + signature).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to generate token: {}", e.getMessage());
            throw new RuntimeException("Token generation failed", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String decoded = new String(Base64.getDecoder().decode(token), StandardCharsets.UTF_8);
            String[] parts = decoded.split("_");
            
            if (parts.length != 3) {
                return false;
            }
            
            String payload = parts[0] + "_" + parts[1];
            String signature = parts[2];
            
            // Verify signature
            if (!signature.equals(generateSignature(payload))) {
                return false;
            }
            
            // Check timestamp
            long timestamp = Long.parseLong(parts[0]);
            long now = System.currentTimeMillis();
            
            return (now - timestamp) <= qrTtlMs;
            
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    private String generateSignature(String payload) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        
        byte[] signature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(signature);
    }
    public long getQrTtlMs() {
    return qrTtlMs;
}
}


