package com.example.ecomm.controller;

import com.example.ecomm.dto.payment.PaymentDtos;
import com.example.ecomm.service.PaymentsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentsController {

    private final PaymentsService payments;

    public PaymentsController(PaymentsService payments) {
        this.payments = payments;
    }

    // Mock payment initiation
    @PostMapping("/initiate/{orderId}")
    public ResponseEntity<PaymentDtos.PaymentInitResponse> initiate(@PathVariable Long orderId) {
        return ResponseEntity.ok(payments.initiatePayment(orderId));
    }
}

