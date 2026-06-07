package com.example.ecomm.dto.order;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.Instant;
import java.util.List;

public class OrderDtos {

    public record OrderItemResponse(Long productId, String productName, double price, int quantity) {}

    public record OrderResponse(Long id, String status, double total, Instant createdAt, List<OrderItemResponse> items) {}

    public record OrderHistoryResponse(List<OrderResponse> orders) {}

    public static class CheckoutRequest {
        @NotBlank
        private String shippingAddress;

        public String getShippingAddress() {
            return shippingAddress;
        }

        public void setShippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
        }
    }
}

