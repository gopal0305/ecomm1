package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.dto.product.ProductDtos;
import com.example.ecomm.model.Category;
import com.example.ecomm.model.Product;
import com.example.ecomm.repo.CategoryRepository;
import com.example.ecomm.repo.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository products;
    private final CategoryRepository categories;

    public ProductService(ProductRepository products, CategoryRepository categories) {
        this.products = products;
        this.categories = categories;
    }

    public Page<ProductDtos.ProductResponse> search(Long categoryId, String search, Double minPrice, Double maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return products.search(categoryId, search, minPrice, maxPrice, pageable)
                .map(this::toResponse);
    }

    public ProductDtos.ProductResponse getById(Long id) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
        return toResponse(p);
    }

    public ProductDtos.ProductResponse create(ProductDtos.ProductCreateRequest req) {
        Category cat = categories.findById(req.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Product p = new Product();
        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setImageUrl(req.getImageUrl());
        p.setCategory(cat);

        return toResponse(products.save(p));
    }

    public ProductDtos.ProductResponse update(Long id, ProductDtos.ProductUpdateRequest req) {
        Product p = products.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
        Category cat = categories.findById(req.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        p.setName(req.getName());
        p.setDescription(req.getDescription());
        p.setPrice(req.getPrice());
        p.setImageUrl(req.getImageUrl());
        p.setCategory(cat);

        return toResponse(products.save(p));
    }

    public void delete(Long id) {
        if (!products.existsById(id)) {
            throw new NotFoundException("Product not found");
        }
        products.deleteById(id);
    }

    private ProductDtos.ProductResponse toResponse(Product p) {
        Long catId = p.getCategory() != null ? p.getCategory().getId() : null;
        String catName = p.getCategory() != null ? p.getCategory().getName() : null;
        return new ProductDtos.ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getImageUrl(),
                catId,
                catName
        );
    }
}

