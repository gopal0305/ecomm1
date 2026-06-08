package com.example.ecomm.dto.wishlist;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class WishlistDtos {

    public record WishlistResponse(List<WishlistItemResponse> items, Long wishlistId) {}


    public record WishlistItemResponse(Long productId, String productName, String imageUrl, double price) {}

    public static class WishlistAddRequest {
        @NotNull
        private Long productId;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }
    }
}

