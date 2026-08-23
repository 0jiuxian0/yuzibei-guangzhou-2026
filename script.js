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

function loadHtml2Canvas() {
  if (window.html2canvas) {
    return Promise.resolve(window.html2canvas);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;
    script.onload = () => resolve(window.html2canvas);
    script.onerror = () => reject(new Error('html2canvas load failed'));
    document.head.appendChild(script);
  });
}

async function exportHeroImage() {
  const target = document.querySelector('.hero');
  if (!target) return;

  const buttons = document.querySelectorAll('.btn-export-image');
  buttons.forEach((btn) => {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.textContent = '生成中…';
  });

  try {
    const html2canvas = await loadHtml2Canvas();
    const canvas = await html2canvas(target, {
      backgroundColor: '#0f1419',
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = 'yuzibei-guangzhou-2026.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showShareToast('海报已保存到相册/下载文件夹');
  } catch {
    showShareToast('导出失败，请稍后重试');
  } finally {
    buttons.forEach((btn) => {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || '导出图片';
      delete btn.dataset.originalText;
    });
  }
}

document.querySelectorAll('.btn-export-image').forEach((btn) => {
  btn.addEventListener('click', exportHeroImage);
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
