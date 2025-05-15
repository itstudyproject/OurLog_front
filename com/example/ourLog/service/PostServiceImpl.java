package com.example.ourLog.service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;
import java.util.logging.Logger;

@Service
public class PostServiceImpl implements PostService {

    private static final Logger log = Logger.getLogger(PostServiceImpl.class.getName());

    @Transactional
    @Override
    public PostDTO get(Long postId) {
        List<Object[]> result = postRepository.getPostWithAll(postId);
        if (result == null || result.isEmpty()) return null;

        Post post = (Post) result.get(0)[0];
        if (post == null) return null;

        // ✅ 조회수 증가 처리
        post.increaseViews();
        postRepository.save(post);

        List<Picture> pictureList = new ArrayList<>();
        for (Object[] arr : result) {
            if (arr != null && arr[1] instanceof Picture) {
                pictureList.add((Picture) arr[1]);
            }
        }

        User user = null;
        if (result.get(0)[2] instanceof User) {
            user = (User) result.get(0)[2];
        }
        
        // 댓글 수 안전하게 처리
        Long replyCnt = 0L;
        try {
            Object replyCountObj = result.get(0)[3];
            if (replyCountObj instanceof Long) {
                replyCnt = (Long) replyCountObj;
            } else if (replyCountObj instanceof Number) {
                replyCnt = ((Number) replyCountObj).longValue();
            }
        } catch (Exception e) {
            log.warn("Failed to get reply count for post {}: {}", postId, e.getMessage());
        }

        return entityToDTO(post, pictureList, user, replyCnt);
    }

    @Override
    @Transactional
    public void remove(Long postId) {
        postRepository.deleteById(postId);
    }

    @Override
    @Transactional
    public void increaseViews(Long postId) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        post.increaseViews();
        postRepository.save(post);
    }
} 