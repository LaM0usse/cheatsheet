// Configuration storage
let config = {
    ip: '',
    target: '',
    url: '',
    port: '',
    user: '',
    password: '',
    wordlist: '',
    dirlist: ''
};

// Load configuration from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    loadTheme();
    setupNavigation(); // Moved here
    setupInputEvents();
    setupClearButton();
    setupThemeToggle();
    
    // Load initial page (Accueil)
    loadPageContent('home');
});

// Navigation setup
function setupNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        e.preventDefault();
        
        // Remove active class from all links
        navMenu.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Load corresponding page
        const pageId = link.getAttribute('data-page');
        loadPageContent(pageId);
    });
}

// Setup input field events
function setupInputEvents() {
    const inputs = ['ip', 'target', 'url', 'port', 'user', 'password', 'wordlist', 'dirlist'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Update config on input change
            input.addEventListener('input', () => {
                config[inputId] = input.value;
                updateVariables();
            });
        }
    });
}

// Setup clear button
function setupClearButton() {
    const clearBtn = document.getElementById('clearBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear all input fields
            const inputs = ['ip', 'target', 'url', 'port', 'user', 'password', 'wordlist', 'dirlist'];
            
            inputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = '';
                }
                config[inputId] = '';
            });
            
            // Save cleared config
            saveConfig();
            
            // Update variables in the document
            updateVariables();
            
            // Visual feedback
            const originalHTML = clearBtn.innerHTML;
            clearBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span></span>';
            clearBtn.style.background = 'rgba(34, 197, 94, 0.1)';
            clearBtn.style.color = '#22c55e';
            clearBtn.style.borderColor = '#22c55e';
            
            setTimeout(() => {
                clearBtn.innerHTML = originalHTML;
                clearBtn.style.background = '';
                clearBtn.style.color = '';
                clearBtn.style.borderColor = '';
            }, 1500);
        });
    }
}

// Update all variables in the document
function updateVariables() {
    const variables = document.querySelectorAll('.variable');
    
    variables.forEach(variable => {
        const varName = variable.getAttribute('data-var');
        if (config[varName]) {
            variable.textContent = config[varName];
            variable.style.color = '#4ec9b0';
        } else {
            variable.textContent = varName.toUpperCase();
            variable.style.color = '#ce9178';
        }
    });
}

// Save configuration to localStorage
function saveConfig() {
    try {
        localStorage.setItem('cheatsheet-config', JSON.stringify(config));
        console.log('Configuration sauvegardée:', config);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('Erreur lors de la sauvegarde de la configuration');
    }
}

// Load configuration from localStorage
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem('cheatsheet-config');
        if (savedConfig) {
            config = JSON.parse(savedConfig);
            
            // Populate input fields with saved values
            Object.keys(config).forEach(key => {
                const input = document.getElementById(key);
                if (input && config[key]) {
                    input.value = config[key];
                }
            });
            
            console.log('Configuration chargée:', config);
        }
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}

// Copy to clipboard functionality (deprecated - replaced by setupCopyButtons)
// Keeping for backward compatibility with non-button code blocks
document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Check if clicked on a code block that doesn't have a copy button
    if ((target.classList.contains('code-block') || target.closest('.code-block')) && 
        !target.classList.contains('btn-copy') && 
        !target.closest('.btn-copy')) {
        
        const codeBlock = target.classList.contains('code-block') ? target : target.closest('.code-block');
        const codeElement = codeBlock.querySelector('code');
        
        // Skip if this code block has a copy button
        if (codeBlock.querySelector('.btn-copy')) return;
        
        if (codeElement) {
            const code = codeElement.textContent;
            
            navigator.clipboard.writeText(code).then(() => {
                // Visual feedback
                const originalBg = codeBlock.style.background;
                codeBlock.style.background = '#2d5016';
                codeBlock.style.transition = 'background 0.3s ease';
                
                setTimeout(() => {
                    codeBlock.style.background = originalBg || '';
                }, 1000);
            }).catch(err => {
                console.error('Erreur de copie:', err);
            });
        }
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveConfig();
        
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.click();
        }
    }
    
    // Navigation shortcuts (Alt + number)
    if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const navLinks = document.querySelectorAll('.nav-link');
        const index = parseInt(e.key) - 1;
        if (navLinks[index]) {
            navLinks[index].click();
        }
    }
});

// Export configuration
function exportConfig() {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cheatsheet-config.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Import configuration
function importConfig(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedConfig = JSON.parse(e.target.result);
            config = { ...config, ...importedConfig };
            loadConfig();
            updateVariables();
            saveConfig();
            alert('Configuration importée avec succès!');
        } catch (error) {
            alert('Erreur lors de l\'importation du fichier');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// Setup theme toggle
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            toggleTheme();
        });
    }
}

// Toggle theme between light and dark
function toggleTheme() {
    const body = document.body;
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    const isDark = body.classList.toggle('dark-mode');
    
    // Update icon
    if (moonIcon && sunIcon) {
        if (isDark) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    }
    
    // Save preference
    localStorage.setItem('cheatsheet-theme', isDark ? 'dark' : 'light');
    
    console.log('Thème changé:', isDark ? 'sombre' : 'clair');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('cheatsheet-theme');
    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (moonIcon && sunIcon) {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        }
    }
}

