package com.example.ecomm.controller;

import com.example.ecomm.dto.category.CategoryDtos;
import com.example.ecomm.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final CategoryService categories;

    public AdminCategoryController(CategoryService categories) {
        this.categories = categories;
    }

    @PostMapping
    public ResponseEntity<CategoryDtos.CategoryResponse> create(@Valid @RequestBody CategoryDtos.CategoryCreateRequest request) {
        return ResponseEntity.ok(categories.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDtos.CategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDtos.CategoryUpdateRequest request
    ) {
        return ResponseEntity.ok(categories.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categories.delete(id);
        return ResponseEntity.noContent().build();
    }
}

