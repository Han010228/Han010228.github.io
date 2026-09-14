"use strict";

/* 此文件只增强静态页面，项目内容已在生成阶段写入 HTML。
 * 即使 JavaScript 被禁用，HR 仍能阅读项目、展开详情、打开图片与播放视频。
 * 不引入第三方统计、远程字体或外部脚本，也不采集访客信息。
 */
(() => {
  const motion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";

  /* 从卡片进入案例时先展开 details，再定位到标题。
   * 直接打开 /#case-xxx 和浏览器前进/后退也走相同逻辑。
   * 只按 ID 获取已存在元素，避免把外部 URL 片段拼接成 CSS 选择器。
   */
  function revealCase(hash, shouldFocus = false) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, "")); } catch { return; }
    const detail = document.getElementById(id);
    if (!(detail instanceof HTMLDetailsElement)) return;
    detail.open = true;
    window.requestAnimationFrame(() => {
      detail.scrollIntoView({ behavior: motion(), block: "start" });
      if (shouldFocus) detail.querySelector("summary")?.focus({ preventScroll: true });
    });
  }
  document.querySelectorAll('a[href^="#case-"]').forEach(link => {
    link.addEventListener("click", event => {
      /* 保留 Ctrl/Cmd/Shift 点击与中键的浏览器原生新标签行为。 */
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const hash = link.getAttribute("href");
      if (location.hash !== hash) history.pushState(null, "", hash);
      revealCase(hash, true);
    });
  });
  window.addEventListener("hashchange", () => revealCase(location.hash));
  revealCase(location.hash);

  /* 图片媒体采用渐进增强：默认链接可直达图片；支持 dialog 时提供站内放大。
   * 原生 dialog 负责焦点限制与 Escape 关闭；关闭后焦点回到发起链接。
   * 使用 textContent 处理说明文字，不将媒体说明解释为 HTML。
   */
  const imageLinks = document.querySelectorAll("[data-lightbox]");
  if (imageLinks.length && typeof HTMLDialogElement !== "undefined") {
    const dialog = document.createElement("dialog");
    dialog.className = "media-lightbox";
    dialog.setAttribute("aria-label", "项目图片预览");
    const close = document.createElement("button");
    close.type = "button";
    close.className = "lightbox-close";
    close.textContent = "关闭 ×";
    const figure = document.createElement("figure");
    const picture = document.createElement("img");
    const caption = document.createElement("figcaption");
    figure.append(picture, caption);
    dialog.append(close, figure);
    document.body.append(dialog);
    let trigger = null;
    imageLinks.forEach(link => link.addEventListener("click", event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      trigger = link;
      picture.src = link.href;
      picture.alt = link.querySelector("img")?.alt || "项目图片";
      caption.textContent = link.dataset.caption || picture.alt;
      dialog.showModal();
      close.focus();
    }));
    close.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => trigger?.focus());
  }

  /* 同一时刻只播放一段项目视频，避免多段声音叠加。不开启自动播放。 */
  const videos = [...document.querySelectorAll("video")];
  videos.forEach(video => video.addEventListener("play", () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));

  /* 打印临时展开全部案例，打印结束后恢复原来状态，不改变阅读偏好。 */
  let printStates = [];
  window.addEventListener("beforeprint", () => {
    printStates = [...document.querySelectorAll(".case-detail")].map(detail => [detail, detail.open]);
    printStates.forEach(([detail]) => { detail.open = true; });
  });
  window.addEventListener("afterprint", () => {
    printStates.forEach(([detail, wasOpen]) => { detail.open = wasOpen; });
    printStates = [];
  });
})();
