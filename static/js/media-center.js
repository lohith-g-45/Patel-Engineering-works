(function () {
  const PLACEHOLDER_IMAGE = '/static/images/media-placeholder.svg';

  const featuredContainer = document.getElementById('featuredArticleContainer');
  const recentNewsViewport = document.getElementById('recentNewsViewport');
  const galleryViewport = document.getElementById('galleryViewport');
  const videoViewport = document.getElementById('videoViewport');

  const mediaAdminShell = document.getElementById('mediaAdminShell');
  const mediaAdminMessage = document.getElementById('mediaAdminMessage');
  const mediaAdminLoggedIn = document.getElementById('mediaAdminLoggedIn');
  const mediaAdminWelcome = document.getElementById('mediaAdminWelcome');

  const mediaLogoutButton = document.getElementById('mediaLogoutButton');

  const mediaArticleForm = document.getElementById('mediaArticleForm');
  const mediaArticleId = document.getElementById('mediaArticleId');
  const mediaArticleTitle = document.getElementById('mediaArticleTitle');
  const mediaArticleCategory = document.getElementById('mediaArticleCategory');
  const mediaArticleImage = document.getElementById('mediaArticleImage');
  const mediaArticleContent = document.getElementById('mediaArticleContent');
  const mediaArticleReset = document.getElementById('mediaArticleReset');

  const mediaGalleryForm = document.getElementById('mediaGalleryForm');
  const mediaVideoForm = document.getElementById('mediaVideoForm');

  const modal = document.getElementById('articleModal');
  const modalClose = modal ? modal.querySelector('.article-modal-close') : null;
  const modalTitle = document.getElementById('articleModalTitle');
  const modalMeta = document.getElementById('articleModalMeta');
  const modalBody = document.getElementById('articleModalBody');

  const articleMap = new Map();
  const imageMap = new Map();
  const videoMap = new Map();

  let isAdmin = false;
  let authUsername = '';

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    wireAdminForms();
    bindDynamicModal();
    bindDynamicActions();

    showLoading(featuredContainer, 'Loading featured story...');
    showLoading(recentNewsViewport, 'Loading recent posts...');
    showLoading(galleryViewport, 'Loading gallery...');
    showLoading(videoViewport, 'Loading videos...');

    await checkAuth();
    await loadAndRenderMedia();
  }

  function wireAdminForms() {
    if (mediaLogoutButton) {
      mediaLogoutButton.addEventListener('click', handleAdminLogout);
    }

    if (mediaArticleForm) {
      mediaArticleForm.addEventListener('submit', handleArticleSave);
    }
    if (mediaArticleReset) {
      mediaArticleReset.addEventListener('click', resetArticleForm);
    }
    if (mediaGalleryForm) {
      mediaGalleryForm.addEventListener('submit', handleGallerySave);
    }
    if (mediaVideoForm) {
      mediaVideoForm.addEventListener('submit', handleVideoSave);
    }
  }

  async function checkAuth() {
    try {
      const response = await fetch('/auth/status');
      const data = await response.json();
      isAdmin = Boolean(data.authenticated);
      authUsername = data.username || '';
      renderAdminState();
    } catch (_error) {
      isAdmin = false;
      authUsername = '';
      renderAdminState();
      notify('Unable to check admin session.', 'error');
    }
  }

  function renderAdminState() {
    if (isAdmin) {
      mediaAdminShell.classList.remove('hidden');
      mediaAdminLoggedIn.classList.remove('hidden');
      mediaAdminWelcome.textContent = `Editing as ${authUsername || 'admin'}`;
      mediaAdminShell.classList.add('media-admin-active');
    } else {
      mediaAdminShell.classList.add('hidden');
      mediaAdminLoggedIn.classList.add('hidden');
      mediaAdminWelcome.textContent = '';
      mediaAdminShell.classList.remove('media-admin-active');
      resetArticleForm();
    }
  }

  async function handleAdminLogout() {
    await fetch('/logout');
    isAdmin = false;
    authUsername = '';
    renderAdminState();
    notify('Admin mode disabled.', 'success');
    await loadAndRenderMedia();
  }

  async function loadAndRenderMedia() {
    try {
      const [newsData, blogData, imagesData, videosData] = await Promise.all([
        fetchJson('/articles?category=news&per_page=30'),
        fetchJson('/articles?category=blog&per_page=30'),
        fetchJson('/images'),
        fetchJson('/videos'),
      ]);

      const allArticles = [...(newsData.items || []), ...(blogData.items || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const featured = allArticles[0] || null;
      const recentNews = allArticles.slice(1, 13);

      renderFeatured(featured);
      renderRecentNews(recentNews, featured);
      renderGallery(imagesData || []);
      renderVideos(videosData || []);

      if (typeof initializeMediaCarousels === 'function') {
        initializeMediaCarousels();
      }
      if (typeof initializeLightbox === 'function') {
        initializeLightbox();
      }
    } catch (error) {
      renderErrorState();
      notify('Could not load media content.', 'error');
      console.error('Media load failed:', error);
    }
  }

  async function fetchJson(url) {
    const connector = url.includes('?') ? '&' : '?';
    const response = await fetch(`${url}${connector}_ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${url}`);
    }
    return response.json();
  }

  function renderFeatured(article) {
    if (!article) {
      featuredContainer.innerHTML = '<p class="media-empty">No featured story available yet.</p>';
      return;
    }

    articleMap.set(article.id, article);
    featuredContainer.innerHTML = `
      <article class="card feature-card news-feature-main">
        <img src="${article.image_url || PLACEHOLDER_IMAGE}" alt="${escapeHtml(article.title)}" class="card-image" data-expand-image style="height: 400px; object-fit: cover;">
        <div class="card-content">
          <span class="badge ${article.category === 'news' ? 'badge-warning' : 'badge-success'}">${escapeHtml(article.category)}</span>
          <h3 class="card-title">${escapeHtml(article.title)}</h3>
          <p class="card-text">${escapeHtml(truncate(stripHtml(article.content), 280))}</p>
          <div class="card-footer media-post-actions">
            <a href="#" class="btn btn-primary" data-article-open="${article.id}">Read</a>
            ${isAdmin ? `
              <button class="btn btn-secondary" type="button" data-article-edit="${article.id}">Edit</button>
              <button class="btn btn-danger" type="button" data-article-delete="${article.id}">Delete</button>
            ` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function renderRecentNews(articles, featuredArticle) {
    const fallbackSet = featuredArticle ? [featuredArticle] : [];
    const finalArticles = articles.length ? articles : fallbackSet;

    if (!finalArticles.length) {
      recentNewsViewport.innerHTML = '<p class="media-empty">No recent articles published yet.</p>';
      return;
    }

    recentNewsViewport.innerHTML = finalArticles.map((article) => {
      articleMap.set(article.id, article);
      return `
        <article class="card feature-card carousel-slide" data-title="${escapeHtml(article.title)}">
          <img src="${article.image_url || PLACEHOLDER_IMAGE}" alt="${escapeHtml(article.title)}" class="card-image" data-expand-image>
          <div class="card-content">
            <span class="badge ${article.category === 'news' ? 'badge-warning' : 'badge-success'}">${formatDate(article.created_at)}</span>
            <h4 class="card-title">${escapeHtml(article.title)}</h4>
            <p class="card-text">${escapeHtml(truncate(stripHtml(article.content), 170))}</p>
            <div class="card-footer media-post-actions">
              <a href="#" class="text-primary" data-article-open="${article.id}">Open</a>
              ${isAdmin ? `
                <button class="btn btn-secondary" type="button" data-article-edit="${article.id}">Edit</button>
                <button class="btn btn-danger" type="button" data-article-delete="${article.id}">Delete</button>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderGallery(images) {
    imageMap.clear();
    if (!images.length) {
      galleryViewport.innerHTML = '<p class="media-empty">No gallery images uploaded yet.</p>';
      return;
    }

    galleryViewport.innerHTML = images.slice(0, 18).map((image, index) => {
      imageMap.set(image.id, image);
      return `
        <article class="card feature-card carousel-slide" data-title="${escapeHtml(image.title)}">
          <img src="${image.image_url}" alt="${escapeHtml(image.title)}" class="card-image" data-expand-image data-lightbox="gallery" loading="lazy" data-lightbox-index="${index}">
          ${isAdmin ? `<div class="media-card-admin-actions"><button class="btn btn-danger" type="button" data-image-delete="${image.id}">Delete</button></div>` : ''}
        </article>
      `;
    }).join('');
  }

  function renderVideos(videos) {
    videoMap.clear();
    if (!videos.length) {
      videoViewport.innerHTML = '<p class="media-empty">No videos available yet.</p>';
      return;
    }

    videoViewport.innerHTML = videos.slice(0, 12).map((video) => {
      videoMap.set(video.id, video);
      return `
        <article class="card feature-card carousel-slide" data-title="${escapeHtml(video.title)}">
          <div class="video-frame">
            <iframe
              src="${video.embed_url}"
              title="${escapeHtml(video.title)}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
          <div class="card-content">
            <h4 class="card-title">${escapeHtml(video.title)}</h4>
            <div class="card-footer media-post-actions">
              ${isAdmin ? `<button class="btn btn-danger" type="button" data-video-delete="${video.id}">Delete</button>` : '<span class="text-muted">Media Center Video</span>'}
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function bindDynamicActions() {
    document.body.addEventListener('click', async (event) => {
      const editArticleButton = event.target.closest('[data-article-edit]');
      if (editArticleButton) {
        const articleId = Number(editArticleButton.dataset.articleEdit);
        startArticleEdit(articleId);
        return;
      }

      const deleteArticleButton = event.target.closest('[data-article-delete]');
      if (deleteArticleButton) {
        const articleId = Number(deleteArticleButton.dataset.articleDelete);
        await deleteArticle(articleId);
        return;
      }

      const deleteImageButton = event.target.closest('[data-image-delete]');
      if (deleteImageButton) {
        const imageId = Number(deleteImageButton.dataset.imageDelete);
        await deleteImage(imageId);
        return;
      }

      const deleteVideoButton = event.target.closest('[data-video-delete]');
      if (deleteVideoButton) {
        const videoId = Number(deleteVideoButton.dataset.videoDelete);
        await deleteVideo(videoId);
      }
    });
  }

  async function handleArticleSave(event) {
    event.preventDefault();
    if (!isAdmin) {
      notify('Login required for editing.', 'error');
      return;
    }

    const formSnapshot = new FormData(mediaArticleForm);
    const titleFromInput = mediaArticleTitle ? mediaArticleTitle.value : '';
    const titleFromForm = formSnapshot.get('title');
    const title = String(titleFromInput || titleFromForm || '').trim();
    const category = mediaArticleCategory.value.trim().toLowerCase();
    const content = mediaArticleContent.value.trim();

    if (!title) {
      notify('Article title field is empty. Please type a title in Create / Edit Post.', 'error');
      mediaArticleTitle.focus();
      return;
    }

    if (!content) {
      notify('Content is required.', 'error');
      mediaArticleContent.focus();
      return;
    }

    if (!['news', 'blog'].includes(category)) {
      notify('Category must be news or blog.', 'error');
      return;
    }

    const articleId = mediaArticleId.value.trim();
    const isEditing = Boolean(articleId);
    const endpoint = isEditing ? `/articles/${articleId}` : '/articles';
    const method = isEditing ? 'PUT' : 'POST';

    const payload = buildArticlePayload(title, category, content);

    try {
      let response = await fetch(endpoint, {
        method,
        body: payload,
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      let data = await response.json();

      // Defensive fallback for edge cases where a browser extension/autofill mutates the request payload.
      if (!response.ok && data && data.error === 'Title is required') {
        const fallbackTitle = String(formSnapshot.get('title') || '').trim();
        if (fallbackTitle) {
          response = await fetch(endpoint, {
            method,
            body: buildArticlePayload(fallbackTitle, category, content),
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          data = await response.json();
        }
      }

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save post');
      }

      const savedTitle = data && data.title ? data.title : title;
      notify(isEditing ? `Post updated: ${savedTitle}` : `Post published: ${savedTitle}`, 'success');
      resetArticleForm();
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function buildArticlePayload(title, category, content) {
    const payload = new FormData();
    payload.set('title', title);
    payload.set('category', category);
    payload.set('content', content);

    const imageFile = mediaArticleImage && mediaArticleImage.files ? mediaArticleImage.files[0] : null;
    if (imageFile) {
      payload.set('image', imageFile);
    }

    return payload;
  }

  function startArticleEdit(articleId) {
    if (!isAdmin) return;
    const article = articleMap.get(articleId);
    if (!article) return;

    mediaArticleId.value = String(article.id);
    mediaArticleTitle.value = article.title;
    mediaArticleCategory.value = article.category;
    mediaArticleContent.value = stripHtml(article.content);

    mediaAdminShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    notify(`Editing: ${article.title}`, 'success');
  }

  function resetArticleForm() {
    mediaArticleForm.reset();
    mediaArticleId.value = '';
  }

  async function deleteArticle(articleId) {
    if (!isAdmin) return;
    if (!window.confirm('Delete this post?')) return;

    try {
      const response = await fetch(`/articles/${articleId}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete post');
      }

      notify('Post deleted.', 'success');
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function handleGallerySave(event) {
    event.preventDefault();
    if (!isAdmin) {
      notify('Login required for editing.', 'error');
      return;
    }

    try {
      const response = await fetch('/images', {
        method: 'POST',
        body: new FormData(mediaGalleryForm),
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to upload image');
      }

      mediaGalleryForm.reset();
      notify('Gallery image uploaded.', 'success');
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function deleteImage(imageId) {
    if (!isAdmin) return;
    if (!window.confirm('Delete this image?')) return;

    try {
      const response = await fetch(`/images/${imageId}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete image');
      }

      notify('Image deleted.', 'success');
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function handleVideoSave(event) {
    event.preventDefault();
    if (!isAdmin) {
      notify('Login required for editing.', 'error');
      return;
    }

    const payload = Object.fromEntries(new FormData(mediaVideoForm).entries());

    try {
      const response = await fetch('/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to add video');
      }

      mediaVideoForm.reset();
      notify('Video added.', 'success');
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  async function deleteVideo(videoId) {
    if (!isAdmin) return;
    if (!window.confirm('Delete this video?')) return;

    try {
      const response = await fetch(`/videos/${videoId}`, {
        method: 'DELETE',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete video');
      }

      notify('Video deleted.', 'success');
      await loadAndRenderMedia();
    } catch (error) {
      notify(error.message, 'error');
    }
  }

  function bindDynamicModal() {
    document.body.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-article-open]');
      if (!trigger) return;
      event.preventDefault();

      const articleId = Number(trigger.getAttribute('data-article-open'));
      const article = articleMap.get(articleId);
      if (!article || !modal) return;

      modalTitle.textContent = article.title;
      modalMeta.textContent = `${formatDate(article.created_at)} | ${article.category.toUpperCase()}`;
      modalBody.innerHTML = article.content;

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  function renderErrorState() {
    featuredContainer.innerHTML = '<p class="media-empty">Unable to load media content right now.</p>';
    recentNewsViewport.innerHTML = '<p class="media-empty">Unable to load recent posts.</p>';
    galleryViewport.innerHTML = '<p class="media-empty">Unable to load gallery.</p>';
    videoViewport.innerHTML = '<p class="media-empty">Unable to load videos.</p>';
  }

  function showLoading(container, message) {
    container.innerHTML = `<p class="media-loading">${escapeHtml(message)}</p>`;
  }

  function notify(message, type) {
    mediaAdminMessage.textContent = message;
    mediaAdminMessage.classList.remove('hidden', 'success-message', 'error-message');
    mediaAdminMessage.classList.add(type === 'error' ? 'error-message' : 'success-message');

    window.clearTimeout(notify.timeoutId);
    notify.timeoutId = window.setTimeout(() => {
      mediaAdminMessage.classList.add('hidden');
      mediaAdminMessage.classList.remove('success-message', 'error-message');
    }, 4500);
  }

  function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  }

  function stripHtml(value) {
    const parser = new DOMParser();
    const parsed = parser.parseFromString(value || '', 'text/html');
    return parsed.body.textContent || '';
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recent';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
