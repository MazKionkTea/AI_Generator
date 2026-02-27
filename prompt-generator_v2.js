/**
 * Prompt Generator V4 - UI Controller
 * Universal AI Prompt Generator Schema v3.0 Implementation
 * Supports: MidJourney, Stable Diffusion/SDXL, DALL-E 3, Runway, Pika, Kling, Sora
 */

(function() {
  'use strict';

  // ==================== SCHEMA VERSION ====================
  const SCHEMA_VERSION = "3.0";
  const SUPPORTED_PLATFORMS = ['midjourney', 'stable_diffusion', 'dalle3', 'runway', 'pika', 'kling', 'sora'];

  // ==================== STATE MANAGEMENT ====================
  const AppState = {
    schemaVersion: SCHEMA_VERSION,
    generatorType: 'image', // "image" | "video" | "both"
    currentLayer: 'L0',
    sidebarCollapsed: false,
    templateId: '',
    targetPlatform: 'midjourney',
    
    // Layer 0 - Character Design (subjects)
    subjects: {
      primary_subject: null,
      secondary_subjects: [],
      background_entities: [],
      crowd_elements: null,
      relationships: []
    },
    
    // Layer 1A - Identity Anchor (LOCKED)
    identityAnchor: {
      name: '',
      lock_method: 'image_reference_primary',
      reference_images: {
        primary: '',
        face_closeup: '',
        angles: { front: '', side: '', three_quarter: '', back: '' },
        outfit_variants: {},
        platform_usage: {}
      },
      age_profile: {
        target: '',
        logic: '',
        skin_condition: '',
        maturity_level: ''
      },
      race_matrix: {
        fantasy: '',
        realistic_base: '',
        skull_logic: '',
        skin_tone_range: ''
      },
      face_dna: {
        face_shape: '',
        eye_shape: '',
        eye_color: '',
        nose_shape: '',
        lip_shape: '',
        jaw_line: '',
        cheek_structure: '',
        skin_undertone: ''
      },
      body_dna: {
        height_category: '',
        frame_type: '',
        shoulder_width: '',
        waist_definition: '',
        limb_proportion: ''
      },
      locked_features: []
    },
    
    // Layer 1B - Technical Constraints (LOCKED)
    technicalConstraints: {
      negative_prompts: [],
      identity_locks: [],
      rendering: {}
    },
    
    // Layer 2A - Scene Core
    sceneCore: {
      scene_type: '',
      primary_focus: 'character',
      narrative_moment: '',
      dramatic_weight: '',
      time_setting: {
        period: '',
        season: '',
        time_of_day: '',
        time_flow: 'real_time'
      },
      space_setting: {
        location_type: '',
        region: '',
        specific_place: '',
        scale: ''
      }
    },
    
    // Layer 2B - Environment
    environment: {
      location: {
        setting_type: '',
        specific_location: '',
        geographic_region: '',
        cultural_context: '',
        ownership: '',
        maintenance_state: ''
      },
      architecture: {
        architectural_style: '',
        era_mix: [],
        materials: [],
        structural_features: [],
        decorative_elements: []
      },
      natural_elements: {
        terrain: '',
        vegetation: { density: '', types: [] },
        water_features: [],
        geological: [],
        celestial_bodies: [],
        wildlife: []
      },
      weather_climate: {
        precipitation: '',
        wind: '',
        visibility: '',
        temperature_indicators: [],
        sky_condition: '',
        special_phenomena: []
      },
      props_objects: [],
      signage_text: {},
      technology: {
        visible_tech: [],
        tech_condition: ''
      }
    },
    
    // Layer 3 - Composition
    composition: {
      camera: {
        shot_type: '',
        angle: '',
        lens: { focal_length: '', aperture: '', lens_type: '', dof: '' },
        height: '',
        distance: '',
        stability: ''
      },
      framing: {
        subject_placement: '',
        head_room: '',
        lead_room: '',
        symmetry: '',
        frame_within_frame: []
      },
      spatial_layers: [],
      geometry: {}
    },
    
    // Layer 4A - Motion (VIDEO ONLY)
    motion: {
      camera_movement: {
        type: '',
        direction: '',
        speed: '',
        easing: '',
        arc: ''
      },
      subject_motion: {
        primary_motion: '',
        motion_path: '',
        speed: '',
        cloth_physics: '',
        hair_physics: ''
      },
      environment_motion: {
        elements: [],
        intensity: '',
        wind_effect: ''
      },
      motion_intensity: ''
    },
    
    // Layer 4B - Temporal Sequence (VIDEO ONLY)
    temporalSequence: {
      total_duration: 5.0,
      fps: 24,
      shot_sequence: [],
      transition: { type: '', duration: 0, style: '' },
      loop: false
    },
    
    // Layer 5 - Lighting
    lighting: {
      preset: '',
      key_light: { enabled: true, source_type: '', position: '', intensity: '', quality: '', color: {}, falloff: '', modifiers: [] },
      fill_light: { enabled: false, source_type: '', intensity: '', color: {} },
      rim_light: { enabled: false, color: {}, intensity: '' },
      ambient_light: { enabled: true, source_type: '', intensity: '', color: {} },
      natural_light: { enabled: true, source_type: '', position: '', intensity: '', color: {} },
      practical_lights: [],
      volumetric_effects: { enabled: false, medium_type: '', density: '', interaction_with_light: [], color_influence: '', movement: '' },
      shadows: { style: '', softness: '', color_tint: '' }
    },
    
    // Layer 6 - Atmosphere
    atmosphere: {
      emotional_tone: [],
      narrative_implication: '',
      visual_style: {
        art_movement: '',
        film_reference: '',
        photography_style: '',
        color_palette: [],
        contrast_mood: '',
        texture_emphasis: ''
      },
      temporal_quality: {
        time_feeling: '',
        urgency: '',
        timelessness: ''
      },
      spatial_quality: {
        openness: '',
        intimacy: '',
        verticality: ''
      },
      audio_implied: {
        ambient: [],
        foreground: [],
        emotional_cue: ''
      }
    },
    
    // Layer 7 - Technical
    technical: {
      render_specs: {
        resolution: '',
        aspect_ratio: '',
        render_engine: '',
        quality_settings: '',
        sampling: ''
      },
      camera_tech: {
        film_back: '',
        iso: '',
        shutter: '',
        look_profile: ''
      },
      post_processing: {
        color_grading: '',
        grain_noise: '',
        lens_effects: [],
        sharpening: '',
        vfx_overlay: []
      },
      video_specs: { // VIDEO ONLY
        codec: '',
        bitrate: '',
        audio_track: '',
        delivery_format: '',
        stabilization: ''
      }
    },
    
    // Layer 8A - Metadata (Admin)
    metadata: {
      title: '',
      description: '',
      author: '',
      created_date: '',
      last_modified: '',
      category: '',
      subcategories: [],
      complexity_level: '',
      target_ai: [],
      language: 'en',
      version_notes: ''
    },
    
    // Layer 8B - Variations
    variations: {
      randomizable_elements: [],
      variation_rules: [],
      seed_system: {
        base_seed: 42,
        deterministic: true
      },
      batch_config: {
        count: 1,
        naming_pattern: '',
        output_directory: ''
      }
    },
    
    // Layer 8C - Output Config
    outputConfig: {
      prompt_structure: {
        order: {},
        separator: {},
        emphasis_syntax: {},
        length_limit: {},
        truncation_strategy: 'priority_only'
      },
      section_weights: {
        identity_anchor: 2.0,
        technical_constraints: 2.0,
        subjects: 1.5,
        lighting: 1.5,
        composition: 1.3,
        atmosphere: 1.2,
        scene_core: 1.0,
        environment: 1.0,
        motion: 1.0,
        temporal_sequence: 0.8,
        technical: 0.8,
        variations: 0.0,
        metadata: 0.0
      },
      negative_prompt: {
        shared: '',
        identity: '',
        platform_specific: {}
      },
      parameter_append: {}
    },
    
    // Locked status per field
    lockedFields: {
      identity_anchor: true,
      technical_constraints: true,
      race_matrix: true,
      age_profile: true,
      face_dna: true,
      body_dna: true
    }
  };

  // ==================== PLATFORM-SPECIFIC ORDERS (from README) ====================
  const PLATFORM_ORDERS = {
    midjourney: [
      'technical', 'identity_anchor', 'subjects', 'atmosphere', 
      'scene_core', 'environment', 'composition', 'lighting'
    ],
    stable_diffusion: [
      'identity_anchor', 'technical_constraints', 'subjects',
      'scene_core', 'environment', 'composition', 'lighting', 
      'atmosphere', 'technical'
    ],
    dalle3: [
      'identity_anchor', 'subjects', 'scene_core', 'environment',
      'composition', 'lighting', 'atmosphere'
    ],
    runway: {
      first_frame: [
        'identity_anchor', 'subjects', 'scene_core', 'environment',
        'composition', 'lighting', 'atmosphere'
      ],
      motion: ['motion', 'temporal_sequence']
    },
    pika: [
      'identity_anchor', 'subjects', 'motion', 'scene_core', 
      'lighting', 'atmosphere'
    ],
    kling: [
      'identity_anchor', 'subjects', 'scene_core', 'motion',
      'environment', 'lighting', 'atmosphere'
    ],
    sora: [
      'scene_core', 'environment', 'identity_anchor', 'subjects',
      'motion', 'composition', 'lighting', 'atmosphere'
    ]
  };

  // ==================== DOM ELEMENTS CACHE ====================
  const DOM = {};

  // ==================== INITIALIZATION ====================
  function init() {
    cacheDOM();
    bindEvents();
    initializeFromURL();
    updateUIState();
    console.log(`🎨 Prompt Generator V4 (Schema ${SCHEMA_VERSION}) initialized`);
    console.log(`📋 Target Platform: ${AppState.targetPlatform}`);
  }

  function cacheDOM() {
    DOM.sidebar = document.getElementById('sidebar');
    DOM.toggleBtn = document.getElementById('toggleBtn');
    DOM.toggleBtnMain = document.getElementById('toggleBtnMain');
    DOM.layerTabs = document.querySelectorAll('.layer-tab');
    DOM.menuTree = document.querySelector('.menu-tree');
    
    // Output areas
    DOM.outputTextarea = document.querySelector('textarea.output:not(.neg):not(.json)');
    DOM.negOutputTextarea = document.querySelector('textarea.output.neg');
    DOM.jsonOutputTextarea = document.querySelector('textarea.output.json');
    
    // Platform selector
    DOM.platformSelect = document.querySelector('select[name="target_platform"]') || 
                         document.querySelector('#targetPlatform');
    
    // Generator type
    DOM.generatorTypeSelect = document.querySelector('select[name="generator_type"]');
  }

  // ==================== EVENT BINDINGS ====================
  function bindEvents() {
    // Sidebar toggle
    if (DOM.toggleBtn) DOM.toggleBtn.addEventListener('click', toggleSidebar);
    if (DOM.toggleBtnMain) DOM.toggleBtnMain.addEventListener('click', toggleSidebar);

    // Layer tabs navigation
    DOM.layerTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => switchLayer(index));
    });

    // Platform change
    if (DOM.platformSelect) {
      DOM.platformSelect.addEventListener('change', (e) => {
        AppState.targetPlatform = e.target.value;
        updatePlatformSpecificUI();
      });
    }

    // Generator type change
    if (DOM.generatorTypeSelect) {
      DOM.generatorTypeSelect.addEventListener('change', (e) => {
        AppState.generatorType = e.target.value;
        toggleVideoLayers(e.target.value === 'video' || e.target.value === 'both');
      });
    }

    // Weight sliders
    document.querySelectorAll('.weight-grid input[type="range"]').forEach(slider => {
      slider.addEventListener('input', handleWeightChange);
    });

    // Lock checkboxes
    document.querySelectorAll('.lock-row input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', handleLockChange);
    });

    // Generate button
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('GENERATE')) {
        btn.addEventListener('click', generatePrompt);
      }
      if (btn.textContent.includes('Copy')) {
        btn.addEventListener('click', () => copyToClipboard(btn));
      }
      if (btn.textContent.includes('Export')) {
        btn.addEventListener('click', exportJSON);
      }
      if (btn.textContent.includes('Import')) {
        btn.addEventListener('click', importJSON);
      }
      if (btn.textContent.includes('Save Template')) {
        btn.addEventListener('click', saveTemplate);
      }
    });

    // Auto-save on input
    document.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', (e) => updateStateFromInput(e.target));
      input.addEventListener('input', debounce((e) => updateStateFromInput(e.target), 500));
    });

    // Collapsible sections
    document.querySelectorAll('.layer-section > details > summary').forEach(summary => {
      summary.addEventListener('click', handleSectionToggle);
    });
  }

  // ==================== SIDEBAR & NAVIGATION ====================
  function toggleSidebar() {
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    DOM.sidebar.classList.toggle('collapsed', AppState.sidebarCollapsed);
    
    const icon = AppState.sidebarCollapsed ? '☰' : '←';
    if (DOM.toggleBtn) DOM.toggleBtn.textContent = icon;
    
    localStorage.setItem('sidebarCollapsed', AppState.sidebarCollapsed);
  }

  function switchLayer(index) {
    DOM.layerTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    
    const layers = ['L1A', 'L1B', 'L0', 'L2A', 'L2B', 'L3', 'L5', 'L6', 'L4A', 'L4B', 'L7', 'L8C', 'L8B', 'L8A'];
    AppState.currentLayer = layers[index] || 'L1A';
    
    scrollToLayer(AppState.currentLayer);
  }

  function scrollToLayer(layerId) {
    const sectionMap = {
      'L1A': 'Identity Anchor',
      'L1B': 'Technical Constraints', 
      'L0': 'Subjects',
      'L2A': 'Scene Core',
      'L2B': 'Environment',
      'L3': 'Composition',
      'L4A': 'Motion',
      'L4B': 'Temporal',
      'L5': 'Lighting',
      'L6': 'Atmosphere',
      'L7': 'Technical',
      'L8A': 'Metadata',
      'L8B': 'Variations',
      'L8C': 'Output Config'
    };

    const summaries = document.querySelectorAll('.layer-section summary');
    summaries.forEach(summary => {
      if (summary.textContent.includes(sectionMap[layerId])) {
        const details = summary.closest('details');
        if (details) {
          details.open = true;
          details.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  function toggleVideoLayers(show) {
    const videoTabs = document.querySelectorAll('.layer-tab:has(.tab-badge.vid)');
    const videoSections = document.querySelectorAll('.layer-section:has(.badge.vid)');
    
    videoTabs.forEach(tab => tab.style.display = show ? 'flex' : 'none');
    videoSections.forEach(section => section.style.display = show ? 'block' : 'none');
    
    if (!show) {
      AppState.motion = null;
      AppState.temporalSequence = null;
    }
  }

  // ==================== STATE MANAGEMENT ====================
  function updateStateFromInput(input) {
    const name = input.name || input.id;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    const section = getInputSection(input);
    
    if (!section || !name) return;
    
    // Update nested state based on section and field
    updateNestedState(section, name, value);
    
    // Auto-save to localStorage
    debounce(saveToLocalStorage, 1000)();
  }

  function updateNestedState(section, field, value) {
    const path = field.split('.');
    let current = AppState[section];
    
    if (!current) return;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
  }

  function getInputSection(input) {
    const section = input.closest('.layer-section');
    if (!section) return null;
    
    const summary = section.querySelector('summary');
    if (!summary) return null;

    if (summary.textContent.includes('Identity')) return 'identityAnchor';
    if (summary.textContent.includes('Constraints')) return 'technicalConstraints';
    if (summary.textContent.includes('Subjects')) return 'subjects';
    if (summary.textContent.includes('Scene Core')) return 'sceneCore';
    if (summary.textContent.includes('Environment')) return 'environment';
    if (summary.textContent.includes('Composition')) return 'composition';
    if (summary.textContent.includes('Motion')) return 'motion';
    if (summary.textContent.includes('Temporal')) return 'temporalSequence';
    if (summary.textContent.includes('Lighting')) return 'lighting';
    if (summary.textContent.includes('Atmosphere')) return 'atmosphere';
    if (summary.textContent.includes('Technical')) return 'technical';
    
    return null;
  }

  // ==================== WEIGHT & LOCK MANAGEMENT ====================
  function handleWeightChange(e) {
    const slider = e.target;
    const value = parseFloat(slider.value);
    const item = slider.closest('.w-item');
    
    // Update display
    const display = item.querySelector('.w-val');
    if (display) {
      display.textContent = value.toFixed(1);
      display.classList.toggle('zero', value === 0);
    }
    
    // Update bar
    const bar = item.querySelector('.w-bar');
    if (bar) {
      bar.style.width = (value / 2 * 100) + '%';
      bar.classList.toggle('dim', value === 0);
    }
    
    // Update state
    const label = item.querySelector('.w-label').textContent.trim();
    updateWeightState(label, value);
  }

  function updateWeightState(label, value) {
    const keyMap = {
      'Identity Anchor': 'identity_anchor',
      'Tech Constraints': 'technical_constraints',
      'Subjects': 'subjects',
      'Lighting': 'lighting',
      'Composition': 'composition',
      'Atmosphere': 'atmosphere',
      'Scene Core': 'scene_core',
      'Environment': 'environment',
      'Motion': 'motion',
      'Temporal': 'temporal_sequence',
      'Technical': 'technical'
    };
    
    const key = Object.keys(keyMap).find(k => label.includes(k));
    if (key) {
      AppState.outputConfig.section_weights[keyMap[key]] = value;
    }
  }

  function handleLockChange(e) {
    const checkbox = e.target;
    const lockId = checkbox.id;
    const isLocked = checkbox.checked;
    
    // Visual feedback
    const row = checkbox.closest('.lock-row');
    row.style.background = isLocked ? 'rgba(255,107,107,.05)' : 'transparent';
    row.style.borderColor = isLocked ? 'rgba(255,107,107,.3)' : 'transparent';
    
    // Update state
    AppState.lockedFields[lockId] = isLocked;
    
    // Warning for critical unlocks
    if (!isLocked && ['lockIdentity', 'lockRace', 'lockAge'].includes(lockId)) {
      showWarning(`⚠️ Unlocking ${lockId.replace('lock', '').toLowerCase()} may cause identity drift!`);
    }
  }

  // ==================== PROMPT GENERATION (README v3.0 Compliant) ====================
  function generatePrompt() {
    collectAllFormData();
    
    const platform = AppState.targetPlatform;
    const isVideo = AppState.generatorType === 'video' || AppState.generatorType === 'both';
    
    // Build prompts according to README v3.0 platform-specific orders
    let positivePrompt, negativePrompt, motionPrompt;
    
    if (platform === 'runway' && isVideo) {
      // Runway needs separate frame and motion prompts
      const prompts = buildRunwayPrompts();
      positivePrompt = prompts.frame;
      motionPrompt = prompts.motion;
    } else {
      positivePrompt = buildPositivePrompt(platform);
    }
    
    negativePrompt = buildNegativePrompt(platform);
    const jsonStructure = buildJSONStructure();
    
    // Update UI
    updateOutputUI(positivePrompt, negativePrompt, motionPrompt, jsonStructure);
    updatePlatformParams();
    
    showNotification('✅ Prompt generated successfully!');
  }

  function buildPositivePrompt(platform) {
    const order = PLATFORM_ORDERS[platform] || PLATFORM_ORDERS.stable_diffusion;
    const weights = AppState.outputConfig.section_weights;
    const sections = [];
    
    // Build each section according to order
    order.forEach(sectionName => {
      if (weights[sectionName] === 0) return;
      
      const sectionText = buildSectionText(sectionName);
      if (sectionText) {
        sections.push(applyWeight(sectionText, weights[sectionName], platform));
      }
    });
    
    // Platform-specific formatting
    const separator = getSeparator(platform);
    return sections.join(separator);
  }

  function buildRunwayPrompts() {
    const frameOrder = PLATFORM_ORDERS.runway.first_frame;
    const motionOrder = PLATFORM_ORDERS.runway.motion;
    
    const frameSections = [];
    const motionSections = [];
    
    frameOrder.forEach(section => {
      const text = buildSectionText(section);
      if (text) frameSections.push(text);
    });
    
    motionOrder.forEach(section => {
      const text = buildSectionText(section);
      if (text) motionSections.push(text);
    });
    
    return {
      frame: frameSections.join(', '),
      motion: motionSections.join('. ')
    };
  }

  function buildSectionText(sectionName) {
    switch(sectionName) {
      case 'identity_anchor':
        return buildIdentityAnchorText();
      case 'technical_constraints':
        return ''; // Constraints go to negative prompt
      case 'subjects':
        return buildSubjectsText();
      case 'scene_core':
        return buildSceneCoreText();
      case 'environment':
        return buildEnvironmentText();
      case 'composition':
        return buildCompositionText();
      case 'lighting':
        return buildLightingText();
      case 'atmosphere':
        return buildAtmosphereText();
      case 'motion':
        return buildMotionText();
      case 'temporal_sequence':
        return buildTemporalText();
      case 'technical':
        return buildTechnicalText();
      default:
        return '';
    }
  }

  function buildIdentityAnchorText() {
    const ia = AppState.identityAnchor;
    const parts = [];
    
    if (ia.name) parts.push(ia.name);
    if (ia.race_matrix.realistic_base) parts.push(ia.race_matrix.realistic_base);
    if (ia.race_matrix.fantasy && ia.race_matrix.fantasy !== 'Human') {
      parts.push(ia.race_matrix.fantasy);
    }
    if (ia.age_profile.target) parts.push(ia.age_profile.target);
    
    // Face DNA
    const face = ia.face_dna;
    if (face.eye_shape && face.eye_color) {
      parts.push(`${face.eye_shape} ${face.eye_color} eyes`);
    }
    if (face.face_shape) parts.push(`${face.face_shape} face`);
    
    return parts.join(', ');
  }

  function buildSubjectsText() {
    const ps = AppState.subjects.primary_subject;
    if (!ps) return '';
    
    const parts = [];
    
    if (ps.archetype) parts.push(ps.archetype.replace(/_/g, ' '));
    if (ps.physical_attributes?.hair?.style) {
      parts.push(`${ps.physical_attributes.hair.style} hair`);
    }
    if (ps.dressing_room?.active_outfit?.set_name) {
      parts.push(`wearing ${ps.dressing_room.active_outfit.set_name.replace(/_/g, ' ')}`);
    }
    if (ps.pose_action?.base_pose) {
      parts.push(ps.pose_action.base_pose.replace(/_/g, ' '));
    }
    
    return parts.join(', ');
  }

  function buildSceneCoreText() {
    const sc = AppState.sceneCore;
    const parts = [];
    
    if (sc.narrative_moment) parts.push(sc.narrative_moment.replace(/_/g, ' '));
    if (sc.time_setting?.time_of_day) parts.push(sc.time_setting.time_of_day.replace(/_/g, ' '));
    if (sc.space_setting?.specific_place) parts.push(sc.space_setting.specific_place.replace(/_/g, ' '));
    
    return parts.join(', ');
  }

  function buildEnvironmentText() {
    const env = AppState.environment;
    const parts = [];
    
    if (env.location?.specific_location) parts.push(env.location.specific_location.replace(/_/g, ' '));
    if (env.weather_climate?.precipitation && env.weather_climate.precipitation !== 'none_clear') {
      parts.push(env.weather_climate.precipitation.replace(/_/g, ' '));
    }
    
    return parts.join(', ');
  }

  function buildCompositionText() {
    const comp = AppState.composition.camera;
    const parts = [];
    
    if (comp.shot_type) parts.push(comp.shot_type.replace(/_/g, ' '));
    if (comp.angle) parts.push(`${comp.angle.replace(/_/g, ' ')} angle`);
    if (comp.lens?.focal_length) parts.push(`${comp.lens.focal_length} lens`);
    
    return parts.join(', ');
  }

  function buildLightingText() {
    const light = AppState.lighting;
    const parts = [];
    
    if (light.preset) {
      parts.push(`${light.preset.replace(/_/g, ' ')} lighting`);
    } else {
      if (light.key_light?.source_type) {
        parts.push(`${light.key_light.source_type} key light`);
      }
    }
    
    if (light.volumetric_effects?.enabled) {
      parts.push(`volumetric ${light.volumetric_effects.medium_type}`);
    }
    
    return parts.join(', ');
  }

  function buildAtmosphereText() {
    const atm = AppState.atmosphere;
    const parts = [];
    
    if (atm.emotional_tone?.length) {
      parts.push(...atm.emotional_tone.map(t => t.replace(/_/g, ' ')));
    }
    if (atm.visual_style?.art_movement) {
      parts.push(atm.visual_style.art_movement.replace(/_/g, ' '));
    }
    if (atm.visual_style?.film_reference) {
      parts.push(`${atm.visual_style.film_reference} style`);
    }
    
    return parts.join(', ');
  }

  function buildMotionText() {
    if (!AppState.motion) return '';
    const mot = AppState.motion;
    const parts = [];
    
    if (mot.camera_movement?.type && mot.camera_movement.type !== 'static_locked') {
      parts.push(`${mot.camera_movement.speed || ''} ${mot.camera_movement.type.replace(/_/g, ' ')}`);
    }
    if (mot.subject_motion?.primary_motion) {
      parts.push(mot.subject_motion.primary_motion.replace(/_/g, ' '));
    }
    
    return parts.join(', ');
  }

  function buildTemporalText() {
    if (!AppState.temporalSequence) return '';
    const ts = AppState.temporalSequence;
    
    return `${ts.total_duration}s duration, ${ts.fps}fps${ts.loop ? ', seamless loop' : ''}`;
  }

  function buildTechnicalText() {
    const tech = AppState.technical.render_specs;
    const parts = [];
    
    if (tech.quality_settings) parts.push(tech.quality_settings.replace(/_/g, ' '));
    if (tech.resolution) parts.push(tech.resolution);
    
    return parts.join(', ');
  }

  function applyWeight(text, weight, platform) {
    if (weight === 1.0 || !text) return text;
    if (weight === 0) return '';
    
    // Platform-specific weight syntax
    switch(platform) {
      case 'stable_diffusion':
        return `(${text}:${weight.toFixed(1)})`;
      case 'midjourney':
        // MJ doesn't support inline weights, use :: syntax or rely on position
        return weight >= 1.5 ? `:: ${text} ::` : text;
      case 'dalle3':
      case 'sora':
      case 'kling':
        // Natural language emphasis
        return weight >= 1.5 ? `IMPORTANT: ${text}` : text;
      default:
        return weight > 1.0 ? `(${text})` : text;
    }
  }

  function getSeparator(platform) {
    const separators = {
      midjourney: ', ',
      stable_diffusion: ', ',
      dalle3: '. ',
      sora: '. ',
      kling: '. ',
      pika: ', ',
      runway: ', '
    };
    return separators[platform] || ', ';
  }

  function buildNegativePrompt(platform) {
    const negatives = [];
    const tc = AppState.technicalConstraints;
    
    // Add locked identity protections
    if (AppState.lockedFields.race_matrix) {
      negatives.push('western facial features:1.3', 'European facial structure:1.4');
    }
    if (AppState.lockedFields.age_profile) {
      negatives.push('age drift:1.3', 'mature anatomy:1.2', 'wrinkles:1.2');
    }
    
    // Add from technical_constraints
    if (tc.negative_prompts?.length) {
      negatives.push(...tc.negative_prompts);
    }
    
    // Platform-specific formatting
    switch(platform) {
      case 'midjourney':
        return `--no ${negatives.map(n => n.replace(/:\d+\.\d+/, '')).join(', ')}`;
      case 'stable_diffusion':
        return negatives.join(', ');
      case 'dalle3':
      case 'sora':
        return `AVOID: ${negatives.map(n => n.replace(/:\d+\.\d+/, '')).join(', ')}`;
      default:
        return negatives.join(', ');
    }
  }

  // ==================== JSON STRUCTURE BUILDER ====================
  function buildJSONStructure() {
    return {
      schema_version: SCHEMA_VERSION,
      generator_type: AppState.generatorType,
      template_id: AppState.templateId,
      
      // Layer 0
      subjects: AppState.subjects,
      
      // Layer 1
      identity_anchor: AppState.identityAnchor,
      technical_constraints: AppState.technicalConstraints,
      
      // Layer 2
      scene_core: AppState.sceneCore,
      environment: AppState.environment,
      
      // Layer 3
      composition: AppState.composition,
      
      // Layer 4 (video only)
      motion: AppState.generatorType !== 'image' ? AppState.motion : null,
      temporal_sequence: AppState.generatorType !== 'image' ? AppState.temporalSequence : null,
      
      // Layer 5-7
      lighting: AppState.lighting,
      atmosphere: AppState.atmosphere,
      technical: AppState.technical,
      
      // Layer 8
      output_config: AppState.outputConfig,
      variations: AppState.variations,
      metadata: {
        ...AppState.metadata,
        last_modified: new Date().toISOString()
      }
    };
  }

  // ==================== UI UPDATES ====================
  function updateOutputUI(positive, negative, motion, json) {
    if (DOM.outputTextarea) {
      let output = positive;
      if (motion) output += `\n\n[MOTION INSTRUCTION]\n${motion}`;
      DOM.outputTextarea.value = output;
      animateText(DOM.outputTextarea);
    }
    
    if (DOM.negOutputTextarea) {
      DOM.negOutputTextarea.value = negative;
    }
    
    if (DOM.jsonOutputTextarea) {
      DOM.jsonOutputTextarea.value = JSON.stringify(json, null, 2);
    }
  }

  function updatePlatformParams() {
    const ar = AppState.technical.render_specs.aspect_ratio || '2:3';
    const platform = AppState.targetPlatform;
    
    const params = {
      midjourney: `--ar ${ar} --v 6 --style raw --s 250 --iw 2`,
      stable_diffusion: `--steps 30 --cfg 7 --sampler DPM++ 2M Karras`,
      dalle3: `quality=hd, style=vivid`,
      runway: `fps=24, duration=5, motion=medium`,
      pika: `--ar ${ar} --motion 2 --fps 24`,
      kling: `mode=pro, duration=5, face_ref=ON, ref_weight=0.85`,
      sora: `resolution=1080p, duration=5s`
    };
    
    // Update platform cards
    document.querySelectorAll('.plat-card').forEach(card => {
      const name = card.querySelector('.plat-name')?.textContent.toLowerCase() || '';
      const paramsEl = card.querySelector('.plat-params');
      
      Object.keys(params).forEach(key => {
        if (name.includes(key)) {
          paramsEl.textContent = params[key];
        }
      });
    });
  }

  // ==================== TEMPLATE MANAGEMENT ====================
  function saveTemplate() {
    const data = buildJSONStructure();
    const templateId = AppState.templateId || `template_${Date.now()}`;
    
    const templates = JSON.parse(localStorage.getItem('promptTemplates_v3') || '{}');
    templates[templateId] = data;
    localStorage.setItem('promptTemplates_v3', JSON.stringify(templates));
    
    showNotification(`💾 Template "${templateId}" saved!`);
  }

  function exportJSON() {
    const data = buildJSONStructure();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_v4_${AppState.templateId || Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showNotification('📤 JSON exported!');
  }

  function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (validateSchema(data)) {
            loadTemplateData(data);
            showNotification('📂 JSON imported successfully!');
          } else {
            showError('Invalid schema version or structure');
          }
        } catch (err) {
          showError('Failed to parse JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function validateSchema(data) {
    return data.schema_version && 
           data.schema_version.startsWith('3.') &&
           data.subjects &&
           data.identity_anchor;
  }

  function loadTemplateData(data) {
    // Populate AppState from imported data
    Object.assign(AppState.subjects, data.subjects || {});
    Object.assign(AppState.identityAnchor, data.identity_anchor || {});
    Object.assign(AppState.technicalConstraints, data.technical_constraints || {});
    Object.assign(AppState.sceneCore, data.scene_core || {});
    Object.assign(AppState.environment, data.environment || {});
    Object.assign(AppState.composition, data.composition || {});
    
    if (data.motion) AppState.motion = data.motion;
    if (data.temporal_sequence) AppState.temporalSequence = data.temporal_sequence;
    
    Object.assign(AppState.lighting, data.lighting || {});
    Object.assign(AppState.atmosphere, data.atmosphere || {});
    Object.assign(AppState.technical, data.technical || {});
    
    // Update UI
    populateFormFromState();
  }

  function populateFormFromState() {
    // This would map AppState back to form inputs
    // Implementation depends on specific form structure
    console.log('Populating form from state...');
  }

  // ==================== UTILITY FUNCTIONS ====================
  function collectAllFormData() {
    // Comprehensive form data collection
    document.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
      updateStateFromInput(input);
    });
  }

  function copyToClipboard(btn) {
    const target = btn.closest('.panel')?.querySelector('textarea');
    if (target) {
      target.select();
      document.execCommand('copy');
      
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = original, 1500);
    }
  }

  function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(160deg, #9fef00, #7acc00);
      color: #060e00;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(159,239,0,.3);
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  function showWarning(message) {
    console.warn(message);
  }

  function showError(message) {
    alert('Error: ' + message);
  }

  function animateText(textarea) {
    textarea.style.opacity = '0.5';
    setTimeout(() => textarea.style.opacity = '1', 200);
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function saveToLocalStorage() {
    localStorage.setItem('promptGeneratorV4_draft', JSON.stringify(AppState));
  }

  function initializeFromURL() {
    // Check for template ID in URL
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get('template');
    if (templateId) {
      AppState.templateId = templateId;
    }
  }

  function updateUIState() {
    // Restore sidebar state
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved === 'true') toggleSidebar();
    
    // Update weight displays
    document.querySelectorAll('.weight-grid input[type="range"]').forEach(slider => {
      const value = parseFloat(slider.value);
      const item = slider.closest('.w-item');
      const display = item.querySelector('.w-val');
      const bar = item.querySelector('.w-bar');
      
      if (display) display.textContent = value.toFixed(1);
      if (bar) bar.style.width = (value / 2 * 100) + '%';
    });
  }

  function updatePlatformSpecificUI() {
    // Update UI based on selected platform
    const platform = AppState.targetPlatform;
    
    // Show/hide video-specific elements
    const isVideoPlatform = ['runway', 'pika', 'kling', 'sora'].includes(platform);
    if (isVideoPlatform && AppState.generatorType === 'image') {
      // Suggest switching to video
      console.log('Tip: This platform is optimized for video generation');
    }
  }

  function handleSectionToggle(e) {
    // Track which sections are open for UX
    const details = e.target.closest('details');
    const isOpen = details.open;
    const sectionName = e.target.textContent.trim();
    
    console.log(`Section ${sectionName} ${isOpen ? 'opened' : 'closed'}`);
  }

  // ==================== CSS ANIMATIONS ====================
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ==================== START ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();