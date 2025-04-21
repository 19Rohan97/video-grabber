chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => {
        const videos = [];

        document.querySelectorAll("video").forEach((video) => {
          let src = video.src || (video.querySelector("source")?.src ?? "");
          if (src) {
            videos.push({
              type: "video",
              src,
              thumbnail: video.poster || "", // use <video poster>
            });
          }
        });

        document.querySelectorAll("iframe").forEach((iframe) => {
          const src = iframe.src;
          let thumbnail = "";

          // YouTube
          const ytMatch = src.match(
            /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/
          );
          if (ytMatch) {
            const videoId = ytMatch[1];
            thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }

          // Vimeo (can't get without API, so show no preview)
          const isVimeo = /vimeo\.com/.test(src);
          if (ytMatch || isVimeo) {
            videos.push({ type: "iframe", src, thumbnail });
          }
        });

        return videos;
      },
    },
    (injectionResults) => {
      const results = injectionResults[0].result;
      const container = document.getElementById("video-list");

      if (!results.length) {
        container.innerHTML = "<p>No videos found.</p>";
        return;
      }

      container.innerHTML = results
        .map((video, index) => {
          const thumb = video.thumbnail
            ? `<img src="${video.thumbnail}" class="thumb" alt="Thumbnail">`
            : `<div class="thumb placeholder">No preview</div>`;

          return `
              <div class="video-item">
                ${thumb}
                <a href="${video.src}" target="_blank">${video.src}</a>
                <div class="action-row">
                    <button class="copy-btn" data-url="${
                      video.src
                    }" id="copy-${index}">📋</button>
                    ${
                      video.type === "video"
                        ? `<a href="${video.src}" download class="download-btn">⬇️</a>`
                        : ""
                    }
                    <span class="copied-msg" id="copied-${index}">Copied!</span>
                </div>
              </div>
            `;
        })
        .join("");

      document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const url = btn.getAttribute("data-url");
          navigator.clipboard.writeText(url).then(() => {
            const copiedId = btn.id.replace("copy", "copied");
            const copiedMsg = document.getElementById(copiedId);
            copiedMsg.style.display = "inline";
            setTimeout(() => (copiedMsg.style.display = "none"), 1000);
          });
        });
      });
    }
  );
});
