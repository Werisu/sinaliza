import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

const STORAGE_KEY = 'librasflow-theme';

export type AppColorMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  /** Tema efetivo aplicado no documento. */
  readonly mode = signal<AppColorMode>('light');

  /**
   * Aplica tema guardado ou, na ausência, segue `prefers-color-scheme` (sem gravar no storage).
   */
  init(): void {
    const win = this.doc.defaultView;
    if (!win) {
      return;
    }
    const stored = win.localStorage.getItem(STORAGE_KEY) as AppColorMode | null;
    if (stored === 'light' || stored === 'dark') {
      this.apply(stored, false);
      return;
    }
    const systemDark = win.matchMedia('(prefers-color-scheme: dark)').matches;
    this.apply(systemDark ? 'dark' : 'light', false);
  }

  toggle(): void {
    this.apply(this.mode() === 'dark' ? 'light' : 'dark', true);
  }

  setMode(next: AppColorMode): void {
    this.apply(next, true);
  }

  private apply(next: AppColorMode, persist: boolean): void {
    this.mode.set(next);
    this.doc.documentElement.setAttribute('data-bs-theme', next);
    this.doc.documentElement.style.colorScheme = next === 'dark' ? 'dark' : 'light';
    const win = this.doc.defaultView;
    if (persist && win) {
      win.localStorage.setItem(STORAGE_KEY, next);
    }
  }
}
