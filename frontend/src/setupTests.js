// jest-dom adds custom matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Compatibility alias for jest globals
globalThis.jest = vi;

// Mock Swiper components which are ESM-only for Vitest
vi.mock('swiper/react', () => ({
  Swiper: ({ children }) => <div data-testid="mock-swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="mock-swiper-slide">{children}</div>,
}));

vi.mock('swiper/modules', () => ({
  Pagination: () => null,
  Autoplay: () => null,
  EffectFade: () => null,
}));

// Mock Swiper CSS imports for Vitest
vi.mock('swiper/css', () => ({ default: {} }));
vi.mock('swiper/css/pagination', () => ({ default: {} }));
vi.mock('swiper/css/autoplay', () => ({ default: {} }));
vi.mock('swiper/css/effect-fade', () => ({ default: {} }));

// Mock IntersectionObserver for Framer Motion viewport triggers
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;
globalThis.IntersectionObserver = MockIntersectionObserver;

// Mock window.matchMedia for responsive/animation components
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock HTMLCanvasElement getContext for WebGL in JSDOM
HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
