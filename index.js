const config = {
            wordsPerMinute: 200, // Vitesse de lecture moyenne
            maxDensityItems: 5,  // Nombre d'éléments de densité affichés par défaut
            animationDuration: 300 // Durée des animations en ms
        };

        let isExpanded = false;

        // ============================================
        // SÉLECTION DES ÉLÉMENTS DOM
        // ============================================
        
        const elements = {
            textInput: document.getElementById('textInput'),
            excludeSpaces: document.getElementById('excludeSpaces'),
            setLimit: document.getElementById('setLimit'),
            totalChars: document.getElementById('totalChars'),
            wordCount: document.getElementById('wordCount'),
            sentenceCount: document.getElementById('sentenceCount'),
            readingTime: document.getElementById('readingTime'),
            densityList: document.getElementById('densityList'),
            seeMoreBtn: document.getElementById('seeMoreBtn')
        };

        // ============================================
        // FONCTIONS D'ANALYSE DE TEXTE
        // ============================================

        /**
         * Calcule le nombre de caractères
         * @param {string} text - Le texte à analyser
         * @param {boolean} excludeSpaces - Exclure les espaces
         * @returns {number}
         */
        function countCharacters(text, excludeSpaces = false) {
            if (excludeSpaces) {
                return text.replace(/\s/g, '').length;
            }
            return text.length;
        }

        /**
         * Calcule le nombre de mots
         * @param {string} text - Le texte à analyser
         * @returns {number}
         */
        function countWords(text) {
            // Supprime les espaces multiples et trim
            const trimmed = text.trim();
            if (trimmed === '') return 0;
            
            // Split par espaces et filtre les éléments vides
            return trimmed.split(/\s+/).filter(word => word.length > 0).length;
        }

        /**
         * Calcule le nombre de phrases
         * @param {string} text - Le texte à analyser
         * @returns {number}
         */
        function countSentences(text) {
            if (text.trim() === '') return 0;
            
            // Détecte les fins de phrases (., !, ?)
            const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
            return sentences.length;
        }

        /**
         * Calcule le temps de lecture approximatif
         * @param {number} wordCount - Nombre de mots
         * @returns {string}
         */
        function calculateReadingTime(wordCount) {
            if (wordCount === 0) return '0 minute';
            
            const minutes = Math.ceil(wordCount / config.wordsPerMinute);
            
            if (minutes === 1) return '1 minute';
            if (minutes < 60) return `${minutes} minutes`;
            
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return hours === 1 ? '1 hour' : `${hours} hours`;
            }
            
            return `${hours}h ${remainingMinutes}min`;
        }

        /**
         * Calcule la densité des lettres dans le texte
         * @param {string} text - Le texte à analyser
         * @returns {Array} Tableau d'objets {letter, count, percentage}
         */
        function calculateLetterDensity(text) {
            // Convertit en minuscules et garde seulement les lettres
            const letters = text.toLowerCase().replace(/[^a-zàâäéèêëïîôùûüÿæœç]/g, '');
            
            if (letters.length === 0) return [];
            
            // Compte chaque lettre
            const letterCount = {};
            for (const letter of letters) {
                letterCount[letter] = (letterCount[letter] || 0) + 1;
            }
            
            // Convertit en tableau et calcule les pourcentages
            const density = Object.entries(letterCount).map(([letter, count]) => ({
                letter,
                count,
                percentage: (count / letters.length) * 100
            }));
            
            // Trie par fréquence décroissante
            return density.sort((a, b) => b.count - a.count);
        }

        // ============================================
        // FONCTIONS D'AFFICHAGE
        // ============================================

        /**
         * Anime un nombre qui change
         * @param {HTMLElement} element - L'élément à animer
         * @param {number} newValue - La nouvelle valeur
         */
        function animateNumber(element, newValue) {
            const currentValue = parseInt(element.textContent) || 0;
            const difference = newValue - currentValue;
            const steps = 20;
            const stepValue = difference / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                if (currentStep >= steps) {
                    element.textContent = newValue;
                    clearInterval(interval);
                } else {
                    element.textContent = Math.round(currentValue + (stepValue * currentStep));
                }
            }, config.animationDuration / steps);
        }

        /**
         * Affiche la densité des lettres
         * @param {Array} density - Tableau de densité
         * @param {boolean} showAll - Afficher toutes les lettres
         */
        function displayLetterDensity(density, showAll = false) {
            const itemsToShow = showAll ? density : density.slice(0, config.maxDensityItems);
            
            elements.densityList.innerHTML = itemsToShow.map(item => `
                <div class="density-item">
                    <div class="letter">${item.letter}</div>
                    <div class="bar-container">
                        <div class="bar" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="percentage">${item.count} (${item.percentage.toFixed(2)}%)</div>
                </div>
            `).join('');

            // Met à jour le bouton "See more"
            if (density.length > config.maxDensityItems) {
                elements.seeMoreBtn.style.display = 'flex';
                elements.seeMoreBtn.querySelector('span').textContent = showAll ? '▲' : '▼';
            } else {
                elements.seeMoreBtn.style.display = 'none';
            }
        }

        /**
         * Met à jour tous les compteurs et statistiques
         */
        function updateAnalysis() {
            const text = elements.textInput.value;
            const excludeSpaces = elements.excludeSpaces.checked;

            // Calcule toutes les métriques
            const chars = countCharacters(text, excludeSpaces);
            const words = countWords(text);
            const sentences = countSentences(text);
            const density = calculateLetterDensity(text);

            // Met à jour l'affichage avec animations
            animateNumber(elements.totalChars, chars);
            animateNumber(elements.wordCount, words);
            animateNumber(elements.sentenceCount, sentences);

            // Met à jour le temps de lecture
            elements.readingTime.textContent = calculateReadingTime(words);

            // Met à jour la densité des lettres
            displayLetterDensity(density, isExpanded);
        }

        // ============================================
        // GESTIONNAIRES D'ÉVÉNEMENTS
        // ============================================

        // Analyse en temps réel lors de la saisie
        elements.textInput.addEventListener('input', updateAnalysis);

        // Recalcule lors du changement d'options
        elements.excludeSpaces.addEventListener('change', updateAnalysis);

        // Gestion du bouton "See more"
        elements.seeMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            const text = elements.textInput.value;
            const density = calculateLetterDensity(text);
            displayLetterDensity(density, isExpanded);
        });

        // Gestion de la limite de caractères (optionnelle)
        elements.setLimit.addEventListener('change', (e) => {
            if (e.target.checked) {
                const limit = prompt('Enter character limit:', '500');
                if (limit && !isNaN(limit)) {
                    elements.textInput.maxLength = parseInt(limit);
                } else {
                    e.target.checked = false;
                }
            } else {
                elements.textInput.removeAttribute('maxlength');
            }
        });

        // ============================================
        // INITIALISATION
        // ============================================

        // Met le texte par défaut et lance l'analyse initiale
        window.addEventListener('DOMContentLoaded', () => {
            const defaultText = "Design is the silent ambassador of your brand. Simplicity is key to effective communication, creating clarity in every interaction. A great design transforms complex ideas into elegant solutions, making them easy to understand. It blends aesthetics and functionality seamlessly.";
            elements.textInput.value = defaultText;
            updateAnalysis();
        });

        // ============================================
        // FONCTIONNALITÉS BONUS
        // ============================================

        // Sauvegarde automatique dans localStorage
        elements.textInput.addEventListener('input', () => {
            localStorage.setItem('savedText', elements.textInput.value);
        });

        // Restaure le texte sauvegardé au chargement
        const savedText = localStorage.getItem('savedText');
        if (savedText) {
            elements.textInput.value = savedText;
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S pour sauvegarder (empêche le comportement par défaut)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                console.log('Text saved to localStorage');
            }
            
            // Ctrl/Cmd + L pour effacer
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                if (confirm('Clear all text?')) {
                    elements.textInput.value = '';
                    updateAnalysis();
                }
            }
        });