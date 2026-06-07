package com.example.ecomm.controller;

import com.example.ecomm.dto.order.OrderDtos;
import com.example.ecomm.service.OrdersService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    private final OrdersService orders;

    public OrdersController(OrdersService orders) {
        this.orders = orders;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDtos.OrderResponse> checkout(
            @Valid @RequestBody OrderDtos.CheckoutRequest req
    ) {
        return ResponseEntity.ok(orders.checkout(req));
    }

    @GetMapping
    public ResponseEntity<OrderDtos.OrderHistoryResponse> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(orders.getOrderHistory(page, size));
    }
}

