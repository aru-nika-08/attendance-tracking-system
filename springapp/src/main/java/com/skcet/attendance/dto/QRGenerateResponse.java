package com.skcet.attendance.dto;


public class QRGenerateResponse {
    private String token;
    private long expiresAt;
    public QRGenerateResponse(String token2, long expiresAt2) {
        this.token = token2;
        this.expiresAt = expiresAt2;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }
    public long getExpiresAt() {
        return expiresAt;
    }
    public void setExpiresAt(long expiresAt) {
        this.expiresAt = expiresAt;
    }

    
}
