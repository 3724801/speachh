import { setupVisualizer } from './visualizer.js';
import { UIManager } from './components/UIManager.js';
import { ThemeManager } from './utils/themeManager.js';
import { LANGUAGES } from './constants.js';
import { getLanguageLabel, toggleLanguage } from './utils/languageUtils.js';

class SpeechRecognizer {
    constructor() {
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.isListening = false;
        this.currentLanguage = LANGUAGES.ENGLISH.code;
        this.visualizer = setupVisualizer();
        this.themeManager = new ThemeManager();
        
        this.initializeUI();
        this.setupRecognition();
    }

    initializeUI() {
        const elements = {
            output: document.getElementById('output'),
            startBtn: document.getElementById('startBtn'),
            clearBtn: document.getElementById('clearBtn'),
            resetBtn: document.getElementById('resetBtn'),
            languageBtn: document.getElementById('languageBtn'),
            statusText: document.getElementById('status-text'),
            statusContainer: document.getElementById('status-container'),
            themeToggle: document.getElementById('themeToggle')
        };

        const callbacks = {
            onToggleListening: () => this.toggleListening(),
            onClear: () => this.clearText(),
            onReset: () => this.resetAll(),
            onToggleLanguage: () => this.switchLanguage()
        };

        this.ui = new UIManager(elements, callbacks, this.themeManager);
    }

    setupRecognition() {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                this.ui.appendText(transcript + '\n');
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.ui.updateStatus('Error: ' + event.error, 'error');
        };
    }

    async toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            try {
                await this.startListening();
            } catch (error) {
                console.error('Error starting recognition:', error);
                this.ui.updateStatus('Error: Could not access microphone', 'error');
            }
        }
    }

    async startListening() {
        try {
            await this.recognition.start();
            this.isListening = true;
            this.ui.updateStartButton(true);
            this.ui.updateStatus('Listening...', 'listening');
            this.visualizer.start();
        } catch (error) {
            this.isListening = false;
            throw error;
        }
    }

    stopListening() {
        this.recognition.stop();
        this.isListening = false;
        this.ui.updateStartButton(false);
        this.ui.updateStatus('Stopped');
        this.visualizer.stop();
    }

    clearText() {
        this.ui.clearText();
    }

    resetAll() {
        this.stopListening();
        this.clearText();
        this.currentLanguage = LANGUAGES.ENGLISH.code;
        this.recognition.lang = this.currentLanguage;
        this.ui.updateLanguageButton(getLanguageLabel(this.currentLanguage));
        this.ui.updateStatus('Reset complete');
    }

    switchLanguage() {
        if (this.isListening) {
            this.stopListening();
        }
        
        this.currentLanguage = toggleLanguage(this.currentLanguage);
        this.recognition.lang = this.currentLanguage;
        this.ui.updateLanguageButton(getLanguageLabel(this.currentLanguage));
        this.ui.updateStatus(`Language changed to ${getLanguageLabel(this.currentLanguage)}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SpeechRecognizer();
});