// Update sidebar with current page sections
function updateSidebar() {
    const sidebar = document.getElementById('sidebarNav');
    const activePage = document.querySelector('.page.active');
    
    if (!sidebar || !activePage) return;
    
    // Clear current sidebar links
    sidebar.innerHTML = '';
    
    // Get all h2 and h3 elements inside card headers from the active page
    const headings = activePage.querySelectorAll('.card-header h2, .card-header h3');
    
    if (headings.length === 0) {
        // If no headings, hide sidebar or show message
        sidebar.innerHTML = '<div style="padding: 0 1.5rem; color: var(--text-secondary); font-size: 0.85rem;">Aucune section disponible</div>';
        return;
    }
    
    // Create links for each heading
    headings.forEach((heading, index) => {
        // Add an id to the heading if it doesn't have one
        if (!heading.id) {
            heading.id = `section-${index}`;
        }
        
        // Create link
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.className = 'sidebar-link';
        link.textContent = heading.textContent;
        
        // Add click event
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all sidebar links
            sidebar.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');

            // Find the card corresponding au titre
            const card = heading.closest('.card') || heading;

            // Si c'est une card «collapsible», on l'ouvre
            if (card.classList.contains('collapsible')) {
                card.classList.remove('collapsed');
            }

            // Laisser le navigateur gérer le scroll via l'ancre
            // (plus robuste et cohérent pour toutes les pages)
            window.location.hash = heading.id;
        });
        
        sidebar.appendChild(link);
    });
    
    // Highlight the first section by default
    const firstLink = sidebar.querySelector('.sidebar-link');
    if (firstLink) {
        firstLink.classList.add('active');
    }
}

// Update sidebar active link on scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        
        const headings = activePage.querySelectorAll('.card-header h2, .card-header h3');
        const sidebar = document.getElementById('sidebarNav');
        if (!sidebar) return;
        
        let currentSection = null;
        const scrollPosition = window.scrollY + 150; // Offset for navbar
        
        headings.forEach(heading => {
            if (heading.offsetTop <= scrollPosition) {
                currentSection = heading.id;
            }
        });
        
        if (currentSection) {
            // Remove active class from all links
            sidebar.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    }, 100);
});

