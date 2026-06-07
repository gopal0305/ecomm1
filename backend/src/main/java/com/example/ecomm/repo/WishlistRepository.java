package com.example.ecomm.repo;

import com.example.ecomm.model.Wishlist;
import com.example.ecomm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUser(User user);
}

