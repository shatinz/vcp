/**
 * VCP Drawing Layer (V2 Vector Canvas Architecture)
 * Provides an isolated SVG layer inside the Shadow DOM for annotations,
 * freehand drawing, arrows, and shapes.
 */
(function () {
  class VcpDrawingLayer {
    constructor(shadowRoot) {
      this.shadowRoot = shadowRoot;
      this.svg = null;
      this.shapesGroup = null;
      this.activePath = null;
      this.currentTool = 'none'; // 'none', 'pen', 'rect', 'arrow'
      this.isDrawing = false;
      this.currentPoints = [];
      this.initSvg();
    }

    initSvg() {
      if (this.shadowRoot.querySelector('#vcp-drawing-canvas')) return;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'vcp-drawing-canvas';
      svg.setAttribute('style', `
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 10;
        overflow: visible;
      `);

      // Add defs for markers (arrows)
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'vcp-arrowhead');
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '5');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');

      const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      markerPath.setAttribute('fill', '#ef4444');
      marker.appendChild(markerPath);
      defs.appendChild(marker);
      svg.appendChild(defs);

      const shapesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      shapesGroup.id = 'vcp-shapes-group';
      svg.appendChild(shapesGroup);

      this.svg = svg;
      this.shapesGroup = shapesGroup;
      this.shadowRoot.appendChild(svg);
    }

    setTool(toolName) {
      this.currentTool = toolName;
      if (toolName === 'none') {
        this.svg.style.pointerEvents = 'none';
      } else {
        this.svg.style.pointerEvents = 'auto';
      }
    }

    clear() {
      if (this.shapesGroup) {
        while (this.shapesGroup.firstChild) {
          this.shapesGroup.removeChild(this.shapesGroup.firstChild);
        }
      }
    }

    getExportData() {
      return {
        shapesCount: this.shapesGroup ? this.shapesGroup.children.length : 0,
        svgContent: this.shapesGroup ? this.shapesGroup.innerHTML : ''
      };
    }
  }

  window.VcpDrawingLayer = VcpDrawingLayer;
})();
