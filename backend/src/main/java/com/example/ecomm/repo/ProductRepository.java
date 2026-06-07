package com.example.ecomm.repo;

import com.example.ecomm.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
        select p from Product p
        where (:categoryId is null or p.category.id = :categoryId)
          and (:search is null or lower(p.name) like lower(concat('%', :search, '%')))
          and (:minPrice is null or p.price >= :minPrice)
          and (:maxPrice is null or p.price <= :maxPrice)
    """)
    Page<Product> search(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            Pageable pageable
    );
}

