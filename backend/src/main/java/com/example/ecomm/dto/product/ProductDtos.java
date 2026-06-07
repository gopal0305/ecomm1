package com.example.ecomm.dto.product;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProductDtos {

    public static class ProductCreateRequest {
        @NotBlank
        private String name;

        @Size(max = 2000)
        private String description;

        @Min(0)
        private double price;

        private String imageUrl;

        private Long categoryId;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public double getPrice() {
            return price;
        }

        public void setPrice(double price) {
            this.price = price;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }
    }

    public static class ProductUpdateRequest extends ProductCreateRequest {
    }

    public record ProductResponse(
            Long id,
            String name,
            String description,
            double price,
            String imageUrl,
            Long categoryId,
            String categoryName
    ) {}
}

