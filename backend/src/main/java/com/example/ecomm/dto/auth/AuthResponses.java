package com.example.ecomm.dto.auth;

public class AuthResponses {

    public record LoginResponse(String token, String tokenType) {}
}

