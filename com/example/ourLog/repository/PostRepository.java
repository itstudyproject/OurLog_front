package com.example.ourLog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.param.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT DISTINCT po, pi, u, COUNT(r) FROM Post po " +
            "LEFT JOIN Picture pi ON pi.post = po " +
            "LEFT JOIN Reply r ON r.post = po " +
            "LEFT JOIN User u ON po.user = u " +
            "WHERE po.postId = :postId " +
            "GROUP BY po, pi, u")
    List<Object[]> getPostWithAll(@Param("postId") Long postId);
} 