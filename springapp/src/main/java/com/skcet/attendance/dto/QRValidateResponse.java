package com.skcet.attendance.dto;

public class QRValidateResponse {
    private boolean valid;
    private String sessionId;
    public QRValidateResponse(boolean b, String sessionId2) {
        this.valid = b;
        this.sessionId = sessionId2;
    }
    public boolean isValid() {
        return valid;
    }
    public void setValid(boolean valid) {
        this.valid = valid;
    }
    public String getSessionId() {
        return sessionId;
    }
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    
}


