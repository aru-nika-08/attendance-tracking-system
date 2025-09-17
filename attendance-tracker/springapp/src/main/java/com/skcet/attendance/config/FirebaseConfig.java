package com.skcet.attendance.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import com.google.firebase.cloud.FirestoreClient;


import javax.annotation.PostConstruct;
import java.io.IOException;

@Configuration
@Slf4j
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(
                            new ClassPathResource("serviceAccount.json").getInputStream()
                    ))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("✅ Firebase initialized successfully");
            }
        } catch (IOException e) {
            log.error("❌ Failed to initialize Firebase: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }
    @Bean
public FirebaseAuth firebaseAuth() {
    return FirebaseAuth.getInstance();
}

@Bean
public Firestore firestore() {
    return FirestoreClient.getFirestore();
}
}
