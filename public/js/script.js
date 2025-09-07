document.addEventListener('DOMContentLoaded', () => {


    
    // // --- Sidebar Navigation for app.html ---
    // const STORAGE_KEY = 'studybuddy-theme';
    // const ICONS = { light: 'fa-moon', dark: 'fa-sun' };
    const sidebarLinks = document.querySelectorAll('.sidebar-nav ul li a');
    const sections = document.querySelectorAll('.content-area section');



//  function applyTheme(theme) {
//     document.documentElement.setAttribute('data-theme', theme);
//     document.querySelectorAll('.theme-toggle i').forEach(icon => {
//       icon.classList.remove(...Object.values(ICONS));
//       icon.classList.add(theme === 'dark' ? ICONS.dark : ICONS.light);
//     });
//     localStorage.setItem(STORAGE_KEY, theme);
//   }

//   function toggleTheme() {
//     const current = document.documentElement.getAttribute('data-theme');
//     const newTheme = current === 'dark' ? 'light' : 'dark';
//     applyTheme(newTheme);
//   }

//   applyTheme(localStorage.getItem(STORAGE_KEY) || 'light');
//   document.querySelectorAll('.theme-toggle').forEach(btn =>
//     btn.addEventListener('click', toggleTheme)
//   );
    

    

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1); // Get section ID

            // Remove active class from all links and add to clicked link
            sidebarLinks.forEach(item => item.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');

            // Hide all sections and show the target section
            sections.forEach(section => section.classList.remove('active-section'));
            sections.forEach(section => section.classList.add('hidden-section'));

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
            }
        });
    });

    // --- File Upload Logic for app.html ---
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const generateContentBtn = document.getElementById('generateContentBtn');
    const uploadStatus = document.getElementById('uploadStatus');

    let uploadedFiles = [];

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        if (dropArea) { // Check if dropArea exists (only on app.html)
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false); // Prevent opening file in browser
        }
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        if (dropArea) {
            dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
        }
    });

    ['dragleave', 'drop'].forEach(eventName => {
        if (dropArea) {
            dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
        }
    });

    // Handle dropped files
    if (dropArea) {
        dropArea.addEventListener('drop', handleDrop, false);
        dropArea.addEventListener('click', () => fileInput.click(), false); // Click to open file dialog
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files), false);
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        ([...files]).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                displayUploadStatus(`File "${file.name}" is too large (max 10MB).`, 'error');
                return;
            }
            if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'].includes(file.type)) {
                displayUploadStatus(`File "${file.name}" is not a supported format.`, 'error');
                return;
            }
            uploadedFiles.push(file);
            renderFileList();
        });
        checkGenerateButtonStatus();
    }

    function renderFileList() {
        if (!fileList) return; // Guard for non-existent element

        fileList.innerHTML = '';
        if (uploadedFiles.length === 0) {
            fileList.style.display = 'none';
        } else {
            fileList.style.display = 'block';
            uploadedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.innerHTML = `
                    <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <span class="remove-file" data-index="${index}"><i class="fas fa-times"></i></span>
                `;
                fileList.appendChild(fileItem);
            });

            // Add event listeners for remove buttons
            fileList.querySelectorAll('.remove-file').forEach(removeBtn => {
                removeBtn.addEventListener('click', (e) => {
                    const indexToRemove = parseInt(e.currentTarget.dataset.index);
                    uploadedFiles.splice(indexToRemove, 1); // Remove from array
                    renderFileList(); // Re-render the list
                    checkGenerateButtonStatus();
                });
            });
        }
    }

    function checkGenerateButtonStatus() {
        if (generateContentBtn) {
            generateContentBtn.disabled = uploadedFiles.length === 0;
        }
    }

    function displayUploadStatus(message, type = 'info') {
        if (!uploadStatus) return;
        uploadStatus.textContent = message;
        uploadStatus.style.display = 'block';
        uploadStatus.style.backgroundColor = type === 'error' ? '#ff6b6b' : '#393e46';
        setTimeout(() => {
            uploadStatus.style.display = 'none';
        }, 5000);
    }

    // Initial render call
    renderFileList();
    checkGenerateButtonStatus();

    // Handle "Generate Content" button click (Placeholder for AI integration)
    if (generateContentBtn) {
        generateContentBtn.addEventListener('click', () => {
            if (uploadedFiles.length > 0) {
                displayUploadStatus('Generating content from your notes...', 'info');
                console.log('Generating content for:', uploadedFiles.map(file => file.name));
                // Here you would typically send these files to a backend for AI processing
                // and then update the summaries, flashcards, and quizzes sections.
                // For now, we'll just simulate a delay.
                setTimeout(() => {
                    displayUploadStatus('Content generated successfully! Check other sections.', 'info');
                    // Optionally clear files after generation or move to a "processed" state
                    uploadedFiles = [];
                    renderFileList();
                    checkGenerateButtonStatus();
                    // You might want to automatically switch to another section, e.g., summaries
                    document.querySelector('.sidebar-nav ul li a[href="#summaries"]').click();
                }, 3000);
            } else {
                displayUploadStatus('Please upload at least one file to generate content.', 'error');
            }
        });
    }
});














