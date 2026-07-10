document.documentElement.removeAttribute('data-theme');
localStorage.setItem('theme', 'light');

const DESIGN_LABELS = {
  1: 'Option 1',
  2: 'Option 2',
  3: 'Option 3',
};

const EDITOR_LABELS = {
  editor: 'Editor',
  'new-editor': 'New editor',
};

function getDesign() {
  return document.documentElement.getAttribute('data-design') || '1';
}

function applyDesign(designId) {
  document.documentElement.setAttribute('data-design', designId);
  localStorage.setItem('designOption', designId);

  document.querySelectorAll('.design-switcher-item').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.design === designId);
  });

  const label = document.getElementById('design-switcher-label');
  if (label) label.textContent = DESIGN_LABELS[designId] || `Option ${designId}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtns = document.querySelectorAll('.toggle-btn[data-tab], .toggle-btn-compound-tab[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  const subToggleWrapper = document.getElementById('sub-toggle-wrapper');
  const subToggleBtns = document.querySelectorAll('.sub-toggle-btn');
  const editorPanels = document.querySelectorAll('.editor-panel');
  const toggleCompound = document.getElementById('toggle-compound');
  const compoundChevron = document.getElementById('editor-compound-chevron');
  const compoundMenu = document.getElementById('editor-compound-menu');
  const compoundLabel = document.getElementById('editor-compound-label');
  const compoundSparkle = document.getElementById('editor-compound-sparkle');
  const editorPickerPopup = document.getElementById('editor-picker-popup');
  const editorPickerBtns = document.querySelectorAll('.editor-picker-btn');

  function showSubToggle(show) {
    if (getDesign() === '2' || getDesign() === '3') {
      subToggleWrapper.setAttribute('hidden', '');
      return;
    }
    if (show) {
      subToggleWrapper.removeAttribute('hidden');
    } else {
      subToggleWrapper.setAttribute('hidden', '');
    }
  }

  function openEditorPopup() {
    if (getDesign() !== '3' || !editorPickerPopup) return;
    editorPickerPopup.removeAttribute('hidden');
    document.body.classList.add('editor-picker-open');
  }

  function closeEditorPopup() {
    if (!editorPickerPopup) return;
    editorPickerPopup.setAttribute('hidden', '');
    document.body.classList.remove('editor-picker-open');
  }

  function updateEditorPickerUI(editor) {
    editorPickerBtns.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.editor === editor);
    });
  }

  function updateCompoundUI(editor) {
    if (!compoundLabel) return;
    compoundLabel.textContent = EDITOR_LABELS[editor] || editor;
    if (compoundSparkle) {
      compoundSparkle.hidden = editor !== 'new-editor';
    }
    document.querySelectorAll('.editor-outline-menu button').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.editor === editor);
    });
  }

  function switchEditor(editor) {
    subToggleBtns.forEach(btn => {
      const isActive = btn.dataset.editor === editor;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    editorPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `editor-panel-${editor}`);
    });

    updateCompoundUI(editor);
    updateEditorPickerUI(editor);
  }

  window.__switchEditor = switchEditor;

  function activateTab(tab) {
    document.querySelectorAll('.toggle-btn[data-tab], .toggle-btn-compound-tab[data-tab]').forEach(b => {
      const isActive = b.dataset.tab === tab;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });

    if (toggleCompound) {
      toggleCompound.classList.toggle('is-selfmade-active', tab === 'selfmade');
    }

    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tab}`);
    });

    showSubToggle(tab === 'selfmade');

    if (getDesign() === '3') {
      if (tab === 'selfmade') {
        openEditorPopup();
      } else {
        closeEditorPopup();
      }
    }
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activateTab(btn.dataset.tab);
    });
  });

  editorPickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchEditor(btn.dataset.editor);
      closeEditorPopup();
    });
  });

  document.getElementById('editor-picker-backdrop')?.addEventListener('click', () => {
    closeEditorPopup();
  });

  subToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchEditor(btn.dataset.editor);
    });
  });

  compoundChevron?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = compoundChevron.getAttribute('aria-expanded') === 'true';
    compoundChevron.setAttribute('aria-expanded', String(!isOpen));
    compoundMenu.hidden = isOpen;
  });

  document.querySelectorAll('.editor-outline-menu button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchEditor(btn.dataset.editor);
      compoundChevron.setAttribute('aria-expanded', 'false');
      compoundMenu.hidden = true;
      activateTab('selfmade');
    });
  });

  document.getElementById('editor-compound-label-btn')?.addEventListener('click', () => {
    activateTab('selfmade');
  });

  document.addEventListener('click', () => {
    if (!compoundMenu || compoundMenu.hidden) return;
    compoundChevron.setAttribute('aria-expanded', 'false');
    compoundMenu.hidden = true;
  });

  compoundMenu?.addEventListener('click', (e) => e.stopPropagation());

  const saved = localStorage.getItem('designOption') || '1';
  applyDesign(saved);
  switchEditor(saved === '2' ? 'new-editor' : 'editor');

  const switcherBtn = document.getElementById('design-switcher-btn');
  const switcherMenu = document.getElementById('design-switcher-menu');

  switcherBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = switcherBtn.getAttribute('aria-expanded') === 'true';
    switcherBtn.setAttribute('aria-expanded', String(!isOpen));
    switcherMenu.hidden = isOpen;
  });

  document.querySelectorAll('.design-switcher-item').forEach(btn => {
    btn.addEventListener('click', () => {
      applyDesign(btn.dataset.design);
      if (btn.dataset.design === '2') switchEditor('new-editor');
      if (btn.dataset.design !== '3') closeEditorPopup();
      const activeTab = document.querySelector('.toggle-btn.active[data-tab], .toggle-btn-compound-tab.active[data-tab]');
      if (btn.dataset.design === '3' && activeTab?.dataset.tab === 'selfmade') {
        openEditorPopup();
      }
      switcherBtn.setAttribute('aria-expanded', 'false');
      switcherMenu.hidden = true;
    });
  });

  document.addEventListener('click', () => {
    if (!switcherMenu || switcherMenu.hidden) return;
    switcherBtn.setAttribute('aria-expanded', 'false');
    switcherMenu.hidden = true;
  });

  switcherMenu?.addEventListener('click', (e) => e.stopPropagation());

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => observer.observe(el));
    document.querySelectorAll('.hero .reveal').forEach(el => {
      el.classList.add('is-visible');
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('is-visible');
    });
  }
});
