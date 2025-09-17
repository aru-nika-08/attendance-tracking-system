package com.skcet.attendance.dto;


public class QRGenerateResponse {
    private String token;
    private long expiresAt;
    public QRGenerateResponse(String token2, long expiresAt2) {
        //TODO Auto-generated constructor stub
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


