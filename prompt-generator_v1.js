<script>
/**
 * Prompt Generator V4 — UI Controller
 * ======================================
 * Fungsi yang diimplementasikan (UI saja, belum generator):
 *   1. Toggle sidebar aside (expand/collapse) — default: TERTUTUP
 *   2. Toggle panel Layer Map — default: TERTUTUP
 *   3. Collapsed-icons: klik ikon → expand sidebar + scroll ke section
 *   4. Slider weight: perbarui nilai tampilan saat digeser
 *
 * Tombol toggle sidebar : #toggleBtn (di dalam aside header)
 * Tombol toggle layer map: #toggleBtnMain (di topbar kiri — sesuai file asli)
 */

(function () {
  'use strict';

  // ==================== CACHE ELEMEN DOM ====================
  // Kumpulkan semua elemen yang sering diakses agar tidak query ulang
  const DOM = {
    sidebar      : null,   // Elemen <aside id="sidebar">
    btnAside     : null,   // Tombol ☰ di dalam header sidebar → toggle aside
    btnMain      : null,   // Tombol 🗺 di topbar → toggle layer map (BUKAN toggle aside)
    panelLayerMap: null,   // Panel layer architecture di main content
    menuTree     : null,   // Nav .menu-tree (scrollable form sidebar)
    collapsedIcons: null,  // Nav #collapsedIcons (ikon kecil saat collapsed)
    ciBtns       : null,   // Semua button di collapsed-icons
    weightSliders: null    // Semua input[type=range] di panel weight
  };

  // ==================== STATE APLIKASI ====================
  // Simpan status UI saat ini
  const state = {
    sidebarCollapsed : true,   // Default: sidebar TERTUTUP saat pertama buka
    layerMapVisible  : false   // Default: layer map TERTUTUP saat pertama buka
  };

  // ==================== INISIALISASI ====================
  function init() {
    // Ambil semua referensi elemen DOM
    cacheDOM();

    // Pasang event listener
    bindEvents();

    // Terapkan state default (sidebar tutup, layer map tutup)
    applySidebarState();
    applyLayerMapState();
  }

  // ==================== CACHE DOM ====================
  function cacheDOM() {
    DOM.sidebar       = document.getElementById('sidebar');
    DOM.btnAside      = document.getElementById('toggleBtn');      // tombol ☰ di dalam aside
    DOM.btnMain       = document.getElementById('toggleBtnMain');  // tombol 🗺 di topbar → toggle layer map
    DOM.panelLayerMap = document.getElementById('panelLayerMap');
    DOM.menuTree      = DOM.sidebar ? DOM.sidebar.querySelector('.menu-tree') : null;
    DOM.collapsedIcons= document.getElementById('collapsedIcons');
    DOM.ciBtns        = DOM.collapsedIcons
                          ? DOM.collapsedIcons.querySelectorAll('.ci-btn')
                          : [];
    // Slider weight ada di sub-body section weights
    DOM.weightSliders = document.querySelectorAll('.weight-grid input[type=range]');
  }

  // ==================== PASANG EVENT LISTENER ====================
  function bindEvents() {
    // Tombol ☰ di header aside → toggle sidebar (expand/collapse)
    if (DOM.btnAside) {
      DOM.btnAside.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Tombol 🗺 di topbar → toggle Layer Map panel (BUKAN toggle sidebar)
    if (DOM.btnMain) {
      DOM.btnMain.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleLayerMap(); // sesuai file asli: toggleBtnMain memanggil togglePanelMap
      });
    }

    // Klik ikon di collapsed-icons: expand sidebar lalu scroll ke section
    DOM.ciBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        // Expand sidebar dulu jika masih tertutup
        if (state.sidebarCollapsed) {
          state.sidebarCollapsed = false;
          applySidebarState();
        }
        // Scroll ke section yang dituju dan buka <details>-nya
        scrollToSection(targetId);
      });
    });

    // Update tampilan nilai slider weight saat digeser
    DOM.weightSliders.forEach(function (slider) {
      // Cari elemen .slider-val atau .w-val terdekat sebagai display nilai
      slider.addEventListener('input', function () {
        var display = findSliderDisplay(slider);
        if (display) {
          display.textContent = parseFloat(slider.value).toFixed(
            slider.step && slider.step.includes('.') ? 1 : 0
          );
        }
      });
    });
  }

  // ==================== TOGGLE SIDEBAR ====================
  // Dipanggil oleh btnAside DAN btnMain (keduanya toggle sidebar)
  function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    applySidebarState();
  }

  // Terapkan state sidebar ke DOM
  function applySidebarState() {
    if (!DOM.sidebar) return;

    // Toggle class 'collapsed' pada elemen aside
    DOM.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);

    // Perbarui ikon tombol ☰/← di header aside saja
    if (DOM.btnAside) {
      DOM.btnAside.innerHTML = state.sidebarCollapsed ? '☰' : '←';
      DOM.btnAside.title     = state.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
    }
    // Catatan: btnMain adalah tombol layer map, tidak perlu diupdate di sini
    // Tampilan .menu-tree dan .collapsed-icons dikontrol via CSS class 'collapsed'
  }

  // ==================== TOGGLE LAYER MAP ====================
  // TERPISAH dari toggle sidebar — hanya kontrol panel #panelLayerMap
  function toggleLayerMap() {
    state.layerMapVisible = !state.layerMapVisible;
    applyLayerMapState();
  }

  // Terapkan state layer map ke DOM
  function applyLayerMapState() {
    if (!DOM.panelLayerMap) return;

    if (state.layerMapVisible) {
      // Tampilkan panel — set display dulu, lalu opacity untuk fade-in
      DOM.panelLayerMap.style.display = 'flex';
      requestAnimationFrame(function () {
        DOM.panelLayerMap.style.opacity = '1';
      });
    } else {
      // Sembunyikan panel — reset opacity dan sembunyikan
      DOM.panelLayerMap.style.opacity = '0';
      DOM.panelLayerMap.style.display = 'none';
    }

    // Perbarui tampilan tombol 🗺 di topbar sebagai indikator aktif/tidak
    if (DOM.btnMain) {
      DOM.btnMain.style.opacity = state.layerMapVisible ? '1' : '0.5';
      DOM.btnMain.title = state.layerMapVisible ? 'Sembunyikan Layer Map' : 'Tampilkan Layer Map';
    }
  }

  // ==================== SCROLL KE SECTION ====================
  // Buka <details> section target dan scroll ke sana di menu-tree
  function scrollToSection(sectionId) {
    if (!sectionId || !DOM.menuTree) return;

    var section = document.getElementById(sectionId);
    if (!section) return;

    // Buka <details> utama section ini
    var details = section.querySelector('details');
    if (details) details.open = true;

    // Scroll ke section dengan animasi halus
    setTimeout(function () {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Highlight singkat pada summary untuk feedback visual
      var summary = details ? details.querySelector('summary') : null;
      if (summary) {
        summary.style.background = 'var(--accent-dim)';
        summary.style.color      = 'var(--accent)';
        setTimeout(function () {
          summary.style.background = '';
          summary.style.color      = '';
        }, 1200);
      }
    }, 80);
  }

  // ==================== HELPER: CARI DISPLAY SLIDER ====================
  // Cari elemen tampilan nilai slider — cek .slider-val atau .w-val terdekat
  function findSliderDisplay(slider) {
    // Cek di .slider-row parent
    var row = slider.closest('.slider-row');
    if (row) return row.querySelector('.slider-val');

    // Cek di .w-item parent (weight grid)
    var item = slider.closest('.w-item');
    if (item) return item.querySelector('.w-val');

    return null;
  }

  // ==================== JALANKAN SETELAH DOM SIAP ====================
  // Guard agar init() tidak jalan sebelum DOM tersedia
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
</script>
