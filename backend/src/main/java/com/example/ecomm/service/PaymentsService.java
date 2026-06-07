package com.example.ecomm.service;

import com.example.ecomm.common.exceptions.NotFoundException;
import com.example.ecomm.dto.payment.PaymentDtos;
import com.example.ecomm.model.Order;
import com.example.ecomm.model.Payment;
import com.example.ecomm.repo.OrderRepository;
import com.example.ecomm.repo.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentsService {

    private final OrderRepository orders;
    private final PaymentRepository payments;

    public PaymentsService(OrderRepository orders, PaymentRepository payments) {
        this.orders = orders;
        this.payments = payments;
    }

    @Transactional
    public PaymentDtos.PaymentInitResponse initiatePayment(Long orderId) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // If already paid/failed, just return current state.
        if (order.getStatus() == Order.Status.PAID) {
            return toInitResponse(order.getId(), Payment.Status.SUCCESS, "ALREADY_PAID");
        }

        Payment payment = new Payment();
        payment.setStatus(Payment.Status.INITIATED);
        payment.setProvider("MOCK");
        payment.setOrder(order);
        payment.setReference("PAY-" + UUID.randomUUID());

        // In this mock flow, immediately mark success.
        payment.setStatus(Payment.Status.SUCCESS);
        order.setStatus(Order.Status.PAID);

        payments.save(payment);
        orders.save(order);

        return toInitResponse(order.getId(), Payment.Status.SUCCESS, payment.getReference());
    }

    private PaymentDtos.PaymentInitResponse toInitResponse(Long orderId, Payment.Status status, String reference) {
        return new PaymentDtos.PaymentInitResponse(orderId, status.name(), reference);
    }
}

