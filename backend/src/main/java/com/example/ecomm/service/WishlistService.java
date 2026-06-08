package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.common.exceptions.UnauthorizedException;
import com.example.ecomm.dto.wishlist.WishlistDtos;
import com.example.ecomm.model.Product;
import com.example.ecomm.model.User;
import com.example.ecomm.model.Wishlist;
import com.example.ecomm.repo.ProductRepository;
import com.example.ecomm.repo.UserRepository;
import com.example.ecomm.repo.WishlistRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistRepository wishlists;
    private final ProductRepository products;
    private final UserRepository users;

    public WishlistService(WishlistRepository wishlists,
                            ProductRepository products,
                            UserRepository users) {
        this.wishlists = wishlists;
        this.products = products;
        this.users = users;
    }

    public WishlistDtos.WishlistResponse getCurrent() {
        User user = requireCurrentUser();
        Wishlist wishlist = wishlists.findByUser(user)
                .orElseGet(() -> {
                    Wishlist w = new Wishlist();
                    w.setUser(user);
                    return wishlists.save(w);
                });

        List<Product> prods = wishlist.getProducts();
        return toResponse(wishlist.getId(), prods);
    }

    public WishlistDtos.WishlistResponse addItem(WishlistDtos.WishlistAddRequest req) {
        User user = requireCurrentUser();
        Wishlist wishlist = wishlists.findByUser(user)
                .orElseGet(() -> {
                    Wishlist w = new Wishlist();
                    w.setUser(user);
                    return wishlists.save(w);
                });

        Product product = products.findById(req.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        boolean exists = wishlist.getProducts().stream()
                .anyMatch(p -> p.getId().equals(product.getId()));

        if (!exists) {
            wishlist.getProducts().add(product);
            wishlists.save(wishlist);
        }

        return getCurrent();
    }

    public void removeItem(Long productId) {
        User user = requireCurrentUser();
        Wishlist wishlist = wishlists.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Wishlist not found"));

        Product product = products.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        wishlist.getProducts().removeIf(p -> p.getId().equals(product.getId()));
        wishlists.save(wishlist);
    }

    private WishlistDtos.WishlistResponse toResponse(Long wishlistId, List<Product> products) {
        var items = products.stream()
                .map(p -> new WishlistDtos.WishlistItemResponse(
                        p.getId(),
                        p.getName(),
                        p.getImageUrl(),
                        p.getPrice()
                ))
                .toList();

        return new WishlistDtos.WishlistResponse(items, wishlistId);
    }

    private User requireCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        // JwtAuthenticationFilter sets the authenticated principal name to the user email (see JwtAuthPrincipal/Auth flow)
        String email = auth.getName();
        return users.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}


