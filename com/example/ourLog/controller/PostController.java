package com.example.ourLog.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/posts")
public class PostController {

  // ✅ 게시글 상세 조회 (읽기 또는 수정용)
  @GetMapping({"/read/{postId}", "/modify/{postId}"})
  public ResponseEntity<Map<String, PostDTO>> getPost(@PathVariable("postId") Long postId) {
    PostDTO postDTO = postService.get(postId);
    Map<String, PostDTO> result = new HashMap<>();
    result.put("postDTO", postDTO);
    return new ResponseEntity<>(result, HttpStatus.OK);
  }

  // ✅ 조회수 증가
  @PostMapping("/increaseViews/{postId}")
  public ResponseEntity<Void> increaseViews(@PathVariable("postId") Long postId) {
    postService.increaseViews(postId);
    return new ResponseEntity<>(HttpStatus.OK);
  }

  // ✅ 게시글 수정
} 