/**
 * 이벤트 배너 스크립트
 * 사이트별 이벤트 배너를 표시하는 스크립트
 */

;(() => {
    // 스크립트 태그에서 사이트 ID와 버전 가져오기
    const scriptTag = document.currentScript
    const siteId = scriptTag.getAttribute("data-site-id")
    const version = scriptTag.getAttribute("data-version")
  
    if (!siteId) {
      console.error("이벤트 배너: 사이트 ID가 지정되지 않았습니다.")
      return
    }
  
    // 스타일 추가
    const style = document.createElement("style")
    style.textContent = `
     /* 이벤트 타이머 영역 */
     .event-timer {
         background-color: #e53e3e; /* 빨간색 배경 */
         color: white;
         padding: 0.5rem 1rem;
         font-size: 0.875rem;
         z-index: 60;
     }
  
     .event-timer-content {
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: space-between;
         gap: 0.5rem;
     }
  
     @media (min-width: 640px) {
         .event-timer-content {
             flex-direction: row;
         }
     }
  
     .event-timer-title {
         display: flex;
         align-items: center;
     }
  
     .event-timer-title svg {
         margin-right: 0.5rem;
         height: 1rem;
         width: 1rem;
     }
  
     .event-title {
         font-weight: bold;
     }
  
     .event-timer-countdown {
         display: flex;
         align-items: center;
     }
  
     .event-subtitle {
         color: rgba(255, 255, 255, 0.9);
         margin-right: 0.5rem;
         font-weight: medium;
     }
  
     .countdown-container {
         display: flex;
         align-items: center;
         background-color: rgba(255, 255, 255, 0.2);
         border-radius: 9999px;
         padding: 0.25rem 0.75rem;
     }
  
     .countdown-container svg {
         height: 0.75rem;
         width: 0.75rem;
         margin-right: 0.25rem;
     }
  
     .countdown-time {
         font-family: monospace;
         font-weight: bold;
     }
  
     /* 깜빡임 효과 */
     .flash {
         opacity: 0.5;
     }
     /* 애니메이션 */
     @keyframes fadeIn {
         from {
             opacity: 0;
         }
         to {
             opacity: 1;
         }
     }
  
     @keyframes pulse {
         0%, 100% {
             opacity: 1;
         }
         50% {
             opacity: 0.5;
         }
     }
  `
    document.head.appendChild(style)
  
    // 먼저 버전 확인
    fetch(
      `https://cdn.jsdelivr.net/gh/minjin-a/eventApp@main/public/version-check.php?site_id=${siteId}`,
    )
      .then((response) => response.json())
      .then((versionData) => {
        const latestVersion = versionData.version
        const settingsFile = versionData.file
  
        // 설정 가져오기 - 버전이 포함된 파일명 사용
        return fetch(`https://cdn.jsdelivr.net/gh/minjin-a/eventApp@main/${settingsFile}`)
      })
      .then((response) => response.json())
      .then((settings) => {
        // 이벤트 활성화 여부 확인
        if (!settings.isEventActive) {
          // 기본 메시지 표시
          showDefaultMessage(settings)
          return
        }
  
        // 이벤트 종료 시간 확인
        if (settings.eventEndTime) {
          const endTime = new Date(settings.eventEndTime)
          const currentTime = new Date()
  
          if (endTime < currentTime) {
            // 이벤트 기간이 지났으므로 기본 메시지 표시
            showDefaultMessage(settings)
            return
          }
        }
  
        // 이벤트 배너 표시
        showEventBanner(settings)
      })
      .catch((error) => {
        console.error("이벤트 배너 설정을 가져오는 중 오류가 발생했습니다:", error)
      })
  
    // 이벤트 배너 표시 함수
    function showEventBanner(settings) {
      const bannerHTML = `
          <div class="header-top">
              <div class="event-timer" style="background-color: ${settings.defaultBgColor};">
                  <div class="container">
                      <div class="event-timer-content">
                          <div class="event-timer-title">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flash-icon">
                                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                                  <path d="M12 9v4"></path>
                                  <path d="M12 17h.01"></path>
                              </svg>
                              <span class="event-title">${settings.eventTitle}</span>
                          </div>
                          <div class="event-timer-countdown">
                              <span class="event-subtitle">${settings.eventSubtitle}</span>
                              <div class="countdown-container">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  <span id="countdown-time" class="countdown-time">마감까지 00:00:00 남음</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      `
  
      // 배너 삽입
      const bannerContainer = document.createElement("div")
      bannerContainer.innerHTML = bannerHTML
      document.body.insertBefore(bannerContainer, document.body.firstChild)
  
      // 이벤트 링크 설정
      bannerContainer.addEventListener("click", () => {
        if (settings.eventLink) {
          window.location.href = settings.eventLink
        }
      })
  
      // 깜빡임 효과 적용
      const flashIcon = document.querySelector(".flash-icon")
      if (flashIcon) {
        setInterval(() => {
          if (flashIcon.style.opacity === "0.3") {
            flashIcon.style.opacity = "1"
          } else {
            flashIcon.style.opacity = "0.3"
          }
        }, 300)
      }
  
      // 카운트다운 타이머 설정
      if (settings.eventEndTime) {
        updateCountdown(settings.eventEndTime)
      }
    }
  
    // 기본 메시지 표시 함수
    function showDefaultMessage(settings) {
      const messageHTML = `
          <div style="background-color: ${settings.defaultBgColor}; color: white; padding: 10px; text-align: center; font-family: sans-serif; z-index: 60;">
              <div style="font-size: 14px;">${settings.defaultMessage}</div>
          </div>
      `
  
      // 메시지 삽입
      const messageContainer = document.createElement("div")
      messageContainer.innerHTML = messageHTML
      document.body.insertBefore(messageContainer, document.body.firstChild)
  
      // 메시지 링크 설정
      if (settings.defaultMessageLink) {
        messageContainer.addEventListener("click", () => {
          window.location.href = settings.defaultMessageLink
        })
        messageContainer.style.cursor = "pointer"
      }
    }
  
    // 카운트다운 타이머 업데이트 함수
    function updateCountdown(endTimeStr) {
      const targetTime = new Date(endTimeStr)
      const now = new Date()
      const difference = targetTime.getTime() - now.getTime()
  
      const countdownElement = document.getElementById("countdown-time")
      if (!countdownElement) return
  
      if (difference <= 0) {
        // 타이머 종료
        countdownElement.textContent = "마감까지 00:00:00 남음"
        return
      }
  
      // 남은 시간 계산
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
  
      countdownElement.textContent = `마감까지 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} 남음`
  
      // 1초마다 업데이트
      setTimeout(() => updateCountdown(endTimeStr), 1000)
    }
  })()
  
  