// Load page content dynamically
async function loadPageContent(pageId) {
    const contentSection = document.querySelector('.content-section');
    if (!contentSection) return;
    
    // Map page IDs to file names
    const pageFiles = {
        'home': 'pages/home.html',
        'enumeration': 'pages/enumeration.html',
        'webvuln': 'pages/webvuln.html',
        'exploitation': 'pages/exploitation.html',
        'shells': 'pages/shells.html',
        'other': 'pages/other.html'
    };
    
    const pageFile = pageFiles[pageId];
    if (!pageFile) {
        console.error('Page introuvable:', pageId);
        return;
    }
    
    try {
        // Show loading state
        contentSection.innerHTML = '<div class="page active"><p>Chargement...</p></div>';
        
        // Fetch page content (no cache to voir les dernières modifs)
        const response = await fetch(`${pageFile}?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const content = await response.text();
        
        // Insert content
        contentSection.innerHTML = `<div class="page active" id="${pageId}">${content}</div>`;
        
        // Reinitialize components
        updateVariables();
        updateSidebar();
        setupCollapsibleCards();
        setupCopyButtons();
        applySyntaxHighlighting();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        contentSection.innerHTML = `
            <div class="page active">
                <h1>Erreur</h1>
                <div class="card">
                    <p>Impossible de charger le contenu de la page.</p>
                    <p>Erreur: ${error.message}</p>
                </div>
            </div>
        `;
    }
}

// Setup collapsible cards
function setupCollapsibleCards() {
    const collapsibleCards = document.querySelectorAll('.card.collapsible');
    
    collapsibleCards.forEach(card => {
        const header = card.querySelector('.card-header');
        
        if (header) {
            // Remove existing listeners to prevent duplicates
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
            
            newHeader.addEventListener('click', () => {
                card.classList.toggle('collapsed');
            });
        }
    });
}

// Setup copy buttons
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.btn-copy');
    
    copyButtons.forEach(button => {
        // Remove existing listeners to prevent duplicates
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent triggering card collapse
            
            const codeBlock = newButton.closest('.code-block');
            const codeElement = codeBlock.querySelector('code');
            
            if (!codeElement) return;
            
            // Get code text and remove variable spans for copying
            let codeText = '';
            codeElement.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    codeText += node.textContent;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList.contains('variable')) {
                        // Use the actual value from config if available
                        const varName = node.getAttribute('data-var');
                        codeText += config[varName] || node.textContent;
                    } else {
                        codeText += node.textContent;
                    }
                }
            });
            
            try {
                await navigator.clipboard.writeText(codeText.trim());
                
                // Visual feedback
                newButton.classList.add('copied');
                
                setTimeout(() => {
                    newButton.classList.remove('copied');
                }, 1500);
                
            } catch (error) {
                console.error('Erreur lors de la copie:', error);
                alert('Impossible de copier dans le presse-papiers');
            }
        });
    });
}

// Apply syntax highlighting to code blocks
function applySyntaxHighlighting() {
    const codeBlocks = document.querySelectorAll('.code-block code');
    
    codeBlocks.forEach(codeElement => {
        // Skip if already highlighted
        if (codeElement.dataset.highlighted === 'true') return;

        // Skip blocks marqués comme "no-highlight" (cas spéciaux SQLi, etc.)
        const parentBlock = codeElement.closest('.code-block');
        if (parentBlock && parentBlock.classList.contains('no-highlight')) {
            codeElement.dataset.highlighted = 'true';
            return;
        }
        
        // Get the original text content while preserving variable spans
        let plainText = '';
        const variableMap = [];
        
        codeElement.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                plainText += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('variable')) {
                // Store variable info and use placeholder
                const placeholder = `{{VAR_${variableMap.length}}}`;
                variableMap.push({
                    placeholder: placeholder,
                    dataVar: node.getAttribute('data-var'),
                    text: node.textContent
                });
                plainText += placeholder;
            }
        });
        
        if (!plainText.trim()) return;

        // Si le code contient des chevrons (< ou >), on ne touche pas
        // au contenu pour éviter de "réactiver" des payloads HTML/JS
        // comme <script>alert('XSS')</script>.
        if (plainText.includes('<') || plainText.includes('>')) {
            codeElement.dataset.highlighted = 'true';
            return;
        }
        
        // Apply syntax highlighting with regex patterns
        let highlightedText = plainText;
        
        // Protect variable placeholders from being modified
        const protectedVars = [];
        variableMap.forEach((varInfo, index) => {
            const tempPlaceholder = `__PROTECTED_VAR_${index}__`;
            highlightedText = highlightedText.replace(varInfo.placeholder, tempPlaceholder);
            protectedVars.push(tempPlaceholder);
        });
        
        // Comments (# ...), mais on ignore les payloads type #{7*7} (SSTI)
        highlightedText = highlightedText.replace(/(^|[^&])#(?!\{)([^<\n]*)/gm, '$1<span class="comment">#$2</span>');
        
        // Strings in single or double quotes
        highlightedText = highlightedText.replace(/'([^']*?)'/g, '<span class="string">\'$1\'</span>');
        highlightedText = highlightedText.replace(/"([^"]*?)"/g, '<span class="string">"$1"</span>');
        
        // Flags (-x or --xxx)
        highlightedText = highlightedText.replace(/(\s|^)(--?[a-zA-Z0-9_-]+)(?=\s|$|<)/g, '$1<span class="flag">$2</span>');
        
        // Numbers
        highlightedText = highlightedText.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
        
        // Common commands (at start or after space/pipe/semicolon)
        const commands = ['sudo', 'bash', 'sh', 'python', 'python3', 'php', 'ruby', 'perl', 'node', 'curl', 'wget', 'nc', 'netcat', 'nmap', 'sqlmap', 'nikto', 'gobuster', 'ffuf', 'wfuzz', 'hydra', 'john', 'hashcat', 'msfconsole', 'msfvenom', 'searchsploit', 'exploit', 'smbclient', 'smbmap', 'enum4linux', 'rpcclient', 'ldapsearch', 'dig', 'nslookup', 'host', 'dnsrecon', 'dnsenum', 'cat', 'grep', 'sed', 'awk', 'cut', 'sort', 'uniq', 'echo', 'printf', 'find', 'locate', 'which', 'whereis', 'ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'chmod', 'chown', 'tar', 'gzip', 'gunzip', 'base64', 'xxd', 'strings', 'file', 'stat', 'whoami', 'id', 'uname', 'hostname', 'ifconfig', 'ip', 'netstat', 'ss', 'ps', 'top', 'kill', 'pkill', 'service', 'systemctl', 'journalctl', 'crontab', 'at', 'ssh', 'scp', 'sftp', 'ftp', 'telnet', 'rdesktop', 'xfreerdp', 'powershell', 'cmd', 'certutil', 'Invoke-WebRequest', 'iex', 'IEX', 'Get-ChildItem', 'Get-Content'];
        
        commands.forEach(cmd => {
            // Match command at start, after space, pipe, semicolon, or newline
            const regex = new RegExp(`(^|\\s|\\||;|\\n)(${cmd})(?=\\s|$|\\||;|<|&)`, 'gi');
            highlightedText = highlightedText.replace(regex, '$1<span class="function">$2</span>');
        });
        
        // Restore variable placeholders
        protectedVars.forEach((tempPlaceholder, index) => {
            const varInfo = variableMap[index];
            const varSpan = `<span class="variable" data-var="${varInfo.dataVar}">${varInfo.text}</span>`;
            highlightedText = highlightedText.replace(tempPlaceholder, varSpan);
        });
        
        // Update the code element with highlighted HTML
        codeElement.innerHTML = highlightedText;
        codeElement.dataset.highlighted = 'true';
    });
}
