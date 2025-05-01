const { Plugin } = require('obsidian');

module.exports = class AutoLoopVideoPlugin extends Plugin {
  onload() {
    console.log("AutoLoop Video con toggle y visibilidad activado");
    this.observeVideos();
  }

  observeVideos() {
    const applySettings = () => {
      const videos = document.querySelectorAll('video');

      videos.forEach((video) => {
        if (video.parentElement.querySelector('.loop-button')) return;

        // Crear el botón
        const btn = document.createElement('button');
        btn.innerText = '🔁';
        btn.className = 'loop-button';
        btn.style.position = 'absolute';
        btn.style.top = '5px';
        btn.style.right = '5px';
        btn.style.zIndex = '10';
        btn.style.background = '#333';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.padding = '3px 6px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';
        btn.style.opacity = '0.8';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        const parent = video.parentElement;
        parent.insertBefore(wrapper, video);
        wrapper.appendChild(video);
        wrapper.appendChild(btn);

        let isLooping = false;

        const activateLoop = () => {
          video.setAttribute('autoplay', 'true');
          video.setAttribute('loop', 'true');
          video.setAttribute('muted', 'true');
          video.play().catch((e) => {
            console.warn('No se pudo reproducir el video:', e);
          });
          btn.style.background = '#4CAF50';
        };

        const deactivateLoop = () => {
          video.removeAttribute('loop');
          btn.style.background = '#333';
        };

        btn.addEventListener('click', () => {
          isLooping = !isLooping;
          if (isLooping) {
            activateLoop();
          } else {
            deactivateLoop();
          }
        });

        // Observer para visibilidad del video
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
