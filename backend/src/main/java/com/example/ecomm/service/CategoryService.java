package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.dto.category.CategoryDtos;
import com.example.ecomm.model.Category;
import com.example.ecomm.repo.CategoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class CategoryService {

    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    public Page<CategoryDtos.CategoryResponse> list(int page, int size) {
        return categories.findAll(PageRequest.of(page, size)).map(this::toResponse);
    }

    public CategoryDtos.CategoryResponse getById(Long id) {
        Category c = categories.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        return toResponse(c);
    }

    public CategoryDtos.CategoryResponse create(CategoryDtos.CategoryCreateRequest req) {
        Category c = new Category();
        c.setName(req.getName());
        return toResponse(categories.save(c));
    }

    public CategoryDtos.CategoryResponse update(Long id, CategoryDtos.CategoryUpdateRequest req) {
        Category c = categories.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        c.setName(req.getName());
        return toResponse(categories.save(c));
    }

    public void delete(Long id) {
        if (!categories.existsById(id)) {
            throw new NotFoundException("Category not found");
        }
        categories.deleteById(id);
    }

    private CategoryDtos.CategoryResponse toResponse(Category c) {
        return new CategoryDtos.CategoryResponse(c.getId(), c.getName());
    }
}

