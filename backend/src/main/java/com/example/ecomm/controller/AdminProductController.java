package com.example.ecomm.controller;

import com.example.ecomm.dto.product.ProductDtos;
import com.example.ecomm.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService products;

    public AdminProductController(ProductService products) {
        this.products = products;
    }

    @PostMapping
    public ResponseEntity<ProductDtos.ProductResponse> create(@Valid @RequestBody ProductDtos.ProductCreateRequest request) {
        return ResponseEntity.ok(products.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDtos.ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductDtos.ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(products.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        products.delete(id);
        return ResponseEntity.noContent().build();
    }
}

