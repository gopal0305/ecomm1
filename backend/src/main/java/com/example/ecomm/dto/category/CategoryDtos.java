package com.example.ecomm.dto.category;

import jakarta.validation.constraints.NotBlank;

public class CategoryDtos {

    public static class CategoryCreateRequest {
        @NotBlank
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public static class CategoryUpdateRequest {
        @NotBlank
        private String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    public record CategoryResponse(Long id, String name) {}
}

