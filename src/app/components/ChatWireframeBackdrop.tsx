import { useEffect, useRef } from 'react';
import { getWireLayers, getWirePose, projectWirePoint, WIRE_MODELS } from './chat-wireframe-geometry';

/** Decorative geometry; scrolling is the only animation clock. */
export default function ChatWireframeBackdrop({ industryIndex, reducedMotion }: {
  industryIndex?: number; reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frameElement = canvas?.parentElement;
    const section = canvas?.closest<HTMLElement>('.chat-demo');
    const scene = canvas?.closest<HTMLElement>('.chat-demo-flow-scene');
    if (!canvas || !frameElement || !section) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let visible = false;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const render = () => {
      frame = 0;
      if (!visible || document.hidden || !width || !height) return;
      const position = industryIndex === undefined
        ? Math.max(0, -section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - window.innerHeight)) * WIRE_MODELS.length
        : 0;
      const flowPhase = scene
        ? (window.innerHeight - scene.getBoundingClientRect().top) / (window.innerHeight + scene.offsetHeight)
        : 0;
      const layers = industryIndex === undefined
        ? getWireLayers(position)
        : [{ index: industryIndex, phase: reducedMotion ? .25 : flowPhase, opacity: 1 }];
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1.05;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      for (const layer of layers) {
        const model = WIRE_MODELS[layer.index];
        const pose = getWirePose(layer.phase);
        context.strokeStyle = model.color;
        for (const path of model.paths) {
          const points = path.map(point => projectWirePoint(point, pose, model, width, height));
          const depth = points.reduce((sum, point) => sum + point[2], 0) / points.length;
          // Rear lines stay visible, but lighter, to make the open mesh read in 3D.
          context.globalAlpha = layer.opacity * (.078 - Math.max(-2, Math.min(2, depth)) * .012);
          context.beginPath();
          points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
          context.stroke();
        }
      }
      canvas.dataset.wireframeModels = layers.map(layer => WIRE_MODELS[layer.index].name).join(' ');
      canvas.dataset.wireframePhase = (industryIndex === undefined ? position : flowPhase).toFixed(3);
    };

    const schedule = () => { if (visible && !frame && !document.hidden) frame = requestAnimationFrame(render); };
    const resize = () => {
      width = frameElement.clientWidth;
      height = frameElement.clientHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      schedule();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frameElement);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else { cancelAnimationFrame(frame); frame = 0; }
    }, { rootMargin: '80px' });
    visibilityObserver.observe(frameElement);
    if (!reducedMotion) window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', schedule);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [industryIndex, reducedMotion]);

  return <div className="chat-demo-wireframe" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
