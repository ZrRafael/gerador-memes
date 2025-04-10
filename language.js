export const LanguageManager = {
    isEnglish: localStorage.getItem('language') === 'en',
    
    translations: {
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
            'name-required': 'O nome do meme é obrigatório.',
            'saved': 'Salvo',
            'downloaded': 'Baixado',
            'created-at': 'Criado em',
            'download': 'Baixar',
            'delete': 'Excluir',
            'confirm-delete': 'Tem certeza que deseja excluir este meme?',
            'no-memes': 'Nenhum meme criado ainda. Vá para o Editor para criar seu primeiro meme!',
            'error-loading': 'Erro ao carregar os memes. Por favor, tente novamente.',
            'error-deleting': 'Erro ao excluir o meme. Por favor, tente novamente.',
            'search-placeholder': 'Buscar memes...'
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
            'name-required': 'Meme name is required.',
            'saved': 'Saved',
            'downloaded': 'Downloaded',
            'created-at': 'Created at',
            'download': 'Download',
            'delete': 'Delete',
            'confirm-delete': 'Are you sure you want to delete this meme?',
            'no-memes': 'No memes created yet. Go to Editor to create your first meme!',
            'error-loading': 'Error loading memes. Please try again.',
            'error-deleting': 'Error deleting meme. Please try again.',
            'search-placeholder': 'Search memes...'
        }
    },

    init() {
        // Garantir que o idioma seja inicializado corretamente
        const savedLanguage = localStorage.getItem('language');
        this.isEnglish = savedLanguage === 'en';
        if (!savedLanguage) {
            localStorage.setItem('language', 'pt');
            this.isEnglish = false;
        }
    },

    toggleLanguage() {
        this.isEnglish = !this.isEnglish;
        localStorage.setItem('language', this.isEnglish ? 'en' : 'pt');
        return this.isEnglish;
    },

    getCurrentLanguage() {
        return this.isEnglish ? 'en' : 'pt';
    },

    getTranslation(key) {
        return this.translations[this.getCurrentLanguage()][key];
    },

    updateLanguageButton(button) {
        if (button) {
            const langText = button.querySelector('.lang-text');
            if (langText) {
                langText.textContent = this.isEnglish ? 'EN US' : 'BR PT';
            }
        }
    }
};

// Inicializar o LanguageManager quando o módulo é carregado
LanguageManager.init(); 