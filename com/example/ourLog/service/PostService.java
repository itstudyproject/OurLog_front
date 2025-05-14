  // ✨ Entity → DTO 변환
  default PostDTO entityToDTO(Post post, List<Picture> pictureList, User user, Long replyCount) {
    PostDTO postDTO = PostDTO.builder()
            .postId(post.getPostId())
            .title(post.getTitle())
            .content(post.getContent())
            .boardNo(post.getBoardNo())
            .views(post.getViews())
            .tag(post.getTag())
            .fileName(post.getFileName())
            .replyCnt(replyCount != null ? replyCount : 0L)
            .regDate(post.getRegDate())
            .modDate(post.getModDate())
            .build();

    if (user != null) {
      UserDTO userDTO = UserDTO.builder()
          .userId(user.getUserId())
          .email(user.getEmail())
          .nickname(user.getNickname())
          .build();
      postDTO.setUserDTO(userDTO);
    }

    if (pictureList != null && !pictureList.isEmpty()) {
      List<PictureDTO> pictureDTOList = pictureList.stream()
              .map(p -> PictureDTO.builder()
                      .uuid(p.getUuid())
                      .picName(p.getPicName())
                      .path(p.getPath())
                      .build())
              .collect(Collectors.toList());

      postDTO.setPictureDTOList(pictureDTOList);
    }

    return postDTO;
  }

  void modify(PostDTO postDTO);

  void remove(Long postId);

  // 조회수 증가
  void increaseViews(Long postId);

  default Map<String, Object> dtoToEntity(PostDTO postDTO) {
    // Implementation of dtoToEntity method
    return null; // Placeholder return, actual implementation needed
  }
} 