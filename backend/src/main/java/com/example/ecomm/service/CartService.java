package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.dto.cart.CartDtos;
import com.example.ecomm.model.Cart;
import com.example.ecomm.model.CartItem;
import com.example.ecomm.model.Product;
import com.example.ecomm.model.User;
import com.example.ecomm.repo.CartItemRepository;
import com.example.ecomm.repo.CartRepository;
import com.example.ecomm.repo.ProductRepository;
import com.example.ecomm.repo.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final UserRepository users;

    public CartService(CartRepository carts,
                        CartItemRepository cartItems,
                        ProductRepository products,
                        UserRepository users) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.products = products;
        this.users = users;
    }

    public CartDtos.CartResponse getCurrentCart() {
        User user = requireCurrentUser();
        Cart cart = carts.findByUser(user)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    return carts.save(c);
                });

        // CartItemRepository has only findByCartIdAndProductId; use in-memory filter.
        List<CartItem> items = cartItems.findAll().stream()
                .filter(i -> i.getCart().equals(cart))
                .toList();

        return toResponse(items);
    }

    public CartDtos.CartResponse addItem(CartDtos.AddToCartRequest req) {
        User user = requireCurrentUser();
        Product product = products.findById(req.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Cart cart = carts.findByUser(user)
                .orElseGet(() -> {
                    Cart c = new Cart();
                    c.setUser(user);
                    return carts.save(c);
                });

        CartItem existing = cartItems.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + req.getQuantity());
            cartItems.save(existing);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(req.getQuantity());
            cartItems.save(item);
        }

        return getCurrentCart();
    }

    public CartDtos.CartResponse updateQuantity(Long productId, CartDtos.UpdateCartItemRequest req) {
        User user = requireCurrentUser();
        Cart cart = carts.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));

        Product product = products.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        CartItem item = cartItems.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseThrow(() -> new NotFoundException("Item not in cart"));

        int q = req.getQuantity();
        if (q <= 0) {
            cartItems.delete(item);
        } else {
            item.setQuantity(q);
            cartItems.save(item);
        }

        return getCurrentCart();
    }

    public void removeItem(Long productId) {
        User user = requireCurrentUser();
        Cart cart = carts.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));

        Product product = products.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        CartItem item = cartItems.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseThrow(() -> new NotFoundException("Item not in cart"));

        cartItems.delete(item);
    }

    private CartDtos.CartResponse toResponse(List<CartItem> items) {
        List<CartDtos.CartItemResponse> respItems = items.stream()
                .map(i -> new CartDtos.CartItemResponse(
                        i.getProduct().getId(),
                        i.getProduct().getName(),
                        i.getProduct().getImageUrl(),
                        i.getProduct().getPrice().doubleValue(),
                        i.getQuantity(),
                        i.getProduct().getPrice() * i.getQuantity()
                ))
                .toList();

        double total = items.stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();


        return new CartDtos.CartResponse(respItems, total);

    }

    private User requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new com.example.ecomm.common.exceptions.UnauthorizedException("Not authenticated");
        }

        String email = auth.getName();
        return users.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}

