(() => {
  const videos = [];

  // Get <video> tags
  document.querySelectorAll("video").forEach((video) => {
    if (video.src) {
      videos.push({ type: "video", src: video.src });
    } else {
      const sources = [...video.querySelectorAll("source")].map((s) => s.src);
      sources.forEach((src) => videos.push({ type: "video", src }));
    }
  });

  // Get iframes that may be video embeds (e.g., YouTube, Vimeo)
  document.querySelectorAll("iframe").forEach((iframe) => {
    if (/youtube|vimeo/.test(iframe.src)) {
      videos.push({ type: "iframe", src: iframe.src });
    }
  });

  // Send to popup
  chrome.runtime.sendMessage({ videos });
})();
