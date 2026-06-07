package com.example.ecomm.service;

import com.example.ecomm.dto.order.OrderDtos;
import com.example.ecomm.model.Order;
import com.example.ecomm.repo.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {

    private final OrderRepository orders;

    public AdminService(OrderRepository orders) {
        this.orders = orders;
    }

    public Map<String, Object> dashboard() {
        Map<String, Object> map = new HashMap<>();
        map.put("ordersCount", orders.count());
        return map;
    }

    public OrderDtos.OrderHistoryResponse ordersForAdmin(int page, int size) {
        // minimal placeholder: return empty items until full Orders module is implemented
        Page<Order> p = orders.findAll(PageRequest.of(page, size));
        return new OrderDtos.OrderHistoryResponse(p.getContent().stream().map(o -> new OrderDtos.OrderResponse(
                o.getId(), o.getStatus().name(), o.getTotal(), o.getCreatedAt(),
                o.getItems().stream().map(oi -> new OrderDtos.OrderItemResponse(
                        oi.getProduct().getId(), oi.getProduct().getName(), oi.getPrice(), oi.getQuantity()
                )).toList()
        )).toList());
    }
}

