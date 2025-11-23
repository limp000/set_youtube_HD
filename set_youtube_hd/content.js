// 유튜브 화질 자동 조정 스크립트
(function() {
  'use strict';

  // 원하는 화질 우선순위 (높이 기준)
  const QUALITY_PRIORITIES = [
    { height: 1440, label: '1440p' },
    { height: 1080, label: '1080p' },
    { height: 720, label: '720p' }
  ];

  let retryCount = 0;
  const MAX_RETRIES = 20;
  const RETRY_DELAY = 500;
  let isProcessing = false;

  function setQuality() {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const video = document.querySelector('video');
      if (!video) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          isProcessing = false;
          setTimeout(setQuality, RETRY_DELAY);
        } else {
          isProcessing = false;
        }
        return;
      }

      const player = document.getElementById('movie_player');
      if (!player) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          isProcessing = false;
          setTimeout(setQuality, RETRY_DELAY);
        } else {
          isProcessing = false;
        }
        return;
      }

      // 설정 버튼 클릭 방식으로 화질 변경
      const settingsButton = document.querySelector('.ytp-settings-button');
      if (!settingsButton) {
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          isProcessing = false;
          setTimeout(setQuality, RETRY_DELAY);
        } else {
          isProcessing = false;
        }
        return;
      }

      // 설정 메뉴 열기
      settingsButton.click();

      setTimeout(() => {
        // 화질 메뉴 찾기
        const menuItems = document.querySelectorAll('.ytp-menuitem');
        let qualityMenuItem = null;

        for (const item of menuItems) {
          const label = item.querySelector('.ytp-menuitem-label');
          if (label && (label.textContent.includes('화질') || label.textContent.includes('Quality'))) {
            qualityMenuItem = item;
            break;
          }
        }

        if (qualityMenuItem) {
          // 화질 서브메뉴 열기
          qualityMenuItem.click();

          setTimeout(() => {
            // 사용 가능한 화질 옵션 찾기
            const qualityOptions = document.querySelectorAll('.ytp-menuitem');
            let selectedOption = null;

            // 우선순위에 따라 화질 선택
            for (const priority of QUALITY_PRIORITIES) {
              for (const option of qualityOptions) {
                const content = option.textContent;
                if (content.includes(priority.label) || content.includes(priority.height + 'p')) {
                  selectedOption = option;
                  break;
                }
              }
              if (selectedOption) break;
            }

            if (selectedOption) {
              // 선택된 화질 클릭
              selectedOption.click();
              console.log(`유튜브 화질이 변경되었습니다: ${selectedOption.textContent}`);
            } else {
              // 메뉴 닫기
              settingsButton.click();
            }

            retryCount = 0;
            isProcessing = false;
          }, 200);
        } else {
          // 메뉴 닫기
          settingsButton.click();

          if (retryCount < MAX_RETRIES) {
            retryCount++;
            isProcessing = false;
            setTimeout(setQuality, RETRY_DELAY);
          } else {
            isProcessing = false;
          }
        }
      }, 200);

    } catch (error) {
      console.error('화질 설정 중 오류:', error);
      isProcessing = false;
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(setQuality, RETRY_DELAY);
      }
    }
  }

  // 동영상이 준비되면 화질 설정
  function waitForVideo() {
    const video = document.querySelector('video');
    if (video && video.readyState >= 2) {
      // 동영상이 로드되었으면 화질 설정
      setTimeout(() => {
        retryCount = 0;
        setQuality();
      }, 1000);
    } else {
      setTimeout(waitForVideo, 500);
    }
  }

  // 페이지 로드 시 화질 설정
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForVideo);
  } else {
    waitForVideo();
  }

  // YouTube SPA 페이지 전환 감지
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (url.includes('watch')) {
        isProcessing = false;
        retryCount = 0;
        waitForVideo();
      }
    }
  }).observe(document.body, { subtree: true, childList: true });

  // yt-navigate-finish 이벤트 리스너
  document.addEventListener('yt-navigate-finish', () => {
    if (location.href.includes('watch')) {
      isProcessing = false;
      retryCount = 0;
      waitForVideo();
    }
  });

})();
