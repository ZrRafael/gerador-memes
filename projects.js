import MemeService from './services.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');
    const loadingState = document.querySelector('.loading-state');
    const projectsGrid = document.querySelector('.projects-grid');
    const emptyState = document.querySelector('.empty-state');
    let isEnglish = false;

    const translations = {
        pt: {
            'saved': 'Salvo',
            'downloaded': 'Baixado',
            'created-at': 'Criado em',
            'download': 'Baixar',
            'delete': 'Excluir',
            'confirm-delete': 'Tem certeza que deseja excluir este meme?',
            'no-memes': 'Nenhum meme criado ainda. Vá para o Editor para criar seu primeiro meme!',
            'title': 'Meus Memes',
            'editor': 'Editor',
            'projects': 'Projetos'
        },
        en: {
            'saved': 'Saved',
            'downloaded': 'Downloaded',
            'created-at': 'Created at',
            'download': 'Download',
            'delete': 'Delete',
            'confirm-delete': 'Are you sure you want to delete this meme?',
            'no-memes': 'No memes created yet. Go to Editor to create your first meme!',
            'title': 'My Memes',
            'editor': 'Editor',
            'projects': 'Projects'
        }
    };

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
    const savedLanguage = localStorage.getItem('language');
    isEnglish = savedLanguage === 'en';
    if (isEnglish) {
        languageToggle.querySelector('.lang-text').textContent = 'EN US';
    }
    
    languageToggle.addEventListener('click', () => {
        isEnglish = !isEnglish;
        const langText = languageToggle.querySelector('.lang-text');
        langText.textContent = isEnglish ? 'EN US' : 'BR PT';
        localStorage.setItem('language', isEnglish ? 'en' : 'pt');
        updateTexts();
    });

    function updateTexts() {
        const currentLang = isEnglish ? 'en' : 'pt';
        
        // Atualizar título
        document.querySelector('h1').textContent = translations[currentLang].title;
        
        // Atualizar textos dos botões
        document.querySelectorAll('[data-text]').forEach(element => {
            const key = element.getAttribute('data-text');
            if (translations[currentLang][key]) {
                element.textContent = translations[currentLang][key];
            }
        });

        // Atualizar textos dos cards
        document.querySelectorAll('.project-type').forEach(element => {
            const type = element.getAttribute('data-type');
            if (translations[currentLang][type]) {
                element.textContent = translations[currentLang][type];
            }
        });

        // Atualizar textos de data
        document.querySelectorAll('.project-date').forEach(element => {
            const timestamp = parseInt(element.getAttribute('data-timestamp'));
            element.textContent = `${translations[currentLang]['created-at']}: ${formatDate(new Date(timestamp), currentLang)}`;
        });
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

    async function loadProjects() {
        showLoading();
        
        try {
            const memes = await MemeService.getAllMemes();
            console.log('Memes carregados:', memes); // Debug

            if (memes.length > 0) {
                projectsGrid.innerHTML = '';
                
                const fragment = document.createDocumentFragment();
                memes.forEach(meme => {
                    const card = createProjectCard(meme);
                    fragment.appendChild(card);
                });
                
                projectsGrid.appendChild(fragment);
                hideLoading();
            } else {
                loadingState.style.display = 'none';
                emptyState.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading memes:', error);
            alert('Erro ao carregar os memes. Por favor, tente novamente.');
            hideLoading();
        }
    }

    function createProjectCard(meme) {
        console.log('Criando card para meme:', meme); // Debug
        const currentLang = isEnglish ? 'en' : 'pt';
        const card = document.createElement('div');
        card.className = 'project-card';
        
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
                <h3 class="project-title">${meme.title}</h3>
                <p class="project-date" data-timestamp="${meme.timestamp}">
                    ${translations[currentLang]['created-at']}: ${formatDate(new Date(meme.timestamp), currentLang)}
                </p>
                <p class="project-type" data-type="${meme.type}">
                    ${translations[currentLang][meme.type]}
                </p>
            </div>
            <div class="project-actions">
                <button class="project-btn download-btn" data-text="download">${translations[currentLang]['download']}</button>
                <button class="project-btn delete-btn" data-text="delete">${translations[currentLang]['delete']}</button>
            </div>
        `;

        // Inserir a imagem no início do card
        card.insertBefore(img, card.firstChild);

        // Adicionar event listeners para os botões
        const downloadBtn = card.querySelector('.download-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        downloadBtn.addEventListener('click', () => {
            // Criar um link temporário para download
            const link = document.createElement('a');
            link.href = meme.imageUrl;
            link.download = `${meme.title}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        deleteBtn.addEventListener('click', async () => {
            const confirmMessage = isEnglish ? translations.en['confirm-delete'] : translations.pt['confirm-delete'];
            if (confirm(confirmMessage)) {
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
                    alert('Erro ao excluir o meme. Por favor, tente novamente.');
                }
            }
        });

        return card;
    }

    // Inicializar
    loadProjects();
}); 