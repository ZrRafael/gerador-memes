import MemeService from '../../Services/services.js';
import { LanguageManager } from '../components/language.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');
    const loadingState = document.querySelector('.loading-state');
    const projectsGrid = document.querySelector('.projects-grid');
    const emptyState = document.querySelector('.empty-state');

    // Tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.setAttribute('data-theme', 'light');
    } else {
        themeToggle.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('light-theme');
        document.body.classList.toggle('light-theme');
        themeToggle.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Idioma
    LanguageManager.updateLanguageButton(languageToggle);
    
    languageToggle.addEventListener('click', () => {
        LanguageManager.toggleLanguage();
        LanguageManager.updateLanguageButton(languageToggle);
        updateTexts();
    });

    // Atualizar textos inicialmente
    updateTexts();

    // Escutar evento de atualização de textos
    document.addEventListener('updateTexts', () => {
        updateTexts();
    });

    function updateTexts() {
        const currentLang = LanguageManager.getCurrentLanguage();
        
        // Atualizar título
        document.querySelector('h1').textContent = LanguageManager.getTranslation('title');
        
        // Atualizar textos dos botões
        document.querySelectorAll('[data-text]').forEach(element => {
            const key = element.getAttribute('data-text');
            if (LanguageManager.getTranslation(key)) {
                element.textContent = LanguageManager.getTranslation(key);
            }
        });

        // Atualizar textos dos cards
        document.querySelectorAll('.project-type').forEach(element => {
            const type = element.getAttribute('data-type');
            if (LanguageManager.getTranslation(type)) {
                element.textContent = LanguageManager.getTranslation(type);
            }
        });

        // Atualizar textos de data
        document.querySelectorAll('.project-date').forEach(element => {
            const timestamp = parseInt(element.getAttribute('data-timestamp'));
            element.textContent = `${LanguageManager.getTranslation('created-at')}: ${formatDate(new Date(timestamp), currentLang)}`;
        });

        // Atualizar placeholder do campo de busca
        const searchInput = document.getElementById('searchInput');
        searchInput.placeholder = LanguageManager.getTranslation('search-placeholder');
    }

    function formatDate(date, lang) {
        const options = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', options);
    }

    function showLoading() {
        loadingState.style.display = 'flex';
        projectsGrid.style.display = 'none';
        emptyState.style.display = 'none';
    }

    function hideLoading() {
        loadingState.style.display = 'none';
        projectsGrid.style.display = 'grid';
    }

    function showModal(message) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalButton = document.getElementById('modalButton');

        modalMessage.textContent = message;
        modalButton.textContent = LanguageManager.getTranslation('ok');

        modal.classList.add('show');

        modalButton.onclick = () => {
            modal.classList.remove('show');
        };
    }

    function showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalButtons = document.getElementById('modalButtons');

        const defaultButton = document.getElementById('modalButton');
        if (defaultButton) {
            defaultButton.style.display = 'none';
        }

        modal.classList.add('confirm-modal');
        modalMessage.textContent = message;

        if (modalButtons) {
            modalButtons.remove();
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.id = 'modalButtons';
        buttonsDiv.className = 'modal-buttons';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-button confirm-btn';
        confirmBtn.textContent = LanguageManager.getCurrentLanguage() === 'pt' ? 'Confirmar' : 'Confirm';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-button cancel-btn';
        cancelBtn.textContent = LanguageManager.getCurrentLanguage() === 'pt' ? 'Cancelar' : 'Cancel';

        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modal.querySelector('.modal-content').appendChild(buttonsDiv);

        modal.classList.add('show');

        confirmBtn.onclick = () => {
            modal.classList.remove('show');
            modal.classList.remove('confirm-modal');
            if (defaultButton) {
                defaultButton.style.display = 'block';
            }
            if (onConfirm) onConfirm();
        };

        cancelBtn.onclick = () => {
            modal.classList.remove('show');
            modal.classList.remove('confirm-modal');
            if (defaultButton) {
                defaultButton.style.display = 'block';
            }
        };
    }

    async function loadProjects() {
        console.log('Iniciando carregamento dos projetos...'); // Debug
        showLoading();
        
        try {
            console.log('Buscando memes do serviço...'); // Debug
            const memes = await MemeService.getAllMemes();
            console.log('Memes carregados:', memes); // Debug

            if (memes && memes.length > 0) {
                console.log(`Encontrados ${memes.length} memes`); // Debug
                projectsGrid.innerHTML = '';
                
                const fragment = document.createDocumentFragment();
                memes.forEach((meme, index) => {
                    console.log(`Criando card para meme ${index + 1}:`, meme); // Debug
                    const card = createProjectCard(meme);
                    fragment.appendChild(card);
                });
                
                projectsGrid.appendChild(fragment);
                console.log('Cards adicionados ao grid'); // Debug
                hideLoading();
            } else {
                console.log('Nenhum meme encontrado'); // Debug
                loadingState.style.display = 'none';
                emptyState.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading memes:', error);
            showModal(LanguageManager.getTranslation('error-loading'));
            hideLoading();
        }
    }

    function createProjectCard(meme) {
        console.log('Criando card para meme:', meme); // Debug
        const currentLang = LanguageManager.getCurrentLanguage();
        const card = document.createElement('div');
        card.className = 'project-card meme-card';
        
        // Usar o ID do documento do Firestore
        const docId = meme.docId;
        card.setAttribute('data-meme-id', docId);
        
        // Criar a imagem separadamente para melhor performance
        const img = new Image();
        img.src = meme.imageUrl;
        img.alt = meme.title;
        img.className = 'project-image';
        
        card.innerHTML = `
            <div class="project-info">
                <h3 class="project-title meme-title">${meme.title}</h3>
                <p class="project-date meme-timestamp" data-timestamp="${meme.timestamp}">
                    ${LanguageManager.getTranslation('created-at')}: ${formatDate(new Date(meme.timestamp), currentLang)}
                </p>
                <p class="project-type" data-type="${meme.type}">
                    ${LanguageManager.getTranslation(meme.type)}
                </p>
            </div>
            <div class="project-actions">
                <button class="project-btn download-btn" data-text="download">${LanguageManager.getTranslation('download')}</button>
                <button class="project-btn delete-btn" data-text="delete">${LanguageManager.getTranslation('delete')}</button>
            </div>
        `;

        // Inserir a imagem no início do card
        card.insertBefore(img, card.firstChild);

        // Adicionar event listeners para os botões
        const downloadBtn = card.querySelector('.download-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        downloadBtn.addEventListener('click', () => {
            showConfirmModal(LanguageManager.getTranslation('confirm-download'), () => {
                // Criar um link temporário para download
                const link = document.createElement('a');
                link.href = meme.imageUrl;
                link.download = `${meme.title}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        });

        deleteBtn.addEventListener('click', async () => {
            showConfirmModal(LanguageManager.getTranslation('confirm-delete'), async () => {
                try {
                    console.log('Tentando deletar meme com ID do documento:', docId); // Debug
                    
                    // Passar o ID do documento do Firestore
                    const result = await MemeService.deleteMeme(docId);
                    console.log('Resultado da deleção:', result); // Debug
                    
                    if (result.success) {
                        // Animação suave de remoção
                        card.style.transition = 'opacity 0.3s ease-out';
                        card.style.opacity = '0';
                        
                        setTimeout(() => {
                            card.remove();
                            
                            // Verificar se ainda há memes
                            const remainingCards = document.querySelectorAll('.project-card');
                            if (remainingCards.length === 0) {
                                emptyState.style.display = 'flex';
                            }
                        }, 300);
                    } else {
                        throw new Error('Falha ao deletar o meme');
                    }
                } catch (error) {
                    console.error('Error deleting meme:', error);
                    showModal(LanguageManager.getTranslation('error-deleting'));
                }
            });
        });

        return card;
    }

    // Função de busca
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    // Função para mostrar/ocultar o botão clear
    function toggleClearButton() {
        searchClear.classList.toggle('visible', searchInput.value.length > 0);
    }

    // Função para limpar o campo de busca
    function clearSearch() {
        searchInput.value = '';
        toggleClearButton();
        // Dispara o evento input para atualizar a busca
        searchInput.dispatchEvent(new Event('input'));
    }

    // Event listeners
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const memeCards = document.querySelectorAll('.project-card');
        const emptyState = document.querySelector('.empty-state');

        toggleClearButton(); // Atualiza visibilidade do botão clear

        let hasVisibleCards = false;

        memeCards.forEach(card => {
            const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
            const date = card.querySelector('.project-date')?.textContent.toLowerCase() || '';
            
            if (title.includes(searchTerm) || date.includes(searchTerm)) {
                card.style.display = '';
                hasVisibleCards = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Atualizar mensagem de estado vazio
        if (!hasVisibleCards) {
            if (searchTerm !== '') {
                emptyState.style.display = 'flex';
                emptyState.textContent = LanguageManager.getTranslation('no-memes');
            } else {
                emptyState.style.display = 'none';
                // Se não há termo de busca, mostrar todos os cards
                memeCards.forEach(card => card.style.display = '');
            }
        } else {
            emptyState.style.display = 'none';
        }
    });

    // Adiciona evento de clique no botão clear
    searchClear.addEventListener('click', clearSearch);

    // Inicializar
    loadProjects();
}); 