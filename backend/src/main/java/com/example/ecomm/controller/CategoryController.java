package com.example.ecomm.controller;

import com.example.ecomm.dto.category.CategoryDtos;
import com.example.ecomm.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categories;

    public CategoryController(CategoryService categories) {
        this.categories = categories;
    }

    @GetMapping
    public ResponseEntity<Page<CategoryDtos.CategoryResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(categories.list(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDtos.CategoryResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(categories.getById(id));
    }
}

