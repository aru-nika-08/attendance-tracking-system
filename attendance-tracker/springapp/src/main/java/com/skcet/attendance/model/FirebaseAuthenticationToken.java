package com.skcet.attendance.model;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class FirebaseAuthenticationToken extends AbstractAuthenticationToken {
    
    private final FirebaseToken firebaseToken;

    public FirebaseAuthenticationToken(FirebaseToken firebaseToken, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.firebaseToken = firebaseToken;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return firebaseToken;
    }

    @Override
    public Object getPrincipal() {
        return firebaseToken.getUid();
    }

    public FirebaseToken getFirebaseToken() {
        return firebaseToken;
    }

    public String getEmail() {
        return firebaseToken.getEmail();
    }

    public String getUid() {
        return firebaseToken.getUid();
    }
}


