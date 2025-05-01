const { Plugin } = require('obsidian');

module.exports = class AutoLoopVideoPlugin extends Plugin {
  onload() {
    console.log("AutoLoop Video mejorado cargado");
    this.observeVideos();
  }

  observeVideos() {
    const applySettings = () => {
      const videos = document.querySelectorAll('video');

      videos.forEach((video) => {
        if (video.parentElement.querySelector('.loop-button')) return;

        // Crear botón con ícono de loop
        const btn = document.createElement('button');
        btn.innerText = '🔁';
        btn.className = 'loop-button';
        btn.style.position = 'absolute';
        btn.style.top = '1px';
        btn.style.right = '2px';
        btn.style.zIndex = '100';
        btn.style.background = 'rgba(0, 0, 0, 0.5)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.padding = '2px 2px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.style.opacity = '0.7';
        btn.style.lineHeight = '1';
        btn.style.transition = 'opacity 0.2s ease';

        // Reacción al hover
        video.addEventListener('mouseenter', () => btn.style.opacity = '1');
        video.addEventListener('mouseleave', () => btn.style.opacity = '0.7');

        // Asegurar contenedor con posición relativa
        video.parentElement.style.position = 'relative';
        video.parentElement.appendChild(btn);

        let isLooping = false;

        const activateLoop = () => {
          video.setAttribute('autoplay', 'true');
          video.setAttribute('loop', 'true');
          video.setAttribute('muted', 'true');
          video.play().catch((e) => {
            console.warn('No se pudo reproducir el video:', e);
          });
          btn.style.background = '#4CAF50'; // Color verde para indicar "activo"
        };

        const deactivateLoop = () => {
          video.removeAttribute('loop');
          btn.style.background = 'rgba(0, 0, 0, 0.5)';
        };

        btn.addEventListener('click', () => {
          isLooping = !isLooping;
          if (isLooping) {
            activateLoop();
          } else {
            deactivateLoop();
          }
        });

        // Reanudar si vuelve a la vista
        const intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && isLooping) {
              activateLoop();
            }
          });
        });

        intersectionObserver.observe(video);
      });
    };

    applySettings();

    const observer = new MutationObserver(() => {
      applySettings();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
};
