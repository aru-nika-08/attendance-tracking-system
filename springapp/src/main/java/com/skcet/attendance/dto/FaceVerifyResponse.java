package com.skcet.attendance.dto;



public class FaceVerifyResponse {
    private boolean success;
    private String message;
    private double confidence;
    public FaceVerifyResponse(boolean b, String string, double d) {
        this.success = b;
        this.message = string;
        this.confidence = d;
    }
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public double getConfidence() {
        return confidence;
    }
    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    

}


