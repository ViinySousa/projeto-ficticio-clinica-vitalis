/**
 * VITALIS - MAIN JS
 * Stack: Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavbarScroll();
  initMobileMenu();
  initCounters(); // <-- NOVA CHAMADA AQUI
  initTestimonialSlider(); // <-- NOVA CHAMADA AQUI
  initContactForm(); // <-- NOVA CHAMADA AQUI
});

/**
 * Função global para animar elementos ao entrarem na tela
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  
  const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/**
 * Adiciona blur e fundo na Navbar ao rolar a página
 */
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * Controla a abertura e fechamento do Menu Hamburguer no mobile
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const body = document.body;
  const navLinks = document.querySelectorAll('.nav-link');

  toggleBtn.addEventListener('click', () => {
    body.classList.toggle('menu-open');
    const isExpanded = body.classList.contains('menu-open');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Fecha o menu ao clicar em algum link interno
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      body.classList.remove('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Animação dos números na Trust Bar (Counter Animation)
 */
function initCounters() {
  const stats = document.querySelectorAll('.stat-number');
  
  // Observer exclusivo para os contadores para iniciar só quando eles aparecerem na tela
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = parseInt(target.getAttribute('data-count'));
        const prefix = target.getAttribute('data-prefix') || "";
        const suffix = target.getAttribute('data-suffix') || "";
        
        // Anima de 0 até o valor final em 1.5 segundos (1500ms)
        animateValue(target, 0, finalValue, 1500, prefix, suffix);
        observer.unobserve(target); // Garante que anime só uma vez
      }
    });
  }, { threshold: 0.5 }); // Inicia quando 50% da seção estiver visível

  stats.forEach(stat => observer.observe(stat));
}

/**
 * Função utilitária para fazer a transição suave de números
 */
function animateValue(obj, start, end, duration, prefix, suffix) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    
    // Efeito de desaceleração suave (easeOutExpo)
    const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    let current = Math.floor(easeOut * (end - start) + start);
    
    // Atualiza o texto concatenando prefixo e sufixo
    // toLocaleString() adiciona o ponto no milhar (ex: 1.200)
    obj.innerHTML = `${prefix}${current.toLocaleString('pt-BR')}${suffix}`;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

/**
 * Lógica do Slider de Depoimentos (JS Puro)
 */
function initTestimonialSlider() {
  const track = document.querySelector('.slider-track');
  const slides = Array.from(track.children);
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const dotsContainer = document.querySelector('.slider-dots');
  
  if (!track) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let maxIndex = slides.length - cardsPerView;
  let autoplayInterval;

  // Atualiza quantos cards aparecem dependendo da tela
  function getCardsPerView() {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  // Cria as bolinhas (dots)
  function createDots() {
    dotsContainer.innerHTML = '';
    maxIndex = slides.length - cardsPerView;
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
      if (i === currentIndex) dot.classList.add('active');
      
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Move o slider para o index específico
  function goToSlide(index) {
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    
    currentIndex = index;
    
    // Obtém a largura de um slide + a margem (gap) dinamicamente
    const slideWidth = slides[0].getBoundingClientRect().width;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.getPropertyValue('--gap')) || 0;
    
    // O quanto ele deve deslizar no eixo X
    const amountToMove = (slideWidth + gap) * currentIndex;
    track.style.transform = `translateX(-${amountToMove}px)`;

    // Atualiza classe dos dots
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Eventos dos botões
  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoplay();
  });

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000); // Passa a cada 5 segundos
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  // Atualiza o layout se o usuário redimensionar a janela
  window.addEventListener('resize', () => {
    const newCardsPerView = getCardsPerView();
    if (newCardsPerView !== cardsPerView) {
      cardsPerView = newCardsPerView;
      currentIndex = 0; // Volta para o início para não quebrar o layout
      createDots();
      goToSlide(0);
    } else {
      goToSlide(currentIndex); // Apenas reajusta a largura exata
    }
  });

  // Inicializa tudo
  createDots();
  startAutoplay();
}

/**
 * Lógica do Formulário de Contato e Máscara de Telefone
 */
function initContactForm() {
  const phoneInput = document.getElementById('telefone');
  const form = document.getElementById('contactForm');

  if (!phoneInput || !form) return;

  // 1. Aplica a Máscara (XX) XXXXX-XXXX enquanto o usuário digita (À prova de Backspace)
  phoneInput.addEventListener('input', function (e) {
    // Remove tudo que não for número
    let v = e.target.value.replace(/\D/g, "");
    
    // Se o usuário apagou tudo, esvazia o input
    if (v.length === 0) {
      e.target.value = "";
      return;
    }

    // Aplica a formatação via substring (impede o travamento do backspace)
    if (v.length <= 2) {
      e.target.value = '(' + v;
    } else if (v.length <= 6) {
      e.target.value = '(' + v.substring(0, 2) + ') ' + v.substring(2);
    } else if (v.length <= 10) {
      e.target.value = '(' + v.substring(0, 2) + ') ' + v.substring(2, 6) + '-' + v.substring(6);
    } else {
      // Máximo de 11 dígitos (Celular padrão brasileiro)
      e.target.value = '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7, 11);
    }
  });

  // 2. Intercepta o Submit para enviar via WhatsApp
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que a página recarregue

    // Captura os valores
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const assunto = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value;

    // Número do WhatsApp da Clínica (somente números, com código do país 55)
    const numeroClinica = "5511999999999"; 

    // Monta a mensagem que chegará no WhatsApp
    const textoMensagem = `Olá, Vitalis! Meu nome é *${nome}*.\n\n*Telefone:* ${telefone}\n*Assunto:* ${assunto}\n*Mensagem:* ${mensagem}\n\nGostaria de agendar uma avaliação.`;

    // Codifica para URL (troca espaços por %20, etc)
    const textoCodificado = encodeURIComponent(textoMensagem);

    // Abre a aba do WhatsApp
    window.open(`https://wa.me/${numeroClinica}?text=${textoCodificado}`, '_blank');
  });
}