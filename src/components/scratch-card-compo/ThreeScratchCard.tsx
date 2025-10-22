/**
 * ThreeScratchCard Component
 * Full interactive scratch card with Three.js rendering and canvas masking
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ThreeScratchCardProps, ScratchPoint, ScratchState } from './types';
import {
  calculateScratchPercentage,
  drawScratchLine,
  getCanvasPoint,
  initializeScratchMask,
  resetScratchMask,
  triggerConfetti,
  triggerSparkles,
  triggerFireworks,
  selectPrizeByProbability,
} from './utils';

export const ThreeScratchCard: React.FC<ThreeScratchCardProps> = ({
  config,
  width = 600,
  height = 400,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [scratchState, setScratchState] = useState<ScratchState>({
    isScratching: false,
    scratchedPercent: 0,
    isRevealed: false,
  });

  const lastPointRef = useRef<ScratchPoint | null>(null);
  const hasTriggeredRevealRef = useRef(false);
  const selectedPrizeRef = useRef(config.prizes && config.prizes.length > 0 ? selectPrizeByProbability(config.prizes) : null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Load prize image texture
    const prizeImageUrl = selectedPrizeRef.current?.imageUrl || '/placeholder-prize.png';
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      prizeImageUrl,
      (texture: any) => {
        // Create geometry
        const geometry = new THREE.PlaneGeometry(4, 3);

        // Create material with metallic properties
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: config.foilRoughness,
          metalness: config.metalness,
          side: THREE.DoubleSide,
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        scene.add(mesh);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        if (config.shine) {
          const pointLight = new THREE.PointLight(0xffffff, 0.5);
          pointLight.position.set(-5, 5, 5);
          scene.add(pointLight);
        }

        // Start animation loop
        animate();
      },
      undefined,
      (error: any) => {
        console.error('Error loading prize image:', error);
      }
    );

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
    };
  }, [config.prizes, config.foilRoughness, config.metalness, config.shine, width, height]);

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // Subtle rotation for shine effect
    if (meshRef.current && config.shine && !scratchState.isRevealed) {
      meshRef.current.rotation.y += 0.001;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [config.shine, scratchState.isRevealed]);

  // Initialize scratch canvas
  useEffect(() => {
    if (!scratchCanvasRef.current) return;

    const canvas = scratchCanvasRef.current;
    canvas.width = width;
    canvas.height = height;

    initializeScratchMask(canvas, config.coverColor, config.coverImage);
  }, [config.coverColor, config.coverImage, width, height]);

  // Handle scratch start
  const handleScratchStart = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (scratchState.isRevealed) return;

      event.preventDefault();
      const canvas = scratchCanvasRef.current;
      if (!canvas) return;

      const point = getCanvasPoint(event.nativeEvent as MouseEvent | TouchEvent, canvas);
      lastPointRef.current = point;

      setScratchState((prev) => ({ ...prev, isScratching: true }));
    },
    [scratchState.isRevealed]
  );

  // Handle scratch move
  const handleScratchMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!scratchState.isScratching || scratchState.isRevealed) return;

      event.preventDefault();
      const canvas = scratchCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentPoint = getCanvasPoint(event.nativeEvent as MouseEvent | TouchEvent, canvas);

      if (lastPointRef.current) {
        drawScratchLine(ctx, lastPointRef.current, currentPoint, config.brushSize);
      }

      lastPointRef.current = currentPoint;

      // Calculate scratch percentage
      const percent = calculateScratchPercentage(canvas);
      setScratchState((prev) => ({ ...prev, scratchedPercent: percent }));

      // Trigger progress callback
      if (config.onScratchProgress) {
        config.onScratchProgress(percent);
      }

      // Check for auto-reveal
      if (percent >= config.revealThreshold && !hasTriggeredRevealRef.current) {
        handleReveal();
      }
    },
    [scratchState.isScratching, scratchState.isRevealed, config]
  );

  // Handle scratch end
  const handleScratchEnd = useCallback(() => {
    setScratchState((prev) => ({ ...prev, isScratching: false }));
    lastPointRef.current = null;
  }, []);

  // Handle reveal
  const handleReveal = useCallback(() => {
    if (hasTriggeredRevealRef.current) return;
    hasTriggeredRevealRef.current = true;

    setScratchState((prev) => ({ ...prev, isRevealed: true }));

    // Trigger reveal callback with selected prize
    if (config.onReveal && selectedPrizeRef.current) {
      config.onReveal(selectedPrizeRef.current);
    }

    // Trigger visual effects
    switch (config.revealEffect) {
      case 'confetti':
        triggerConfetti();
        break;
      case 'sparkles':
        triggerSparkles();
        break;
      case 'fireworks':
        triggerFireworks();
        break;
    }

    // Clear scratch canvas with animation
    const canvas = scratchCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [config]);

  // Handle reset
  const handleReset = useCallback(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    resetScratchMask(canvas, config.coverColor, config.coverImage);
    setScratchState({
      isScratching: false,
      scratchedPercent: 0,
      isRevealed: false,
    });
    hasTriggeredRevealRef.current = false;
  }, [config.coverColor, config.coverImage]);

  // Get animation class
  const getAnimationClass = () => {
    if (!scratchState.isRevealed) return '';

    switch (config.revealAnimation) {
      case 'fade':
        return 'animate-fade-in';
      case 'scale':
        return 'animate-scale-in';
      case 'slide':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce-in';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={{ width, height }}
    >
      {/* Three.js Canvas (Prize) */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${getAnimationClass()}`}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Scratch Canvas (Cover) */}
      {!scratchState.isRevealed && (
        <canvas
          ref={scratchCanvasRef}
          className="absolute inset-0 cursor-pointer touch-none"
          style={{ width: '100%', height: '100%' }}
          onMouseDown={handleScratchStart}
          onMouseMove={handleScratchMove}
          onMouseUp={handleScratchEnd}
          onMouseLeave={handleScratchEnd}
          onTouchStart={handleScratchStart}
          onTouchMove={handleScratchMove}
          onTouchEnd={handleScratchEnd}
        />
      )}

      {/* Progress Indicator */}
      {config.showPercent && !scratchState.isRevealed && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg font-bold text-lg backdrop-blur-sm">
          {Math.round(scratchState.scratchedPercent)}%
        </div>
      )}

      {/* Reset Button */}
      {config.resetButton && scratchState.isRevealed && (
        <button
          onClick={handleReset}
          className="absolute bottom-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Reset Card
        </button>
      )}

      {/* Scratch Hint */}
      {!scratchState.isRevealed && scratchState.scratchedPercent === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg animate-pulse">
            <p className="text-gray-800 font-semibold">Scratch to reveal! 🎁</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeScratchCard;
