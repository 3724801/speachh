import { themes } from '../styles/theme.js';

export class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }

    setTheme(theme) {
        const root = document.documentElement;
        const colors = themes[theme];

        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });

        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.body.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
    }
}