package com.example.ecomm.controller;

import com.example.ecomm.dto.order.OrderDtos;
import com.example.ecomm.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;

    public AdminController(AdminService admin) {
        this.admin = admin;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(admin.dashboard());
    }

    @GetMapping("/orders")
    public ResponseEntity<OrderDtos.OrderHistoryResponse> orderHistoryForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(admin.ordersForAdmin(page, size));
    }
}

