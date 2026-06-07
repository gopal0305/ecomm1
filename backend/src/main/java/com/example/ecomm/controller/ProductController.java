package com.example.ecomm.controller;

import com.example.ecomm.dto.product.ProductDtos;
import com.example.ecomm.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService products;

    public ProductController(ProductService products) {
        this.products = products;
    }

    @GetMapping
    public Page<ProductDtos.ProductResponse> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return products.search(categoryId, search, minPrice, maxPrice, page, size);
    }

    @GetMapping("/{id}")
    public ProductDtos.ProductResponse get(@PathVariable Long id) {
        return products.getById(id);
    }

}

