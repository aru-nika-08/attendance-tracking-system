package com.skcet.attendance.service;

import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AzureFaceService {

    @Value("${azure.face.endpoint:}")
    private String faceEndpoint;

    @Value("${azure.face.key:}")
    private String faceKey;

    public final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();

    public final Gson gson = new Gson();

    public double detectAndVerifyFace(String base64Image, String studentEmail) {
        try {
            // For demo purposes, we'll simulate face verification
            // In a real implementation, you would:
            // 1. Detect faces in the image
            // 2. Compare with stored face templates
            // 3. Return confidence score
            
            log.info("Simulating face verification for student: {}", studentEmail);
            
            // Simulate processing time
            Thread.sleep(1000);
            
            // Return a random confidence score between 0.7 and 0.95 for demo
            double confidence = 0.7 + (Math.random() * 0.25);
            
            log.info("Face verification confidence: {}", confidence);
            return confidence;
            
        } catch (Exception e) {
            log.error("Face verification failed: {}", e.getMessage());
            return 0.0;
        }
    }

    // Real Azure Face API implementation (commented out for demo)
    /*
    public double detectAndVerifyFace(String base64Image, String studentEmail) {
        try {
            // Remove data URL prefix if present
            String imageData = base64Image;
            if (base64Image.startsWith("data:image")) {
                imageData = base64Image.substring(base64Image.indexOf(",") + 1);
            }
            
            byte[] imageBytes = Base64.getDecoder().decode(imageData);
            
            // Detect faces
            String detectUrl = faceEndpoint + "/face/v1.0/detect?returnFaceId=true&returnFaceAttributes=age,gender";
            
            RequestBody body = RequestBody.create(
                imageBytes, 
                MediaType.parse("application/octet-stream")
            );
            
            Request detectRequest = new Request.Builder()
                    .url(detectUrl)
                    .post(body)
                    .addHeader("Ocp-Apim-Subscription-Key", faceKey)
                    .addHeader("Content-Type", "application/octet-stream")
                    .build();
            
            try (Response response = httpClient.newCall(detectRequest).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Face detection failed: {}", response.code());
                    return 0.0;
                }
                
                String responseBody = response.body().string();
                JsonObject[] faces = gson.fromJson(responseBody, JsonObject[].class);
                
                if (faces.length == 0) {
                    log.warn("No faces detected in image");
                    return 0.0;
                }
                
                String faceId = faces[0].get("faceId").getAsString();
                
                // Here you would compare with stored face templates
                // For now, return a simulated confidence score
                return 0.85;
            }
            
        } catch (Exception e) {
            log.error("Face verification failed: {}", e.getMessage());
            return 0.0;
        }
    }
    */
}


