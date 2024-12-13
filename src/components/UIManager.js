export class UIManager {
    constructor(elements, callbacks, themeManager) {
        this.elements = elements;
        this.callbacks = callbacks;
        this.themeManager = themeManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.startBtn.addEventListener('click', this.callbacks.onToggleListening);
        this.elements.clearBtn.addEventListener('click', this.callbacks.onClear);
        this.elements.resetBtn.addEventListener('click', this.callbacks.onReset);
        this.elements.languageBtn.addEventListener('click', this.callbacks.onToggleLanguage);
        this.elements.themeToggle.addEventListener('click', () => this.themeManager.toggleTheme());
    }

    updateStartButton(isListening) {
        const icon = isListening ? 'ri-stop-line' : 'ri-mic-line';
        const text = isListening ? 'Stop Listening' : 'Start Listening';
        this.elements.startBtn.innerHTML = `<i class="${icon}"></i>${text}`;
        this.elements.startBtn.setAttribute('data-listening', isListening);
    }

    updateStatus(status, type = 'default') {
        this.elements.statusText.textContent = `Status: ${status}`;
        this.elements.statusContainer.className = `status ${type}`;
    }

    updateLanguageButton(languageLabel) {
        this.elements.languageBtn.innerHTML = `<i class="ri-translate-2"></i>${languageLabel}`;
    }

    appendText(text) {
        this.elements.output.value += text;
        this.elements.output.scrollTop = this.elements.output.scrollHeight;
    }

    clearText() {
        this.elements.output.value = '';
    }

    updateThemeIcon(theme) {
        const icon = theme === 'dark' ? 'ri-moon-line' : 'ri-sun-line';
        this.elements.themeToggle.innerHTML = `<i class="${icon}"></i>`;
    }
}