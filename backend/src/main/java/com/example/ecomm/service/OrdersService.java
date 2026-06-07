package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.dto.cart.CartDtos;
import com.example.ecomm.dto.order.OrderDtos;
import com.example.ecomm.model.CartItem;
import com.example.ecomm.model.Order;
import com.example.ecomm.model.OrderItem;
import com.example.ecomm.model.Product;
import com.example.ecomm.model.User;
import com.example.ecomm.repo.CartItemRepository;
import com.example.ecomm.repo.CartRepository;
import com.example.ecomm.repo.OrderRepository;
import com.example.ecomm.repo.ProductRepository;
import com.example.ecomm.repo.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static java.util.stream.Collectors.toList;

@Service
public class OrdersService {

    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final UserRepository users;

    public OrdersService(CartRepository carts,
                          CartItemRepository cartItems,
                          ProductRepository products,
                          OrderRepository orders,
                          UserRepository users) {
        this.carts = carts;
        this.cartItems = cartItems;
        this.products = products;
        this.orders = orders;
        this.users = users;
    }

    @Transactional
    public OrderDtos.OrderResponse checkout(OrderDtos.CheckoutRequest req) {
        User user = requireCurrentUser();

        var cart = carts.findByUser(user)
                .orElseThrow(() -> new NotFoundException("Cart not found"));

        // CartItemRepository lacks a query for cartId; current project pattern filters in-memory.
        List<CartItem> items = cartItems.findAll().stream()
                .filter(i -> i.getCart().equals(cart))
                .toList();

        if (items.isEmpty()) {
            throw new NotFoundException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(req.getShippingAddress());
        order.setStatus(Order.Status.CREATED);

        BigDecimal total = items.stream()
                .map(i -> BigDecimal.valueOf(i.getProduct().getPrice()).multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotal(total.doubleValue());

        List<OrderItem> oi = items.stream().map(ci -> {
            OrderItem x = new OrderItem();
            x.setOrder(order);
            x.setProduct(ci.getProduct());
            x.setQuantity(ci.getQuantity());
            x.setPrice(ci.getProduct().getPrice());
            return x;
        }).toList();

        order.getItems().addAll(oi);

        Order saved = orders.save(order);

        // Clear cart items after successful checkout.
        cartItems.deleteAll(items);

        return toResponse(saved);
    }

    public OrderDtos.OrderHistoryResponse getOrderHistory(int page, int size) {
        User user = requireCurrentUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> p = orders.findByUser(user, pageable);

        List<OrderDtos.OrderResponse> resp = p.getContent().stream()
                .map(this::toResponse)
                .collect(toList());

        return new OrderDtos.OrderHistoryResponse(resp);
    }

    private OrderDtos.OrderResponse toResponse(Order o) {
        var items = o.getItems().stream()
                .map(oi -> new OrderDtos.OrderItemResponse(
                        oi.getProduct().getId(),
                        oi.getProduct().getName(),
                        oi.getPrice(),
                        oi.getQuantity()
                ))
                .collect(toList());

        return new OrderDtos.OrderResponse(
                o.getId(),
                o.getStatus().name(),
                o.getTotal(),
                o.getCreatedAt(),
                items
        );
    }

    private User requireCurrentUser() {
        var email = com.example.ecomm.security.JwtAuthPrincipal.currentEmail();
        if (email == null) {
            throw new com.example.ecomm.common.exceptions.UnauthorizedException("Not authenticated");
        }

        return users.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}

