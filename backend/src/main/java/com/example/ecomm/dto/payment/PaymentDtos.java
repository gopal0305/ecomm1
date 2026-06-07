package com.example.ecomm.dto.payment;

public class PaymentDtos {

    public record PaymentInitResponse(Long orderId, String status, String reference) {}
}

