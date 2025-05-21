import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ko } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/ArtRegister.css";
import { PostDTO } from "../../types/postTypes";
import { PictureDTO } from "../../types/pictureTypes";
import { TradeDTO } from "../../types/tradeTypes";
import { getAuthHeaders, getToken, hasToken } from "../../utils/auth";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface PostDataState extends Omit<PostDTO, 'tradeDTO' | 'pictureDTOList' | 'tag' | 'profileImage' | 'replyCnt' | 'regDate' | 'modDate'> {
  tradeDTO: Partial<TradeDTO>;
  tag: string[];
  startTime: Date | null;
  endTime: Date | null;
  profileImage: string | null;
  replyCnt: number | null;
  regDate: string | null;
  modDate: string | null;
  originImagePath: string | null;
}

const ArtRegister = () => {
  const navigate = useNavigate();

  const [postData, setPostData] = useState<PostDataState>({
    postId: 0,
    userId: 0,
    title: "",
    content: "",
    nickname: "",
    fileName: "",
    boardNo: 5,
    views: 0,
    tag: [],
    thumbnailImagePath: "",
    followers: 0,
    downloads: 0,
    favoriteCnt: 0,
    tradeDTO: {
      startPrice: 0,
      nowBuy: 0,
      startBidTime: new Date(),
      lastBidTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    profileImage: null,
    replyCnt: null,
    regDate: null,
    modDate: null,
    originImagePath: null,
  });

  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [uploadedPictures, setUploadedPictures] = useState<PictureDTO[]>([]);

  const [newTag, setNewTag] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = getToken();

      if (!hasToken() || !user?.email) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        const headers = {
          ...getAuthHeaders(),
          'Accept': 'application/json'
        };
        
        console.log("요청 헤더:", headers);
        console.log("요청 URL:", `http://localhost:8080/ourlog/user/get?email=${encodeURIComponent(user.email)}`);

        const userResponse = await fetch(`http://localhost:8080/ourlog/user/get?email=${encodeURIComponent(user.email)}`, {
          method: "GET",
          headers: headers
        });

        console.log("응답 상태:", userResponse.status);

        if (!userResponse.ok) {
          if (userResponse.status === 403) {
            alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
            navigate("/login");
            return;
          }
          const errorText = await userResponse.text();
          console.error("에러 응답:", errorText);
          throw new Error(`사용자 정보를 가져오는데 실패했습니다. (${userResponse.status})`);
        }

        const userData = await userResponse.json();
        console.log("받아온 사용자 정보:", userData);
        
        if (!userData || !userData.userId) {
          throw new Error("유효하지 않은 사용자 정보입니다.");
        }

        setPostData(prev => ({
          ...prev,
          userId: userData.userId,
          nickname: userData.nickname || userData.email || "익명",
        }));

      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("사용자 정보를 가져오는데 실패했습니다.");
        }
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    setPostData(prev => ({
      ...prev,
      tradeDTO: {
        ...prev.tradeDTO,
        startBidTime: postData.startTime ? postData.startTime : new Date(),
        lastBidTime: postData.endTime ? postData.endTime : new Date(),
      }
    }));
  }, [postData.startTime, postData.endTime]);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 최대 크기 1920px로 제한
          const MAX_SIZE = 1920;
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('이미지 압축에 실패했습니다.'));
            }
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => reject(new Error('이미지 로드에 실패했습니다.'));
      };
      reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - imageFiles.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newImage: ImageFile = {
                file,
                preview: reader.result as string,
                id: Math.random().toString(36).substring(7),
            };
            setImageFiles(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
    });
  };

  const handleThumbnailSelect = (imageId: string) => {
    setImageFiles(prev => {
      const selectedImage = prev.find(img => img.id === imageId);
      if (!selectedImage) return prev;

      const otherImages = prev.filter(img => img.id !== imageId);
      const newImageFiles = [selectedImage, ...otherImages];

      // 썸네일 파일명 (UUID) 상태 업데이트
      setPostData(postPrev => ({
          ...postPrev,
          fileName: imageId,
      }));

      return newImageFiles;
    });
  };

  const handleImageDelete = (imageId: string) => {
    setImageFiles(prev => prev.filter((img) => img.id !== imageId));
    setPostData(prev => {
        if (prev.fileName === imageId) {
            const remainingImages = imageFiles.filter(img => img.id !== imageId);
            return {
                ...prev,
                fileName: remainingImages.length > 0 ? remainingImages[0].id : "",
            };
        }
        return prev;
    });
  };

  const formatPrice = (value: string): number => {
    const number = value.replace(/[^\d]/g, "");
    return Number(number);
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const price = formatPrice(value);

    setPostData(prev => ({
      ...prev,
      tradeDTO: {
        ...prev.tradeDTO,
        [name]: price,
      }
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (postData.tag.includes(newTag.trim())) {
        alert("이미 존재하는 태그입니다.");
        return;
      }
      setPostData(prev => ({
        ...prev,
        tag: [...prev.tag, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tag: prev.tag.filter(tag => tag !== tagToRemove),
    }));
  };

  const uploadImageFile = async (file: File): Promise<PictureDTO> => {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log("이미지 압축 시작:", file.name);
      file = await compressImage(file);
      console.log("이미지 압축 완료:", file.name, "크기:", file.size);
    }

    const fd = new FormData();
    fd.append("files", file);

    const token = getToken();
    if (!token) throw new Error("토큰이 없습니다. 로그인 상태를 확인해주세요.");

    console.log("이미지 업로드 요청 시작");
    console.log("토큰:", token);
    console.log("파일 크기:", file.size);

    const res = await fetch("http://localhost:8080/ourlog/picture/upload", {
      method: "POST",
      headers: {
        'Authorization': token,
      },
      body: fd
    });

    console.log("이미지 업로드 응답 상태:", res.status);

    if (!res.ok) {
        const errorBody = await res.text();
        console.error("이미지 업로드 실패 응답:", errorBody);
        throw new Error(`이미지 업로드 실패: ${res.status} - ${errorBody}`);
    }

    const data = await res.json();
    console.log("이미지 업로드 성공 응답:", data);

    if (!data || data.length === 0 || !data[0].uuid) {
        throw new Error("이미지 업로드 응답 형식이 올바르지 않습니다.");
    }
    return data[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasToken()) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    if (imageFiles.length === 0) {
      alert("최소 한 개의 이미지를 업로드해주세요.");
      return;
    }
    if (!postData.title.trim()) {
        alert("작품 제목을 입력해주세요.");
        return;
    }
    if (!postData.content.trim()) {
        alert("작품 설명을 입력해주세요.");
        return;
    }
    if (!postData.tradeDTO.startPrice || postData.tradeDTO.startPrice <= 0) {
        alert("경매 시작가를 0보다 큰 값으로 입력해주세요.");
        return;
    }
     if (!postData.tradeDTO.nowBuy || postData.tradeDTO.nowBuy <= 0) {
        alert("즉시 구매가를 0보다 큰 값으로 입력해주세요.");
        return;
    }
    if (!postData.startTime || !postData.endTime) {
         alert("경매 시작 및 종료 시간을 설정해주세요.");
         return;
    }

    const startPriceNum = postData.tradeDTO.startPrice;
    const nowBuyNum = postData.tradeDTO.nowBuy;
    if (startPriceNum % 1000 !== 0 || nowBuyNum % 1000 !== 0) {
      alert("시작가와 즉시구매가는 1,000원 단위로 입력해야 합니다.");
      return;
    }
    if (startPriceNum > 100000000 || nowBuyNum > 100000000) {
      alert("시작가와 즉시구매가는 1억원(100,000,000) 이하로 입력해야 합니다.");
      return;
    }
    if (nowBuyNum < startPriceNum) {
      alert("즉시구매가는 시작가보다 크거나 같아야 합니다.");
      return;
    }

    const maxEndTime = new Date(postData.startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (postData.endTime > maxEndTime) {
      alert("경매 종료시간은 시작일로부터 최대 7일 이내여야 합니다.");
      return;
    }

    if (!postData.userId || !postData.nickname) {
        alert("사용자 정보가 로딩되지 않았습니다. 다시 시도해주세요.");
        return;
    }

    try {
      const uploadedPictureDTOs = await Promise.all(
        imageFiles.map(imageFile => uploadImageFile(imageFile.file))
      );

      setUploadedPictures(uploadedPictureDTOs);

      const thumbnailPicture = uploadedPictureDTOs.find(pic => pic.uuid === postData.fileName);

      // 경매 시작 시간을 현재 시간으로 고정
      const currentStartTime = new Date();

      const thumbnailUuid = thumbnailPicture ? thumbnailPicture.uuid : (uploadedPictureDTOs.length > 0 ? uploadedPictureDTOs[0].uuid : "");

      const finalPostDTO = {
          userId: postData.userId,
          title: postData.title,
          content: postData.content,
          nickname: postData.nickname,
          boardNo: postData.boardNo,
          views: postData.views,
          tag: postData.tag.join(','),
          thumbnailImagePath: thumbnailPicture ? thumbnailPicture.thumbnailImagePath : postData.thumbnailImagePath,
          followers: postData.followers,
          downloads: postData.downloads,
          favoriteCnt: postData.favoriteCnt,
          profileImage: postData.profileImage,
          replyCnt: postData.replyCnt,
          regDate: postData.regDate,
          modDate: postData.modDate,
          fileName: thumbnailUuid,
          pictureDTOList: uploadedPictureDTOs,
          tradeDTO: {
              ...postData.tradeDTO,
              startBidTime: currentStartTime,
              lastBidTime: postData.endTime ? postData.endTime : new Date(),
          },
      };

      const finalPostDTOTyped: PostDTO = finalPostDTO as PostDTO;

      console.log("전송할 최종 PostDTO:", finalPostDTOTyped);

      const postRes = await fetch("http://localhost:8080/ourlog/post/register", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(finalPostDTOTyped),
      });

      if (!postRes.ok) {
          const errorBody = await postRes.text();
          console.error("작품 등록 실패 응답:", errorBody);
          throw new Error(`작품 등록 실패: ${postRes.status} - ${errorBody}`);
      }

      const postId = await postRes.text();
      console.log("게시글 등록 응답 postId:", postId);

      const registeredPostId = Number(postId);
       if (isNaN(registeredPostId)) {
           console.error("응답에서 유효한 postId를 찾을 수 없습니다:", postId);
           throw new Error("게시글 등록 후 유효한 postId를 받지 못했습니다.");
       }

      const tradeRegisterDTO = {
          ...finalPostDTO.tradeDTO,
          postId: registeredPostId,
          sellerId: finalPostDTO.userId,
      };

      console.log("전송할 Trade 등록 DTO:", tradeRegisterDTO);

      const tradeRes = await fetch("http://localhost:8080/ourlog/trades/register", {
         method: "POST",
         headers: getAuthHeaders(),
         body: JSON.stringify(tradeRegisterDTO),
      });

      if (!tradeRes.ok) {
          const errorBody = await tradeRes.text();
          console.error("경매 등록 실패 응답:", errorBody);
           throw new Error(`경매 등록 실패: ${tradeRes.status} - ${errorBody}`);
      }

      alert("작품이 성공적으로 등록되었습니다!");
      navigate(`/art/${registeredPostId}`);

    } catch (err) {
      console.error("작품 등록 중 오류 발생:", err);
      alert(err instanceof Error ? err.message : "작품 등록 중 오류가 발생했습니다.");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const dropzone = target.closest(".image-upload-placeholder");
    if (dropzone) {
      dropzone.classList.add("dragover");
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const dropzone = target.closest(".image-upload-placeholder");
    if (dropzone) {
      dropzone.classList.remove("dragover");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    const dropzone = target.closest(".image-upload-placeholder");
    if (dropzone) {
      dropzone.classList.remove("dragover");
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFilesToProcess = files.filter(file => file.type.startsWith("image/"));

     imageFilesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ImageFile = {
            file,
            preview: reader.result as string,
            id: Math.random().toString(36).substring(7),
          };
          setImageFiles(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
    });
  }, []);

  const handleStartTimeChange = (date: Date | null) => {
    setPostData(prev => ({ ...prev, startTime: date }));
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (!date) return;

    if (postData.startTime && date < postData.startTime) {
        alert("경매 종료 시간은 시작 시간보다 빠를 수 없습니다.");
        return;
    }

    const maxEndTime = new Date(postData.startTime ? postData.startTime.getTime() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (date > maxEndTime) {
      alert("경매 종료시간은 시작일로부터 최대 7일 이내여야 합니다.");
      return;
    }

    setPostData(prev => ({ ...prev, endTime: date }));
  };

  return (
    <div className="art-register-container">
      <div className="art-register-grid">
        <div className="image-upload-section">
          <div className="image-grid">
            {imageFiles.length > 0 ? (
              <div
                className={`image-item ${
                  postData.fileName === imageFiles[0].id
                    ? "thumbnail-selected"
                    : ""
                }`}
              >
                <img
                  src={imageFiles[0].preview}
                  alt="메인 이미지"
                  className="uploaded-image"
                  onClick={() => handleThumbnailSelect(imageFiles[0].id)}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => handleImageDelete(imageFiles[0].id)}
                    className="delete-button"
                  >
                    ✕
                  </button>
                  {postData.fileName === imageFiles[0].id && (
                    <span className="thumbnail-badge">썸네일</span>
                  )}
                  {postData.fileName !== imageFiles[0].id && (
                    <button
                      type="button"
                      onClick={() => handleThumbnailSelect(imageFiles[0].id)}
                      className="thumbnail-button"
                    >
                      썸네일로 설정
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="image-upload-placeholder"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                 <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="artwork-image-main"
                  multiple
                  ref={fileInputRef}
                />
                <label htmlFor="artwork-image-main">
                  <span>메인 이미지를 업로드해주세요</span>
                  <span className="mt-2 text-sm">
                    (클릭 또는 드래그하여 파일 선택)
                  </span>
                </label>
              </div>
            )}

            {imageFiles.slice(1).map((image) => (
              <div
                key={image.id}
                className={`image-item ${
                  postData.fileName === image.id
                    ? "thumbnail-selected"
                    : ""
                }`}
              >
                <img
                  src={image.preview}
                  alt="업로드 이미지"
                  className="uploaded-image"
                  onClick={() => handleThumbnailSelect(image.id)}
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    onClick={() => handleImageDelete(image.id)}
                    className="delete-button"
                  >
                    ✕
                  </button>
                  {postData.fileName === image.id && (
                    <span className="thumbnail-badge">썸네일</span>
                  )}
                  {postData.fileName !== image.id && (
                    <button
                      type="button"
                      onClick={() => handleThumbnailSelect(image.id)}
                      className="thumbnail-button"
                    >
                      썸네일로 설정
                    </button>
                  )}
                </div>
              </div>
            ))}

            {imageFiles.length < 10 && (
              <div className="image-upload-placeholder small"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                 <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="artwork-image-additional"
                  multiple
                   ref={fileInputRef}
                />
                <label htmlFor="artwork-image-additional">
                  <span>추가 이미지</span>
                  <span className="mt-1 text-sm">
                    ({imageFiles.length}/10)
                  </span>
                </label>
              </div>
            )}
          </div>
          {imageFiles.length > 0 && (
            <>
              <p className="image-help-text">
                * 이미지를 클릭하여 썸네일로 설정할 수 있습니다.
              </p>

              <div className="tags-section">
                {postData.tag.length > 0 && (
                  <div className="tags-container">
                    {postData.tag.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="remove-tag"
                          title="태그 삭제"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="tags-input-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleAddTag}
                    placeholder="태그 입력 후 Enter"
                    className="tag-input"
                    maxLength={20}
                  />
                   <button
                    onClick={() => {
                      if (newTag.trim()) {
                        if (postData.tag.includes(newTag.trim())) {
                          alert("이미 존재하는 태그입니다.");
                          return;
                        }
                        setPostData(prev => ({
                          ...prev,
                          tag: [...prev.tag, newTag.trim()],
                        }));
                        setNewTag("");
                      }
                    }}
                    className="tag-add-button"
                    type="button"
                  >
                    추가
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="art-info-section">
           <div className="user-info">
            <div className="user-profile">
                <div className="user-profile-placeholder"></div>
            </div>
            <span className="user-name">{postData.nickname || "로딩 중..."}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="post-group">
              <label htmlFor="title" className="post-label">
                작품 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={postData.title}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="post-input"
                required
              />
            </div>

            <div className="post-group">
              <label htmlFor="content" className="post-label">
                작품 설명
              </label>
              <textarea
                id="content"
                name="content"
                value={postData.content}
                onChange={(e) =>
                  setPostData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="post-textarea"
                required
              />
            </div>

            <div className="price-info">
              <div className="price-box">
                <div className="price-label">시작가</div>
                <div className="price-value">{postData.tradeDTO.startPrice?.toLocaleString() || "0"}원</div>
              </div>
              <div className="price-box current-price">
                <div className="price-label">현재 입찰가</div>
                <div className="price-value">{postData.tradeDTO.highestBid?.toLocaleString() || postData.tradeDTO.startPrice?.toLocaleString() || "0"}원</div>
              </div>
              <div className="price-box">
                <div className="price-label">즉시 구매가</div>
                <div className="price-value">{postData.tradeDTO.nowBuy?.toLocaleString() || "0"}원</div>
              </div>
            </div>

            <div className="bid-section">
              <div className="post-group">
                <label htmlFor="startPrice" className="post-label">
                  경매 시작가 설정
                </label>
                <input
                  type="number"
                  id="startPrice"
                  name="startPrice"
                  value={postData.tradeDTO.startPrice}
                  onChange={handlePriceInputChange}
                  className="post-input"
                  required
                  min="0"
                  step="1000"
                />
              </div>

              <div className="post-group">
                <label htmlFor="nowBuy" className="post-label">
                  즉시 구매가 설정
                </label>
                 <input
                  type="number"
                  id="nowBuy"
                  name="nowBuy"
                  value={postData.tradeDTO.nowBuy}
                  onChange={handlePriceInputChange}
                  className="post-input"
                  required
                  min="0"
                   step="1000"
                />
              </div>

              <div className="post-group">
                <label className="post-label">경매 시작 시간</label>
                <p className="post-input-display">
                    {new Date().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace('/', '. ').replace('/', '. ')}
                </p>
              </div>

              <div className="post-group">
                <label className="post-label">경매 종료 시간</label>
                <DatePicker
                  selected={postData.endTime}
                  onChange={handleEndTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy.MM.dd HH:mm"
                  className="post-input"
                  locale={ko}
                  minDate={postData.startTime || new Date()}
                  required
                />
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="button button-secondary"
              >
                취소
              </button>
              <button type="submit" className="button button-primary">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtRegister;
