package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.ConflictException;
import com.example.ecomm.dto.auth.AuthRequests;
import com.example.ecomm.dto.auth.AuthResponses;
import com.example.ecomm.model.Role;
import com.example.ecomm.model.RoleName;
import com.example.ecomm.model.User;
import com.example.ecomm.repo.RoleRepository;
import com.example.ecomm.repo.UserRepository;
import com.example.ecomm.security.JwtTokenService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;
    private final JwtTokenService jwt;

    public AuthService(UserRepository users,
                        RoleRepository roles,
                        PasswordEncoder encoder,
                        JwtTokenService jwt) {
        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponses.LoginResponse register(AuthRequests.RegisterRequest request) {
        if (users.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(encoder.encode(request.getPassword()));
        user.setEnabled(true);

        Role role = roles.findByName(RoleName.USER)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName(RoleName.USER);
                    return roles.save(r);
                });

        user.getRoles().add(role);
        users.save(user);

        return createLoginResponse(user);
    }

    public AuthResponses.LoginResponse login(AuthRequests.LoginRequest request) {
        User user = users.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new com.example.ecomm.common.exceptions.UnauthorizedException("Invalid credentials"));

        if (!user.isEnabled() || !encoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new com.example.ecomm.common.exceptions.UnauthorizedException("Invalid credentials");
        }

        return createLoginResponse(user);
    }

    private AuthResponses.LoginResponse createLoginResponse(User user) {
        List<String> roleNames = user.getRoles().stream().map(r -> r.getName().name()).toList();
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roleNames);

        String token = jwt.createToken(user.getEmail(), claims);
        return new AuthResponses.LoginResponse(token, "Bearer");
    }
}

