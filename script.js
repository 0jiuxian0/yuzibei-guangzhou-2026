document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const header = document.querySelector('.site-header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > 80) {
    header.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
  } else {
    header.style.boxShadow = 'none';
  }
  lastScroll = current;
}, { passive: true });

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

const shareToast = document.getElementById('share-toast');
let shareToastTimer;

function showShareToast(message) {
  if (!shareToast) return;
  shareToast.textContent = message;
  shareToast.hidden = false;
  shareToast.classList.add('is-visible');
  clearTimeout(shareToastTimer);
  shareToastTimer = setTimeout(() => {
    shareToast.classList.remove('is-visible');
    setTimeout(() => {
      shareToast.hidden = true;
    }, 250);
  }, 2600);
}

const SHARE_TITLE = '于梓贝「夏日出逃之必要」广州站';
const SHARE_TEXT = '8/29 中大店 · 8/30 太古仓加场 · 购票、观演指南与歌单';

async function shareSite() {
  const url = window.location.href;
  const isLocalFile = window.location.protocol === 'file:';

  if (navigator.share && !isLocalFile) {
    try {
      await navigator.share({
        title: SHARE_TITLE,
        text: SHARE_TEXT,
        url,
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }

  try {
    await copyText(isLocalFile ? `${SHARE_TITLE}\n${SHARE_TEXT}` : url);
    showShareToast(isLocalFile ? '本地预览无法生成链接，已复制简介' : '链接已复制，快去分享吧');
  } catch {
    showShareToast('复制失败，请手动复制地址栏链接');
  }
}

document.querySelectorAll('.btn-share-site').forEach((btn) => {
  btn.addEventListener('click', shareSite);
});

document.querySelectorAll('.btn-copy-address').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    if (!text) return;

    try {
      await copyText(text);
      const original = btn.textContent;
      btn.textContent = '已复制';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      btn.textContent = '复制失败';
      setTimeout(() => {
        btn.textContent = '复制';
      }, 2000);
    }
  });
});

const lightbox = document.getElementById('image-lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-img');
const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
let lightboxTrigger = null;

function openLightbox(src, alt, caption) {
  if (!lightbox || !lightboxImg || !lightboxCaption) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxCaption.textContent = caption;
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close')?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImg || !lightboxCaption) return;
  lightbox.hidden = true;
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.removeAttribute('src');
  lightboxCaption.textContent = '';
  document.body.style.overflow = '';
  lightboxTrigger?.focus();
  lightboxTrigger = null;
}

document.querySelectorAll('.guide-image-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const img = btn.querySelector('img');
    if (!img) return;
    lightboxTrigger = btn;
    openLightbox(img.src, img.alt, btn.dataset.caption || img.alt);
  });
});

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
    closeLightbox();
  }
});
