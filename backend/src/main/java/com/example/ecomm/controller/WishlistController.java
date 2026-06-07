package com.example.ecomm.controller;

import com.example.ecomm.dto.wishlist.WishlistDtos;
import com.example.ecomm.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlist;

    public WishlistController(WishlistService wishlist) {
        this.wishlist = wishlist;
    }

    @PostMapping/items
    public ResponseEntity<WishlistDtos.WishlistResponse> add(
            @Valid @RequestBody WishlistDtos.WishlistItemAddRequest req
    ) {
        return ResponseEntity.ok(wishlist.addItem(req));
    }

    @DeleteMapping/items/{productId}
    public ResponseEntity<Void> remove(@PathVariable Long productId) {
        wishlist.removeItem(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<WishlistDtos.WishlistResponse> view() {
        return ResponseEntity.ok(wishlist.getCurrent());
    }
}

