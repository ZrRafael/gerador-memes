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
            remove: 'Remover',
            color: 'Cor',
            size: 'Tamanho',
            text: 'Texto',
            title: 'Gerador de Memes'
        },
        en: {
            chooseimage: 'Choose Image',
            addtext: 'Add Text',
            applytoall: 'Apply to All',
            downloadmeme: 'Download Meme',
            remove: 'Remove',
            color: 'Color',
            size: 'Size',
            text: 'Text',
            title: 'Meme Generator'
        }
    };

    // Tema
    themeToggle.setAttribute('data-theme', 'dark');
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('light-theme');
        document.body.classList.toggle('light-theme');
        themeToggle.setAttribute('data-theme', isDark ? 'dark' : 'light');
    });

    // Idioma
    languageToggle.addEventListener('click', () => {
        isEnglish = !isEnglish;
        const langText = languageToggle.querySelector('.lang-text');
        langText.textContent = isEnglish ? 'EN US' : 'BR PT';
        updateTexts();
        updateAllTextOverlays();
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

        // Atualizar textos dos editores existentes
        document.querySelectorAll('.text-editor').forEach(editor => {
            const removeBtn = editor.querySelector('.remove-text-btn');
            const colorLabel = editor.querySelector('.text-editor-controls label:first-child');
            const sizeLabel = editor.querySelector('.text-editor-controls label:last-child');
            
            if (removeBtn) removeBtn.textContent = translations[currentLang].remove;
            if (colorLabel) {
                const colorInput = colorLabel.querySelector('input');
                colorLabel.innerHTML = `${translations[currentLang].color}: `;
                colorLabel.appendChild(colorInput);
            }
            if (sizeLabel) {
                const sizeInput = sizeLabel.querySelector('input');
                sizeLabel.innerHTML = `${translations[currentLang].size}: `;
                sizeLabel.appendChild(sizeInput);
            }
        });
    }

    function updateAllTextOverlays() {
        const currentLang = isEnglish ? 'en' : 'pt';
        document.querySelectorAll('.text-overlay').forEach(text => {
            // Verifica se o texto segue o padrão padrão "Texto N" ou "Text N"
            const ptPattern = /^Texto\s+\d+$/;
            const enPattern = /^Text\s+\d+$/;
            
            if (ptPattern.test(text.textContent) || enPattern.test(text.textContent)) {
                const number = text.textContent.match(/\d+$/)[0];
                const newText = `${translations[currentLang].text} ${number}`;
                text.textContent = newText;
                
                // Atualiza também o título no editor
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
            alert('Por favor, carregue uma imagem primeiro!');
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
            alert('Adicione pelo menos um texto primeiro!');
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

    // Download da imagem
    downloadBtn.addEventListener('click', () => {
        if (!imageLoaded) {
            alert('Por favor, carregue uma imagem primeiro!');
            return;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = memeImage.naturalWidth;
        canvas.height = memeImage.naturalHeight;
        
        ctx.drawImage(memeImage, 0, 0);
        
        const texts = document.querySelectorAll('.text-overlay');
        texts.forEach(text => {
            const x = parseFloat(text.getAttribute('data-x')) || 0;
            const y = parseFloat(text.getAttribute('data-y')) || 0;
            
            ctx.font = `${text.style.fontSize || '30px'} Arial`;
            ctx.fillStyle = text.style.color || '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const textX = canvas.width / 2 + x;
            const textY = canvas.height / 2 + y;
            
            ctx.fillText(text.textContent, textX, textY);
        });
        
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

    // Evento de clique para selecionar texto
    textsContainer.addEventListener('click', (e) => {
        const textElement = e.target.closest('.text-overlay');
        if (textElement) {
            selectText(textElement);
        }
    });
}); 