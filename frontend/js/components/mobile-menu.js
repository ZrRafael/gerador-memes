import { LanguageManager } from './language.js';

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const dropdown = document.getElementById('dropdown');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const languageToggleMobile = document.getElementById('languageToggleMobile');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');

    // Toggle dropdown
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Sincronizar tema mobile com desktop
    if (themeToggleMobile && themeToggle) {
        // Atualizar estado inicial do botão mobile
        const savedTheme = localStorage.getItem('theme');
        themeToggleMobile.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');

        themeToggleMobile.addEventListener('click', () => {
            const isDark = document.body.classList.contains('light-theme');
            document.body.classList.toggle('light-theme');
            themeToggleMobile.setAttribute('data-theme', isDark ? 'dark' : 'light');
            themeToggle.setAttribute('data-theme', isDark ? 'dark' : 'light');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Sincronizar idioma mobile com desktop
    if (languageToggleMobile && languageToggle) {
        // Atualizar estado inicial do botão mobile
        LanguageManager.updateLanguageButton(languageToggleMobile);
        
        languageToggleMobile.addEventListener('click', () => {
            LanguageManager.toggleLanguage();
            LanguageManager.updateLanguageButton(languageToggle);
            LanguageManager.updateLanguageButton(languageToggleMobile);
            
            // Atualizar textos na página
            const updateTextsEvent = new CustomEvent('updateTexts');
            document.dispatchEvent(updateTextsEvent);
        });
    }
}); 