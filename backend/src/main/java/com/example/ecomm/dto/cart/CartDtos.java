package com.example.ecomm.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CartDtos {

    public record CartItemResponse(
            Long productId,
            String productName,
            String imageUrl,
            double unitPrice,
            int quantity,
            double lineTotal
    ) {}

    public record CartResponse(List<CartItemResponse> items, double total) {}

    public static class AddToCartRequest {
        @NotNull
        private Long productId;

        @Min(1)
        private int quantity;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }

    public static class UpdateCartItemRequest {
        @Min(1)
        private int quantity;

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }
    }
}

