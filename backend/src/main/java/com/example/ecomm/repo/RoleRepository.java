package com.example.ecomm.repo;

import com.example.ecomm.model.Role;
import com.example.ecomm.model.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}

