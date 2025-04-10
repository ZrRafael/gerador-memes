import MemeService from './services.js';
import { LanguageManager } from './language.js';

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const memeImage = document.getElementById('memeImage');
    const textsContainer = document.querySelector('.texts-container');
    const downloadBtn = document.getElementById('downloadBtn');
    const uploadSection = document.querySelector('.upload-section');
    const addTextBtn = document.getElementById('addTextBtn');
    const applyToAllBtn = document.getElementById('applyToAllBtn');
    const textEditors = document.querySelector('.text-editors');
    const themeToggle = document.getElementById('themeToggle');
    const languageToggle = document.getElementById('languageToggle');

    let selectedText = null;
    let textCount = 0;
    let imageLoaded = false;
    let deletedTexts = new Set(); // Conjunto para rastrear textos removidos
    let isEnglish = false;

    const translations = {
        pt: {
            chooseimage: 'Escolher Imagem',
            addtext: 'Adicionar Texto',
            applytoall: 'Aplicar a Todos',
            downloadmeme: 'Baixar Meme',
            savememe: 'Salvar Meme',
            remove: 'Remover',
            color: 'Cor',
            size: 'Tamanho',
            text: 'Texto',
            title: 'Gerador de Memes',
            editor: 'Editor',
            projects: 'Projetos',
            'confirm-download': 'Tem certeza que deseja baixar este meme?',
            'confirm-save': 'Tem certeza que deseja salvar este meme?',
            'ok': 'OK',
            'save': 'Salvar',
            'cancel': 'Cancelar',
            'load-image-first': 'Por favor, carregue uma imagem primeiro!',
            'add-text-first': 'Adicione pelo menos um texto primeiro!',
            'meme-saved': 'Meme salvo com sucesso!',
            'error-saving': 'Erro ao salvar o meme. Por favor, tente novamente.',
            'enter-meme-name': 'Digite um nome para o meme:',
            'name-exists': 'Este nome já está em uso. Por favor, escolha outro.',
            'name-required': 'O nome do meme é obrigatório.'
        },
        en: {
            chooseimage: 'Choose Image',
            addtext: 'Add Text',
            applytoall: 'Apply to All',
            downloadmeme: 'Download Meme',
            savememe: 'Save Meme',
            remove: 'Remove',
            color: 'Color',
            size: 'Size',
            text: 'Text',
            title: 'Meme Generator',
            editor: 'Editor',
            projects: 'Projects',
            'confirm-download': 'Are you sure you want to download this meme?',
            'confirm-save': 'Are you sure you want to save this meme?',
            'ok': 'OK',
            'save': 'Save',
            'cancel': 'Cancel',
            'load-image-first': 'Please load an image first!',
            'add-text-first': 'Please add at least one text first!',
            'meme-saved': 'Meme saved successfully!',
            'error-saving': 'Error saving meme. Please try again.',
            'enter-meme-name': 'Enter a name for the meme:',
            'name-exists': 'This name is already in use. Please choose another one.',
            'name-required': 'Meme name is required.'
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
    LanguageManager.updateLanguageButton(languageToggle);
    
    languageToggle.addEventListener('click', () => {
        LanguageManager.toggleLanguage();
        LanguageManager.updateLanguageButton(languageToggle);
        updateTexts();
        updateAllTextOverlays();
    });

    // Atualizar textos inicialmente
    updateTexts();

    // Escutar evento de atualização de textos
    document.addEventListener('updateTexts', () => {
        updateTexts();
        updateAllTextOverlays();
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

        // Atualizar textos dos editores existentes
        document.querySelectorAll('.text-editor').forEach(editor => {
            const removeBtn = editor.querySelector('.remove-text-btn');
            const colorLabel = editor.querySelector('.text-editor-controls label:first-child');
            const sizeLabel = editor.querySelector('.text-editor-controls label:last-child');
            
            if (removeBtn) removeBtn.textContent = LanguageManager.getTranslation('remove');
            if (colorLabel) {
                const colorInput = colorLabel.querySelector('input');
                colorLabel.innerHTML = `${LanguageManager.getTranslation('color')}: `;
                colorLabel.appendChild(colorInput);
            }
            if (sizeLabel) {
                const sizeInput = sizeLabel.querySelector('input');
                sizeLabel.innerHTML = `${LanguageManager.getTranslation('size')}: `;
                sizeLabel.appendChild(sizeInput);
            }
        });
    }

    function updateAllTextOverlays() {
        const currentLang = LanguageManager.getCurrentLanguage();
        document.querySelectorAll('.text-overlay').forEach(text => {
            const ptPattern = /^Texto\s+\d+$/;
            const enPattern = /^Text\s+\d+$/;
            
            if (ptPattern.test(text.textContent) || enPattern.test(text.textContent)) {
                const number = text.textContent.match(/\d+$/)[0];
                const newText = `${LanguageManager.getTranslation('text')} ${number}`;
                text.textContent = newText;
                
                const editor = document.querySelector(`[data-text-id="${text.id}"]`);
                if (editor) {
                    const title = editor.querySelector('.text-editor-title');
                    if (title) {
                        title.textContent = newText;
                    }
                }
            }
        });
    }

    // Desabilitar botões inicialmente
    addTextBtn.disabled = true;
    applyToAllBtn.disabled = true;

    // Carregar imagem
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                memeImage.src = e.target.result;
                memeImage.classList.add('visible');
                uploadSection.classList.add('hidden');
                imageLoaded = true;
                
                // Habilitar botões após carregar a imagem
                addTextBtn.disabled = false;
                applyToAllBtn.disabled = false;

                // Criar botão de remover se não existir
                if (!document.querySelector('.remove-image-btn')) {
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-image-btn';
                    removeBtn.innerHTML = '×';
                    removeBtn.title = 'Remover imagem';
                    
                    removeBtn.addEventListener('click', () => {
                        // Limpar a imagem
                        memeImage.src = '';
                        memeImage.classList.remove('visible');
                        uploadSection.classList.remove('hidden');
                        imageLoaded = false;
                        
                        // Desabilitar botões
                        addTextBtn.disabled = true;
                        applyToAllBtn.disabled = true;
                        
                        // Remover todos os textos
                        const texts = document.querySelectorAll('.text-overlay');
                        texts.forEach(text => {
                            const editor = document.querySelector(`[data-text-id="${text.id}"]`);
                            if (editor) editor.remove();
                            text.remove();
                        });
                        
                        // Remover o botão de remover
                        removeBtn.remove();
                    });
                    
                    document.querySelector('.image-container').appendChild(removeBtn);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Adicionar novo texto
    addTextBtn.addEventListener('click', () => {
        if (!imageLoaded) {
            const currentLang = isEnglish ? 'en' : 'pt';
            showModal(translations[currentLang]['load-image-first']);
            return;
        }

        // Encontrar o próximo número disponível
        let nextNumber = 1;
        const existingTexts = document.querySelectorAll('.text-overlay');
        const usedNumbers = new Set();
        
        existingTexts.forEach(text => {
            const match = text.textContent.match(/\d+/);
            if (match) {
                usedNumbers.add(parseInt(match[0]));
            }
        });

        while (usedNumbers.has(nextNumber)) {
            nextNumber++;
        }

        textCount = nextNumber;
        const textOverlay = createTextOverlay();
        textsContainer.appendChild(textOverlay);
        setupDragAndDrop(textOverlay);
        createTextEditor(textOverlay);
        selectText(textOverlay);
    });

    // Configurar drag and drop
    function setupDragAndDrop(element) {
        interact(element)
            .draggable({
                inertia: false,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: '#memeImage',
                        endOnly: true
                    })
                ],
                autoScroll: false,
                listeners: {
                    start(event) {
                        element.classList.add('dragging');
                        selectText(element);
                    },
                    move(event) {
                        const target = event.target;
                        const image = document.getElementById('memeImage');
                        const imageRect = image.getBoundingClientRect();
                        const textRect = target.getBoundingClientRect();

                        // Calcula a nova posição
                        let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                        // Calcula os limites
                        const maxX = (imageRect.width - textRect.width) / 2;
                        const maxY = (imageRect.height - textRect.height) / 2;
                        const minX = -maxX;
                        const minY = -maxY;

                        // Aplica os limites
                        x = Math.min(Math.max(x, minX), maxX);
                        y = Math.min(Math.max(y, minY), maxY);

                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end(event) {
                        element.classList.remove('dragging');
                    }
                }
            });
    }

    // Criar elemento de texto
    function createTextOverlay() {
        const textOverlay = document.createElement('div');
        textOverlay.className = 'text-overlay';
        textOverlay.contentEditable = true;
        
        // Define o texto inicial baseado no idioma atual
        const currentLang = isEnglish ? 'en' : 'pt';
        textOverlay.textContent = `${translations[currentLang].text} ${textCount}`;
        
        // Posiciona o texto no centro da imagem
        const image = document.getElementById('memeImage');
        const imageRect = image.getBoundingClientRect();
        
        textOverlay.style.left = '50%';
        textOverlay.style.top = '50%';
        textOverlay.style.transform = 'translate(-50%, -50%)';
        
        textOverlay.id = `text-${textCount}`;
        return textOverlay;
    }

    // Atualizar tamanho do texto
    function updateTextSize(textOverlay, newSize) {
        const image = document.getElementById('memeImage');
        const imageRect = image.getBoundingClientRect();
        
        // Aplica o novo tamanho
        textOverlay.style.fontSize = `${newSize}px`;
        
        // Verifica se o texto está ultrapassando os limites
        const textRect = textOverlay.getBoundingClientRect();
        
        // Se o texto estiver maior que a imagem, reduz o tamanho
        if (textRect.width > imageRect.width * 0.9 || textRect.height > imageRect.height * 0.9) {
            let size = newSize;
            while ((textRect.width > imageRect.width * 0.9 || textRect.height > imageRect.height * 0.9) && size > 10) {
                size--;
                textOverlay.style.fontSize = `${size}px`;
                textRect = textOverlay.getBoundingClientRect();
            }
            return size;
        }
        
        return newSize;
    }

    // Modificar a função createTextEditor para usar updateTextSize
    function createTextEditor(textOverlay) {
        const editor = document.createElement('div');
        editor.className = 'text-editor';
        editor.dataset.textId = textOverlay.id;

        const header = document.createElement('div');
        header.className = 'text-editor-header';

        const titleRow = document.createElement('div');
        titleRow.className = 'text-editor-title-row';

        const title = document.createElement('div');
        title.className = 'text-editor-title';
        title.contentEditable = true;
        title.textContent = textOverlay.textContent;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-text-btn';
        removeBtn.textContent = isEnglish ? translations.en.remove : translations.pt.remove;
        removeBtn.addEventListener('click', () => {
            textOverlay.remove();
            editor.remove();
            if (selectedText === textOverlay) {
                selectedText = null;
            }
        });

        titleRow.appendChild(title);
        titleRow.appendChild(removeBtn);

        const controls = document.createElement('div');
        controls.className = 'text-editor-controls';

        const colorLabel = document.createElement('label');
        colorLabel.innerHTML = `${isEnglish ? translations.en.color : translations.pt.color}: <input type="color" value="#ffffff">`;
        const colorInput = colorLabel.querySelector('input');
        colorInput.value = textOverlay.style.color || '#ffffff';
        colorInput.addEventListener('input', () => {
            textOverlay.style.color = colorInput.value;
        });

        const sizeLabel = document.createElement('label');
        sizeLabel.innerHTML = `${isEnglish ? translations.en.size : translations.pt.size}: <input type="range" min="10" max="60" value="30">`;
        const sizeInput = sizeLabel.querySelector('input');
        sizeInput.value = parseInt(textOverlay.style.fontSize) || 30;
        sizeInput.addEventListener('input', () => {
            const newSize = updateTextSize(textOverlay, parseInt(sizeInput.value));
            sizeInput.value = newSize;
        });

        controls.appendChild(colorLabel);
        controls.appendChild(sizeLabel);
        header.appendChild(titleRow);
        header.appendChild(controls);
        editor.appendChild(header);
        textEditors.appendChild(editor);

        // Atualizar título quando o texto for editado
        textOverlay.addEventListener('input', () => {
            const text = textOverlay.textContent;
            // Limita o texto se necessário
            if (text.length > 100) {
                textOverlay.textContent = text.slice(0, 100);
            }
            title.textContent = textOverlay.textContent;
        });

        // Atualizar texto quando o título for editado
        title.addEventListener('input', () => {
            const text = title.textContent;
            // Limita o texto se necessário
            if (text.length > 100) {
                title.textContent = text.slice(0, 100);
            }
            textOverlay.textContent = title.textContent;
        });
    }

    // Selecionar texto
    function selectText(element) {
        if (selectedText) {
            selectedText.classList.remove('selected');
            const prevEditor = document.querySelector(`[data-text-id="${selectedText.id}"]`);
            if (prevEditor) prevEditor.classList.remove('active');
        }
        selectedText = element;
        element.classList.add('selected');
        const editor = document.querySelector(`[data-text-id="${element.id}"]`);
        if (editor) editor.classList.add('active');
    }

    // Aplicar estilo a todos os textos
    applyToAllBtn.addEventListener('click', () => {
        const texts = document.querySelectorAll('.text-overlay');
        if (texts.length === 0) {
            const currentLang = isEnglish ? 'en' : 'pt';
            showModal(translations[currentLang]['add-text-first']);
            return;
        }

        // Pegar o estilo do primeiro texto
        const firstText = texts[0];
        const firstTextColor = firstText.style.color || '#ffffff';
        const firstTextSize = firstText.style.fontSize || '30px';

        // Aplicar o estilo do primeiro texto para todos os outros
        texts.forEach((text, index) => {
            if (index > 0) { // Pular o primeiro texto
                text.style.color = firstTextColor;
                text.style.fontSize = firstTextSize;

                // Atualizar os controles do editor
                const editor = document.querySelector(`[data-text-id="${text.id}"]`);
                if (editor) {
                    const colorInput = editor.querySelector('input[type="color"]');
                    const sizeInput = editor.querySelector('input[type="range"]');
                    if (colorInput) colorInput.value = firstTextColor;
                    if (sizeInput) sizeInput.value = parseInt(firstTextSize);
                }
            }
        });
    });

    // Função para mostrar o modal personalizado
    function showModal(message) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalButton = document.getElementById('modalButton');
        const currentLang = isEnglish ? 'en' : 'pt';

        modalMessage.textContent = message;
        modalButton.textContent = translations[currentLang].ok;

        modal.classList.add('show');

        modalButton.onclick = () => {
            modal.classList.remove('show');
        };
    }

    // Função para mostrar o modal de confirmação
    function showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('customModal');
        const modalMessage = document.getElementById('modalMessage');
        const modalButtons = document.getElementById('modalButtons');
        const currentLang = isEnglish ? 'en' : 'pt';

        // Remover o botão OK padrão
        const defaultButton = document.getElementById('modalButton');
        if (defaultButton) {
            defaultButton.style.display = 'none';
        }

        modal.classList.add('confirm-modal');
        modalMessage.textContent = message;

        // Limpar botões existentes
        if (modalButtons) {
            modalButtons.remove();
        }

        // Criar novos botões
        const buttonsDiv = document.createElement('div');
        buttonsDiv.id = 'modalButtons';
        buttonsDiv.className = 'modal-buttons';

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'modal-button confirm-btn';
        confirmBtn.textContent = currentLang === 'pt' ? 'Confirmar' : 'Confirm';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-button cancel-btn';
        cancelBtn.textContent = currentLang === 'pt' ? 'Cancelar' : 'Cancel';

        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modal.querySelector('.modal-content').appendChild(buttonsDiv);

        modal.classList.add('show');

        // Event listeners
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

    // Função para mostrar o modal com loading
    function showLoadingModal() {
        const modal = document.getElementById('customModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalLoading = modal.querySelector('.modal-loading');
        const modalLoadingText = modal.querySelector('.modal-loading-text');
        const currentLang = isEnglish ? 'en' : 'pt';

        modalContent.classList.add('loading');
        modalLoading.classList.add('show');
        modalLoadingText.textContent = currentLang === 'pt' ? 'Salvando meme...' : 'Saving meme...';
        modal.classList.add('show');
    }

    // Função para atualizar o modal de loading para sucesso
    function updateModalToSuccess() {
        const modal = document.getElementById('customModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalLoading = modal.querySelector('.modal-loading');
        const modalMessage = document.getElementById('modalMessage');
        const modalButton = document.getElementById('modalButton');
        const modalButtons = document.getElementById('modalButtons');
        const currentLang = isEnglish ? 'en' : 'pt';

        // Remover os botões de confirmação se existirem
        if (modalButtons) {
            modalButtons.remove();
        }

        // Remover a classe confirm-modal
        modal.classList.remove('confirm-modal');

        modalContent.classList.remove('loading');
        modalLoading.classList.remove('show');
        modalMessage.textContent = translations[currentLang]['meme-saved'];
        modalButton.textContent = translations[currentLang].ok;
        modalButton.style.display = 'block';

        modalButton.onclick = () => {
            modal.classList.remove('show');
        };
    }

    // Função para atualizar o modal de loading para erro
    function updateModalToError() {
        const modal = document.getElementById('customModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalLoading = modal.querySelector('.modal-loading');
        const modalMessage = document.getElementById('modalMessage');
        const modalButton = document.getElementById('modalButton');
        const modalButtons = document.getElementById('modalButtons');
        const currentLang = isEnglish ? 'en' : 'pt';

        // Remover os botões de confirmação se existirem
        if (modalButtons) {
            modalButtons.remove();
        }

        // Remover a classe confirm-modal
        modal.classList.remove('confirm-modal');

        modalContent.classList.remove('loading');
        modalLoading.classList.remove('show');
        modalMessage.textContent = translations[currentLang]['error-saving'];
        modalButton.textContent = translations[currentLang].ok;
        modalButton.style.display = 'block';

        modalButton.onclick = () => {
            modal.classList.remove('show');
        };
    }

    // Download da imagem
    downloadBtn.addEventListener('click', () => {
        if (!imageLoaded) {
            const currentLang = isEnglish ? 'en' : 'pt';
            showModal(translations[currentLang]['load-image-first']);
            return;
        }

        const currentLang = isEnglish ? 'en' : 'pt';
        showConfirmModal(translations[currentLang]['confirm-download'], () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Reduzir o tamanho da imagem para no máximo 800x800 mantendo a proporção
            let width = memeImage.naturalWidth;
            let height = memeImage.naturalHeight;
            const maxSize = 800;
            
            if (width > height) {
                if (width > maxSize) {
                    height = Math.round((height * maxSize) / width);
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = Math.round((width * maxSize) / height);
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Desenhar a imagem redimensionada
            ctx.drawImage(memeImage, 0, 0, width, height);
            
            // Desenhar os textos
            const texts = document.querySelectorAll('.text-overlay');
            texts.forEach(text => {
                const x = parseFloat(text.getAttribute('data-x')) || 0;
                const y = parseFloat(text.getAttribute('data-y')) || 0;
                
                // Ajustar o tamanho da fonte proporcionalmente
                const originalSize = parseInt(text.style.fontSize) || 30;
                const scale = width / memeImage.naturalWidth;
                const fontSize = Math.round(originalSize * scale);
                
                ctx.font = `${fontSize}px Arial`;
                ctx.fillStyle = text.style.color || '#ffffff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const textX = width / 2 + (x * scale);
                const textY = height / 2 + (y * scale);
                
                ctx.fillText(text.textContent, textX, textY);
            });
            
            // Para download, usar PNG sem compressão para melhor qualidade
            const imageData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'meme.png';
            link.href = imageData;
            link.click();
        });
    });

    // Função para mostrar o modal de nome do meme
    function showNameInputModal() {
        const modal = document.getElementById('customModal');
        const modalContent = modal.querySelector('.modal-content');
        const modalMessage = document.getElementById('modalMessage');
        const modalInput = document.getElementById('memeNameInput');
        const modalError = document.getElementById('modalError');
        const modalButton = document.getElementById('modalButton');
        const modalButtons = document.getElementById('modalButtons');
        const currentLang = isEnglish ? 'en' : 'pt';

        // Remover botões anteriores se existirem
        if (modalButtons) {
            modalButtons.remove();
        }

        // Configurar o modal
        modalMessage.textContent = translations[currentLang]['enter-meme-name'];
        modalInput.style.display = 'block';
        modalInput.value = '';
        modalError.style.display = 'none';
        
        // Criar botões
        const buttonsDiv = document.createElement('div');
        buttonsDiv.id = 'modalButtons';
        buttonsDiv.className = 'modal-buttons';

        const saveBtn = document.createElement('button');
        saveBtn.className = 'modal-button confirm-btn';
        saveBtn.textContent = translations[currentLang].save;

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-button cancel-btn';
        cancelBtn.textContent = translations[currentLang].cancel;

        buttonsDiv.appendChild(saveBtn);
        buttonsDiv.appendChild(cancelBtn);
        modalContent.appendChild(buttonsDiv);

        // Esconder o botão OK padrão
        if (modalButton) {
            modalButton.style.display = 'none';
        }

        modal.classList.add('show');

        // Event listeners
        saveBtn.onclick = async () => {
            const memeName = modalInput.value.trim();
            
            if (!memeName) {
                modalError.textContent = translations[currentLang]['name-required'];
                modalError.style.display = 'block';
                return;
            }

            try {
                const exists = await MemeService.checkMemeNameExists(memeName);
                if (exists) {
                    modalError.textContent = translations[currentLang]['name-exists'];
                    modalError.style.display = 'block';
                    return;
                }

                // Proceder com o salvamento
                modalInput.style.display = 'none';
                buttonsDiv.remove();
                await saveMemeWithName(memeName);
            } catch (error) {
                console.error('Error checking meme name:', error);
                modalError.textContent = translations[currentLang]['error-saving'];
                modalError.style.display = 'block';
            }
        };

        cancelBtn.onclick = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modalInput.style.display = 'none';
                buttonsDiv.remove();
                if (modalButton) {
                    modalButton.style.display = 'block';
                }
            }, 300);
        };

        // Permitir salvar com Enter
        modalInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                saveBtn.click();
            }
        };
    }

    async function saveMemeWithName(memeName) {
        showLoadingModal();
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Reduzir o tamanho da imagem para no máximo 800x800 mantendo a proporção
        let width = memeImage.naturalWidth;
        let height = memeImage.naturalHeight;
        const maxSize = 800;
        
        if (width > height) {
            if (width > maxSize) {
                height = Math.round((height * maxSize) / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = Math.round((width * maxSize) / height);
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar a imagem redimensionada
        ctx.drawImage(memeImage, 0, 0, width, height);
        
        // Desenhar os textos
        const texts = document.querySelectorAll('.text-overlay');
        texts.forEach(text => {
            const x = parseFloat(text.getAttribute('data-x')) || 0;
            const y = parseFloat(text.getAttribute('data-y')) || 0;
            
            // Ajustar o tamanho da fonte proporcionalmente
            const originalSize = parseInt(text.style.fontSize) || 30;
            const scale = width / memeImage.naturalWidth;
            const fontSize = Math.round(originalSize * scale);
            
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = text.style.color || '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textX = width / 2 + (x * scale);
            const textY = height / 2 + (y * scale);
            
            ctx.fillText(text.textContent, textX, textY);
        });
        
        // Comprimir a imagem com qualidade 0.8
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        try {
            const memeData = {
                title: memeName,
                imageUrl: imageData,
                type: 'saved',
                timestamp: new Date().getTime()
            };
            
            const result = await MemeService.saveMeme(memeData);
            console.log('Meme salvo com ID:', result.id);
            
            // Atualizar modal para sucesso após um pequeno delay para mostrar o loading
            setTimeout(() => {
                updateModalToSuccess();
            }, 500);
        } catch (error) {
            console.error('Error saving meme:', error);
            updateModalToError();
        }
    }

    // Botão Salvar
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', async () => {
        if (!imageLoaded) {
            const currentLang = isEnglish ? 'en' : 'pt';
            showModal(translations[currentLang]['load-image-first']);
            return;
        }

        const currentLang = isEnglish ? 'en' : 'pt';
        showConfirmModal(translations[currentLang]['confirm-save'], () => {
            showNameInputModal();
        });
    });

    // Evento de clique para selecionar texto
    textsContainer.addEventListener('click', (e) => {
        const textElement = e.target.closest('.text-overlay');
        if (textElement) {
            selectText(textElement);
        }
    });

    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}); 