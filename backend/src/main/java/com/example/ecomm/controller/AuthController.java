package com.example.ecomm.controller;

import com.example.ecomm.dto.auth.AuthRequests;
import com.example.ecomm.dto.auth.AuthResponses;
import com.example.ecomm.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponses.LoginResponse> register(@Valid @RequestBody AuthRequests.RegisterRequest request) {
        return ResponseEntity.ok(auth.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponses.LoginResponse> login(@Valid @RequestBody AuthRequests.LoginRequest request) {
        return ResponseEntity.ok(auth.login(request));
    }
}

