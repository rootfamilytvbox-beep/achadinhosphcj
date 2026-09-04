/**
 * Shopee Afiliados - Interactive Application Script
 * Complete affiliate management, search, modals, and responsive interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. DATA: Configurable Products & Dynamic Loading
  // =========================================================================
  const FALLBACK_PRODUCTS = [
    {
      id: 1,
      rank: 1,
      title: "Fone de Ouvido Bluetooth",
      category: "eletronicos",
      rating: "4,9",
      reviews: "12,5k",
      price: "R$ 89,90",
      oldPrice: "R$ 129,90",
      discount: "31% OFF",
      image: "assets/images/prod-fone.jpg",
      affiliateUrl: "https://shopee.com.br?aff_id=1836460594"
    },
    {
      id: 2,
      rank: 2,
      title: "Smartwatch D20",
      category: "eletronicos",
      rating: "4,8",
      reviews: "8,2k",
      price: "R$ 59,90",
      oldPrice: "R$ 99,90",
      discount: "40% OFF",
      image: "assets/images/prod-smartwatch.jpg",
      affiliateUrl: "https://shopee.com.br?aff_id=1836460594"
    },
    {
      id: 3,
      rank: 3,
      title: "Fita LED RGB 5M",
      category: "casa",
      rating: "4,7",
      reviews: "6,1k",
      price: "R$ 29,90",
      oldPrice: "R$ 49,90",
      discount: "40% OFF",
      image: "assets/images/prod-fita-led.jpg",
      affiliateUrl: "https://shopee.com.br?aff_id=1836460594"
    },
    {
      id: 4,
      rank: 4,
      title: "Carregador Portátil 10000mAh",
      category: "eletronicos",
      rating: "4,8",
      reviews: "9,8k",
      price: "R$ 49,90",
      oldPrice: "R$ 79,90",
      discount: "37% OFF",
      image: "assets/images/prod-carregador.jpg",
      affiliateUrl: "https://shopee.com.br?aff_id=1836460594"
    },
    {
      id: 5,
      rank: 5,
      title: "Fritadeira Air Fryer 4L",
      category: "casa",
      rating: "4,9",
      reviews: "15,2k",
      price: "R$ 259,90",
      oldPrice: "R$ 399,90",
      discount: "35% OFF",
      image: "assets/images/prod-airfryer.jpg",
      affiliateUrl: "https://shopee.com.br?aff_id=1836460594"
    }
  ];

  let PRODUCTS_DATA = (window.SHOPEE_PRODUCTS && Array.isArray(window.SHOPEE_PRODUCTS) && window.SHOPEE_PRODUCTS.length > 0)
    ? [...window.SHOPEE_PRODUCTS]
    : [...FALLBACK_PRODUCTS];

  // Render products into the container
  function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = products.map((prod, index) => {
      const rank = prod.rank || (index + 1);
      const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-default';

      return `
        <div class="product-item" data-id="${prod.id}">
          <div class="rank-badge ${rankClass}">${rank}</div>
          <div class="prod-thumb">
            <img src="${prod.image}" alt="${prod.title}" loading="lazy" onerror="this.src='assets/images/prod-fone.jpg'">
          </div>
          <div class="prod-details">
            <h3 class="prod-title">${prod.title}</h3>
            <div class="prod-rating">
              <span class="star">★</span>
              <span class="rate-num">${prod.rating || '4,9'}</span>
              <span class="rate-count">(${prod.reviews || '5k'})</span>
            </div>
            <div class="prod-pricing">
              <span class="curr-price">${prod.price}</span>
              ${prod.oldPrice ? `<span class="old-price">${prod.oldPrice}</span>` : ''}
              ${prod.discount ? `<span class="off-badge">${prod.discount}</span>` : ''}
            </div>
          </div>
          <div class="prod-actions">
            <a href="${prod.affiliateUrl || 'https://shopee.com.br'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-product">
              Ver na Shopee
            </a>
            <div class="mobile-chevron">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachProductClickListeners();
    updateBotStatusBadge();
  }

  function attachProductClickListeners() {
    const productButtons = document.querySelectorAll('.btn-product, .product-item');
    productButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          const current = parseInt(localStorage.getItem('shopee_site_clicks') || '0', 10);
          localStorage.setItem('shopee_site_clicks', (current + 1).toString());
        } catch (e) {}
      });
    });
  }

  function updateBotStatusBadge() {
    const statusEl = document.getElementById('botStatusText');
    if (!statusEl) return;
    const timeStr = window.SHOPEE_LAST_UPDATE || (PRODUCTS_DATA[0] && PRODUCTS_DATA[0].updatedAt);
    if (timeStr) {
      statusEl.textContent = `Robô Shopee Ativo • Atualizado ${timeStr} • 70% OFF`;
    }
  }

  // Fetch products from data/products.json or local script
  async function loadProducts() {
    if (window.SHOPEE_PRODUCTS && Array.isArray(window.SHOPEE_PRODUCTS) && window.SHOPEE_PRODUCTS.length > 0) {
      PRODUCTS_DATA = window.SHOPEE_PRODUCTS;
      renderProducts(PRODUCTS_DATA);
    }
    try {
      const res = await fetch('data/products.json?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          PRODUCTS_DATA = data;
          renderProducts(PRODUCTS_DATA);
          return;
        }
      }
    } catch (e) {
      // Quando aberto como arquivo local (file:///), o browser bloqueia fetch por CORS,
      // mas usa perfeitamente os dados de window.SHOPEE_PRODUCTS
    }
    renderProducts(PRODUCTS_DATA);
  }

  loadProducts();

  // Atualiza os produtos no site automaticamente se novas ofertas entrarem
  setInterval(loadProducts, 60000); // Checa a cada 1 minuto se há novidades
  window.addEventListener('focus', loadProducts); // Recarrega se o usuário voltar para a aba

  // =========================================================================
  // 2. DOM Elements Selection
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const searchInput = document.getElementById('searchInput');
  const mobileSearchTrigger = document.getElementById('mobileSearchTrigger');
  const mobileSearchBar = document.getElementById('mobileSearchBar');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  const themeToggle = document.getElementById('themeToggle');
  const productsContainer = document.getElementById('productsContainer');
  const categoryCards = document.querySelectorAll('.category-card');
  const catNextBtn = document.getElementById('catNextBtn');
  const categoriesContainer = document.getElementById('categoriesContainer');

  const couponsModal = document.getElementById('couponsModal');
  const closeCouponsModal = document.getElementById('closeCouponsModal');
  const viewCouponsBtn = document.getElementById('viewCouponsBtn');
  const navCupons = document.getElementById('navCupons');
  const drawerCupons = document.getElementById('drawerCupons');
  const bottomCuponsTab = document.getElementById('bottomCuponsTab');

  const howItWorksModal = document.getElementById('howItWorksModal');
  const openHowItWorksBtn = document.getElementById('openHowItWorksBtn');
  const closeHowItWorksModal = document.getElementById('closeHowItWorksModal');
  const closeHowModalBtn = document.getElementById('closeHowModalBtn');
  const navComoFunciona = document.getElementById('navComoFunciona');
  const drawerComoFunciona = document.getElementById('drawerComoFunciona');
  const footerComoFunciona = document.getElementById('footerComoFunciona');

  const newsletterForm = document.getElementById('newsletterForm');
  const toast = document.getElementById('toast');
  const bottomTabs = document.querySelectorAll('.bottom-tab-item');

  // =========================================================================
  // 3. Mobile Navigation Drawer
  // =========================================================================
  function openDrawer() {
    mobileDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      drawerLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // =========================================================================
  // 4. Mobile Search Bar Toggle
  // =========================================================================
  if (mobileSearchTrigger) {
    mobileSearchTrigger.addEventListener('click', () => {
      mobileSearchBar.classList.toggle('active');
      if (mobileSearchBar.classList.contains('active')) {
        mobileSearchInput.focus();
      }
    });
  }

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', () => {
      mobileSearchBar.classList.remove('active');
      filterProducts('');
    });
  }

  // =========================================================================
  // 5. Real-time Product Search Filter
  // =========================================================================
  function filterProducts(query) {
    const cleanQuery = query.toLowerCase().trim();
    const productItems = document.querySelectorAll('.product-item');

    productItems.forEach(item => {
      const title = item.querySelector('.prod-title').textContent.toLowerCase();
      if (cleanQuery === '' || title.includes(cleanQuery)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterProducts(e.target.value));
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', (e) => filterProducts(e.target.value));
  }

  // =========================================================================
  // 6. Category Filtering & Carousel Scrolling
  // =========================================================================
  let selectedCategory = null;

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-cat');
      
      if (selectedCategory === cat) {
        // Unselect
        selectedCategory = null;
        categoryCards.forEach(c => c.style.borderColor = '');
        filterProducts('');
        showToast('Mostrando todas as categorias');
      } else {
        selectedCategory = cat;
        categoryCards.forEach(c => c.style.borderColor = '');
        card.style.borderColor = 'var(--shopee-orange)';
        
        // Filter products matching category
        const productItems = document.querySelectorAll('.product-item');
        let matched = 0;
        productItems.forEach(item => {
          const prodId = parseInt(item.getAttribute('data-id'), 10);
          const prodData = PRODUCTS_DATA.find(p => p.id === prodId);
          if (prodData && prodData.category === cat) {
            item.style.display = '';
            matched++;
          } else {
            item.style.display = 'none';
          }
        });

        // Scroll to products section
        const maisVendidos = document.getElementById('mais-vendidos');
        if (maisVendidos) maisVendidos.scrollIntoView({ behavior: 'smooth' });

        showToast(`Filtrado por: ${card.querySelector('.cat-name').textContent}`);
      }
    });
  });

  if (catNextBtn && categoriesContainer) {
    catNextBtn.addEventListener('click', () => {
      categoriesContainer.scrollBy({ left: 240, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 7. Product Click (Desktop & Mobile Click Handling)
  // =========================================================================
  function attachProductClickListeners() {
    const items = document.querySelectorAll('.product-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          const prodId = parseInt(item.getAttribute('data-id'), 10);
          const prodData = PRODUCTS_DATA.find(p => p.id === prodId);
          if (prodData && prodData.affiliateUrl) {
            window.open(prodData.affiliateUrl, '_blank', 'noopener,noreferrer');
          }
        }
      });
    });
  }

  // =========================================================================
  // 8. Modals Logic (Cupons & Como Funciona)
  // =========================================================================
  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Open Coupons Modal triggers
  const couponTriggers = [viewCouponsBtn, navCupons, drawerCupons, bottomCuponsTab];
  couponTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(couponsModal);
      });
    }
  });

  if (closeCouponsModal) {
    closeCouponsModal.addEventListener('click', () => closeModal(couponsModal));
  }
  if (couponsModal) {
    couponsModal.addEventListener('click', (e) => {
      if (e.target === couponsModal) closeModal(couponsModal);
    });
  }

  // Open How It Works Modal triggers
  const howTriggers = [openHowItWorksBtn, navComoFunciona, drawerComoFunciona, footerComoFunciona];
  howTriggers.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(howItWorksModal);
      });
    }
  });

  if (closeHowItWorksModal) closeHowItWorksModal.addEventListener('click', () => closeModal(howItWorksModal));
  if (closeHowModalBtn) closeHowModalBtn.addEventListener('click', () => closeModal(howItWorksModal));
  if (howItWorksModal) {
    howItWorksModal.addEventListener('click', (e) => {
      if (e.target === howItWorksModal) closeModal(howItWorksModal);
    });
  }

  // Copy Coupon Code
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = btn.getAttribute('data-code');
      try {
        await navigator.clipboard.writeText(code);
        const originalText = btn.textContent;
        btn.textContent = 'Copiado! ✓';
        btn.style.backgroundColor = '#10b981';
        showToast(`Cupom ${code} copiado! Use na finalização.`);

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = '';
        }, 2500);
      } catch (err) {
        showToast(`Cupom: ${code}`);
      }
    });
  });

  // =========================================================================
  // 9. Toast Notification Helper
  // =========================================================================
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;

    toast.classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3200);
  }

  // =========================================================================
  // 10. Newsletter Form Submission
  // =========================================================================
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('emailInput');
      if (emailInput && emailInput.value) {
        showToast('E-mail cadastrado! Você receberá as melhores ofertas Shopee.');
        emailInput.value = '';
      }
    });
  }

  // =========================================================================
  // 11. Theme Mode Toggle (Dark / Light)
  // =========================================================================
  const savedTheme = localStorage.getItem('shopee_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('shopee_theme', isLight ? 'light' : 'dark');
      showToast(isLight ? 'Modo Claro ativado' : 'Modo Escuro ativado');
    });
  }

  // =========================================================================
  // 12. Mobile Bottom Navigation Active Tab State
  // =========================================================================
  bottomTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      bottomTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Active navigation highlight on scroll
  const sections = document.querySelectorAll('section[id], main[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  window.addEventListener('scroll', () => {
    let currentSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

});
