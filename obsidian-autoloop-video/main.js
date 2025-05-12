const { Plugin } = require('obsidian');

module.exports = class AutoLoopVideoPlugin extends Plugin {
  async onload() {
    console.log("AutoLoop Video mejorado cargado");
    
    // Cargar datos guardados
    this.settings = await this.loadData() || { loopingVideos: {} };
    
    this.observeVideos();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  observeVideos() {
    const applySettings = () => {
      const videos = document.querySelectorAll('video');

      videos.forEach((video) => {
        if (video.parentElement.querySelector('.loop-button')) return;

        // Crear identificador único para el video
        const videoSrc = video.getAttribute('src') || '';
        const videoParentPath = this.getAncestorPath(video, 5); // Usamos la ruta del DOM para ayudar a identificar el video
        const videoId = `${videoSrc}-${videoParentPath}`;
        
        // Marcar el video con un atributo data-video-id para identificarlo después
        video.setAttribute('data-video-id', videoId);

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

        // Comprobar si este video estaba en bucle previamente
        let isLooping = !!this.settings.loopingVideos[videoId];

        // Si el video debería estar en bucle, aplicar esa configuración inmediatamente
        if (isLooping) {
          this.activateLoop(video, btn);
        }

        btn.addEventListener('click', () => {
          isLooping = !isLooping;
          
          if (isLooping) {
            this.activateLoop(video, btn);
            // Guardar estado
            this.settings.loopingVideos[videoId] = true;
          } else {
            this.deactivateLoop(video, btn);
            // Eliminar del estado guardado
            delete this.settings.loopingVideos[videoId];
          }
          
          this.saveSettings();
        });

        // Reanudar si vuelve a la vista
        const intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && this.settings.loopingVideos[videoId]) {
              this.activateLoop(video, btn);
            }
          });
        });

        intersectionObserver.observe(video);
      });
    };

    // Función para activar el loop
    this.activateLoop = (video, btn) => {
      video.setAttribute('autoplay', 'true');
      video.setAttribute('loop', 'true');
      video.setAttribute('muted', 'true');
      video.play().catch((e) => {
        console.warn('No se pudo reproducir el video:', e);
      });
      btn.style.background = '#4CAF50'; // Color verde para indicar "activo"
    };

    // Función para desactivar el loop
    this.deactivateLoop = (video, btn) => {
      video.removeAttribute('loop');
      btn.style.background = 'rgba(0, 0, 0, 0.5)';
    };

    // Función para obtener una ruta del DOM única
    this.getAncestorPath = (element, depth) => {
      let path = '';
      let current = element;
      let count = 0;
      
      while (current && count < depth) {
        const tagName = current.tagName || '';
        const id = current.id ? `#${current.id}` : '';
        const classList = Array.from(current.classList || []).map(c => `.${c}`).join('');
        
        path = `${tagName}${id}${classList}` + (path ? '>' + path : '');
        current = current.parentElement;
        count++;
      }
      
      return path;
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

  onunload() {
    console.log("AutoLoop Video plugin desactivado");
    // Guardar configuración al descargar
    this.saveSettings();
  }
}
