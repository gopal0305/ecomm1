package com.example.ecomm.controller;

import com.example.ecomm.dto.cart.CartDtos;
import com.example.ecomm.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cart;

    public CartController(CartService cart) {
        this.cart = cart;
    }

    @PostMapping("/items")
    public ResponseEntity<CartDtos.CartResponse> addItem(
            @Valid @RequestBody CartDtos.AddToCartRequest req
    ) {
        return ResponseEntity.ok(cart.addItem(req));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartDtos.CartResponse> updateQuantity(
            @PathVariable Long productId,
            @Valid @RequestBody CartDtos.UpdateCartItemRequest req
    ) {
        return ResponseEntity.ok(cart.updateQuantity(productId, req));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long productId) {
        cart.removeItem(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<CartDtos.CartResponse> view() {
        return ResponseEntity.ok(cart.getCurrentCart());
    }
}



