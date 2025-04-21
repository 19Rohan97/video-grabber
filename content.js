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
    const raw = iframe.outerHTML;

    // Try to find a YouTube video ID from various attributes
    const match = raw.match(
      /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );

    if (match) {
      const videoId = match[1];
      const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      videos.push({
        type: "iframe",
        src: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
      });
    }
  });

  // Send to popup
  chrome.runtime.sendMessage({ videos });
})();
