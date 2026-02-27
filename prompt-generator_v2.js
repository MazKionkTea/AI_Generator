/**
 * ============================================================
 * PROMPT GENERATOR V4 — Core Engine (v2.js)
 * ============================================================
 * FEATURES:
 *   1. JSON Data Loading       — Fetch & cache all 15 layer JSON files
 *   2. Dropdown Population     — Fill all <select> from JSON data
 *   3. State Management        — Track all form values, persist localStorage
 *   4. Prompt Generation       — Build final prompt string from state
 *   5. Section Weights System  — 12 sliders affect token priority
 *   6. Template Management     — Built-in presets + custom save/load
 *   7. Import / Export         — JSON config download & upload
 *   8. Platform Parameters     — Append platform-specific suffix
 *
 * Dependencies: prompt-generator_v1.js (UI navigation) must load first
 * Standards   : Vanilla JS ES6+, no external libraries
 * ============================================================
 */

(function () {
  'use strict';

  // ============================================================
  // 1. CONSTANTS & CONFIG
  // ============================================================

  const DATA_PATH = './data/';

  /** All 15 JSON layer files */
  const JSON_FILES = {
    L0_char  : 'Layer_0_subjects_character_design.json',
    L0_subj  : 'Layer_0_subjects_v1.json',
    L1A      : 'Layer_1A_identity_anchor_v1.json',
    L1B      : 'Layer_1B_technical_constraints_v1.json',
    L2A      : 'Layer_2A_scene_core_v1.json',
    L2B      : 'Layer_2B_environment_v1.json',
    L3       : 'Layer_3_composition_v1.json',
    L4A      : 'Layer_4A_video_motion_v1.json',
    L4B      : 'Layer_4B_video_temporal_sequence_v1.json',
    L5       : 'Layer_5_lighting_v1.json',
    L6       : 'Layer_6_atmosphere_v1.json',
    L7       : 'Layer_7_technical_v1.json',
    L8A      : 'Layer_8A_metadata_v1.json',
    L8B      : 'Layer_8B_variations_v1.json',
    L8C      : 'Layer_8C_output_config_v1.json',
  };

  const LS_KEY_STATE     = 'pgv4_state';
  const LS_KEY_TEMPLATES = 'pgv4_custom_templates';

  /**
   * Default section weights.
   * L1A & L1B are always 2.0 (locked).
   * Others are adjustable via sliders.
   */
  const DEFAULT_WEIGHTS = {
    identity    : 2.0,   // L1A — locked
    constraints : 2.0,   // L1B — locked
    subjects    : 1.5,   // L0
    lighting    : 1.5,   // L5
    composition : 1.3,   // L3
    atmosphere  : 1.2,   // L6
    scene       : 1.0,   // L2A
    environment : 1.0,   // L2B
    motion      : 1.0,   // L4A
    temporal    : 0.8,   // L4B
    technical   : 0.8,   // L7
  };

  /**
   * Platform parameter presets
   */
  const PLATFORM_PARAMS = {
    MidJourney    : '--v 6.1 --style raw --ar 2:3 --s 100 --q 2',
    SDXL          : 'steps:25, cfg:7.5, sampler:DPM++ 2M Karras, hires:1.5x',
    'DALL-E 3'    : 'quality=hd, style=natural, size=1024x1792',
    'Runway Gen-3': 'fps=24, duration=6, motion=medium',
    'Kling Pro'   : 'mode=pro, duration=10, face_ref=ON, ref_weight=0.85',
    Pika          : '--motion 2 --ar 9:16 --fps 24',
    Sora          : 'resolution=1080p, duration=10s, ar=16:9',
    'Hailuo/MiniMax': 'subject_ref=ON, duration=6s, quality=high',
  };

  /**
   * Built-in template presets
   */
  const BUILTIN_TEMPLATES = {
    'Character Portrait — Dark Fantasy': {
      generatorType    : 'image',
      subjectType      : 'human',
      archetype        : 'warrior',
      primaryEmotion   : 'determination',
      eyeState         : 'sharp_focused',
      basePose         : 'standing_combat',
      lineOfSight      : 'at_camera',
      shotType         : 'medium_shot',
      cameraAngle      : 'eye_level',
      focalLength      : '85mm',
      narrativeMoment  : 'calm_before_storm',
      lightingPreset   : 'dramatic_split',
      primaryTone      : 'dark_mysterious',
      artStyle         : 'dark_fantasy',
      colorPalette     : 'dark_desaturated',
      platform         : 'MidJourney',
      sectionOrder     : 'identity_first',
      weights: { subjects: 1.8, lighting: 1.7, composition: 1.5, atmosphere: 1.4, scene: 1.0, environment: 0.8 },
    },
    'Cyberpunk Scene — Cinematic': {
      generatorType    : 'image',
      subjectType      : 'human',
      archetype        : 'hacker',
      primaryEmotion   : 'confidence',
      shotType         : 'wide_shot',
      cameraAngle      : 'low_angle',
      focalLength      : '35mm',
      narrativeMoment  : 'tense_standoff',
      lightingPreset   : 'neon_night',
      primaryTone      : 'tense_anxious',
      artStyle         : 'cyberpunk',
      colorPalette     : 'neon_cyberpunk',
      platform         : 'SDXL',
      sectionOrder     : 'cinematic_order',
    },
    'Fantasy Environment — Epic Landscape': {
      generatorType    : 'image',
      primaryFocus     : 'environment',
      narrativeMoment  : 'epic_reveal',
      shotType         : 'extreme_wide_shot',
      cameraAngle      : 'bird_eye',
      lightingPreset   : 'golden_hour',
      primaryTone      : 'epic_grand',
      artStyle         : 'epic_fantasy',
      colorPalette     : 'warm_golden',
      platform         : 'MidJourney',
      sectionOrder     : 'scene_first',
      weights: { environment: 1.8, scene: 1.6, lighting: 1.5, atmosphere: 1.4, subjects: 0.8 },
    },
    'Video — Character Idle Loop': {
      generatorType    : 'video',
      subjectType      : 'human',
      basePose         : 'standing_neutral',
      primaryMotion    : 'idle_breathing',
      motionIntensity  : 'subtle',
      clothPhysics     : 'gentle_sway',
      hairPhysics      : 'gentle_sway',
      duration         : '5',
      fps              : '24',
      loop             : 'true',
      cameraMovement   : 'static_locked',
      platform         : 'Kling Pro',
      sectionOrder     : 'video_optimized',
    },
  };

  // ============================================================
  // 2. APPLICATION STATE
  // ============================================================

  /**
   * Central state object — single source of truth.
   * Populated from form, persisted to localStorage.
   */
  let state = {
    // Generator config
    generatorType : 'image',
    platform      : 'MidJourney',
    sectionOrder  : 'identity_first',
    separator     : ', ',
    emphasisSyntax: 'none',
    lengthLimit   : 1000,
    truncation    : 'priority_only',

    // Section weights
    weights       : { ...DEFAULT_WEIGHTS },

    // Layer 1A — Identity Anchor
    characterName : '',
    lockMethod    : 'image_reference_primary',
    identityLocked: true,

    // Race Matrix
    realisticRace : '',
    fantasyRace   : '',
    skullLocksOut : '',
    skinToneRange : '',
    lockRace      : true,

    // Age Profile
    ageRange      : '',
    maturityLevel : 'adult',
    lockAge       : true,

    // Face DNA
    faceShape     : '',
    eyeShape      : '',
    eyeColor      : '',
    noseShape     : '',
    lipShape      : '',
    jawLine       : '',
    cheekStructure: '',
    skinUndertone : '',
    lockEyes      : true,

    // Body DNA
    heightCategory: '',
    frameType     : '',
    lockHeight    : true,
    lockFrame     : true,
    shoulderWidth : '',
    waistDef      : '',
    limbProportion: '',

    // Layer 1B — Constraints
    negativeDNA   : '',
    anatomyLocks  : [],
    faceLocks     : [],
    qualityLocks  : [],

    // Layer 0 — Subjects
    subjectType   : 'human',
    archetype     : '',
    species       : 'human',
    genderPresent : 'feminine',
    stature       : '',
    bodyFrame     : '',
    ears          : 'human_normal',
    skinColor     : '',
    skinTexture   : '',
    hairColor     : '',
    hairStyle     : '',
    hairLength    : '',
    distinctiveFeatures: '',

    // Dressing Room
    outfitName    : '',
    outfitPreset  : '',
    upperBody     : '',
    lowerBody     : '',
    outerwear     : '',
    footwear      : '',
    headwear      : '',
    accessories   : [],
    physicsEngine : 'realistic',

    // Pose & Action
    basePose      : '',
    actionVerb    : '',
    actionObject  : '',
    energyLevel   : 'controlled',
    balance       : 'stable',
    lineOfSight   : 'at_camera',

    // Expression & Emotion
    primaryEmotion  : '',
    secondaryEmotion: '',
    emotionIntensity: 'moderate',
    microExpressions: [],
    eyeState        : 'sharp_focused',

    // Modifiers
    cybernetics     : '',
    magicalEffects  : '',
    physicalCondition: '',

    // Secondary subjects
    relationshipToPrimary: '',
    backgroundEntities   : '',
    crowdDensity         : '',

    // Layer 2A — Scene Core
    primaryFocus    : 'character',
    narrativeMoment : '',
    era             : '',
    timeOfDay       : '',
    season          : '',
    timeFlow        : 'real_time',
    locationType    : '',
    specificPlace   : '',
    sceneScale      : '',
    spatialQuality  : '',

    // Layer 2B — Environment
    settingType     : '',
    geoContext      : '',
    maintenanceState: '',
    structuralFeats : '',
    precipitation   : '',
    windEffect      : '',
    visibility      : '',
    skyCondition    : '',
    keyProps        : '',
    propImportance  : '',

    // Layer 3 — Composition
    shotType        : '',
    cameraAngle     : '',
    focalLength     : '',
    aperture        : '',
    cameraStability : '',
    subjectPlacement: 'center',
    symmetry        : '',
    leadingLines    : 'none',
    depthLayers     : '',
    foregroundElem  : '',
    frameInFrame    : 'none',

    // Layer 4A — Motion (Video)
    cameraMovement  : '',
    moveDirection   : '',
    moveSpeed       : '',
    moveEasing      : '',
    primaryMotion   : '',
    motionIntensity : '',
    clothPhysics    : '',
    hairPhysics     : '',
    particleEffects : '',

    // Layer 4B — Temporal (Video)
    duration        : '5',
    fps             : '24',
    loop            : 'false',
    transitionType  : '',
    actionAtStart   : '',
    actionAtEnd     : '',
    peakMoment      : '',

    // Layer 5 — Lighting
    lightingPreset  : '',
    keyLightSource  : '',
    keyLightPos     : '',
    keyLightQuality : '',
    keyLightTemp    : '',
    keyLightIntensity: 7,
    fillLightSource : '',
    fillIntensity   : 3,
    rimEnabled      : false,
    rimColor        : '',
    rimIntensity    : 5,
    shadowStyle     : '',
    fogEnabled      : false,
    godrayEnabled   : false,
    causticEnabled  : false,
    lightingCond    : '',

    // Layer 6 — Atmosphere
    primaryTone     : '',
    secondaryTone   : '',
    artStyle        : '',
    filmReference   : '',
    colorPalette    : '',
    customColors    : '',
    contrast        : '',
    textureEmphasis : '',
    filmGrain       : '',

    // Layer 7 — Technical
    aspectRatio     : '',
    resolution      : '',
    qualityLevel    : '',
    iso             : '',
    shutterSpeed    : '',
    renderEngine    : '',
    colorGrading    : '',
    lensEffects     : [],
    sharpening      : '',
    codec           : '',
    deliveryFormat  : '',
    stabilization   : '',

    // Layer 8B — Variations
    baseSeed        : 42,
    deterministic   : true,
    batchCount      : 1,
    genreProfile    : '',

    // Layer 8A — Metadata
    title           : '',
    description     : '',
    author          : '',
    tags            : '',
    category        : '',
    targetPlatforms : [],
    version         : 'v1.0',
    notes           : '',

    // Negative prompt extras
    situationalNegs : [],
    additionalNeg   : '',
  };

  // ============================================================
  // 3. JSON DATA CACHE
  // ============================================================

  /** Holds all loaded JSON data, keyed by JSON_FILES keys */
  let DATA = {};

  /**
   * Load all JSON files concurrently.
   * Returns Promise that resolves when all files loaded.
   */
  async function loadAllJSON() {
    showStatus('Loading layer data…', 'info');

    const entries = Object.entries(JSON_FILES);
    const promises = entries.map(async ([key, filename]) => {
      try {
        const resp = await fetch(DATA_PATH + filename);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        DATA[key] = data;
        console.log(`[PGv2] Loaded: ${filename}`);
      } catch (err) {
        console.warn(`[PGv2] Failed to load ${filename}:`, err.message);
        DATA[key] = null; // mark as failed, continue gracefully
      }
    });

    await Promise.all(promises);

    const loaded = Object.values(DATA).filter(Boolean).length;
    console.log(`[PGv2] JSON loaded: ${loaded}/${entries.length} files`);
    showStatus(`${loaded}/${entries.length} data files loaded`, loaded === entries.length ? 'ok' : 'warn');
  }

  // ============================================================
  // 4. DROPDOWN POPULATION
  // ============================================================

  /**
   * Helper: extract flat options array from a JSON field.
   * Supports both {options:[...]} and {groups:[{group_name, options:[...]}]}
   */
  function extractOptions(fieldData) {
    if (!fieldData) return [];

    if (Array.isArray(fieldData.options)) {
      return [{ group: null, options: fieldData.options }];
    }

    if (Array.isArray(fieldData.groups)) {
      return fieldData.groups.map(g => ({
        group  : g.group_name || g.group || 'Other',
        options: g.options || [],
      }));
    }

    return [];
  }

  /**
   * Populate a single <select> element.
   * @param {string}   selectId    - The HTML id attribute of the <select>
   * @param {Array}    groupedOpts - Result of extractOptions()
   * @param {boolean}  addBlank    - Prepend a blank "-- pilih --" option
   */
  function populateSelect(selectId, groupedOpts, addBlank = true) {
    const el = document.getElementById(selectId);
    if (!el) return;

    const prevVal = el.value;
    el.innerHTML = '';

    if (addBlank) {
      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = '-- pilih --';
      el.appendChild(blank);
    }

    groupedOpts.forEach(({ group, options }) => {
      const container = group
        ? (() => { const og = document.createElement('optgroup'); og.label = group; return og; })()
        : el; // no group — append directly to select

      options.forEach(opt => {
        const o = document.createElement('option');
        o.value       = opt.en;
        o.textContent = opt.id ? `${opt.en} — ${opt.id}` : opt.en;
        o.title       = opt.description || '';
        container.appendChild(o);
      });

      if (group) el.appendChild(container);
    });

    // Restore previous value if still valid
    if (prevVal) el.value = prevVal;
  }

  /**
   * Master mapping: select element ID → JSON data path
   *
   * Format: [fileKey, ...nestedKeys]
   * e.g. ['L0_subj', 'subjects', 'subject_type'] means DATA.L0_subj.subjects.subject_type
   */
  const SELECT_MAP = {
    // ── Layer 0 — Primary Subject ──
    subjectType        : ['L0_subj', 'subjects', 'subject_type'],
    archetype          : ['L0_subj', 'subjects', 'archetype'],
    species            : ['L0_subj', 'subjects', 'species'],
    genderPresent      : ['L0_subj', 'subjects', 'gender_presentation'],

    // Physical
    stature            : ['L0_char', 'physical', 'stature'],
    bodyFrame          : ['L0_char', 'physical', 'body_frame'],
    ears               : ['L0_char', 'physical', 'ears'],
    skinColor          : ['L0_char', 'physical', 'skin_color'],
    skinTexture        : ['L0_char', 'physical', 'skin_texture'],
    hairColor          : ['L0_char', 'physical', 'hair_color'],
    hairStyle          : ['L0_char', 'physical', 'hair_style'],
    hairLength         : ['L0_char', 'physical', 'hair_length'],

    // Dressing Room
    outfitPreset       : ['L0_char', 'dressing_room', 'outfit_preset'],
    upperBody          : ['L0_char', 'dressing_room', 'upper_body'],
    lowerBody          : ['L0_char', 'dressing_room', 'lower_body'],
    outerwear          : ['L0_char', 'dressing_room', 'outerwear'],
    footwear           : ['L0_char', 'dressing_room', 'footwear'],
    headwear           : ['L0_char', 'dressing_room', 'headwear'],
    accessories        : ['L0_char', 'dressing_room', 'accessories'],
    physicsEngine      : ['L0_char', 'dressing_room', 'physics_engine'],

    // Pose & Action
    basePose           : ['L0_char', 'pose_action', 'base_pose'],
    actionVerb         : ['L0_char', 'pose_action', 'action_verb'],
    energyLevel        : ['L0_char', 'pose_action', 'energy_level'],
    balance            : ['L0_char', 'pose_action', 'balance'],
    lineOfSight        : ['L0_char', 'pose_action', 'line_of_sight'],

    // Expression
    primaryEmotion     : ['L0_char', 'expression', 'primary_emotion'],
    secondaryEmotion   : ['L0_char', 'expression', 'secondary_emotion'],
    emotionIntensity   : ['L0_char', 'expression', 'intensity'],
    microExpressions   : ['L0_char', 'expression', 'micro_expressions'],
    eyeState           : ['L0_char', 'expression', 'eye_state'],

    // Condition
    physicalCondition  : ['L0_char', 'modifiers', 'physical_condition'],

    // Secondary
    relationshipToPrimary: ['L0_char', 'secondary', 'relationship_to_primary'],
    backgroundEntities   : ['L0_char', 'secondary', 'background_entities'],
    crowdDensity         : ['L0_char', 'secondary', 'crowd_density'],

    // ── Layer 1A — Identity Anchor ──
    lockMethod         : ['L1A', 'identity_anchor', 'lock_method'],
    realisticRace      : ['L1A', 'race_matrix', 'realistic_race'],
    fantasyRace        : ['L1A', 'race_matrix', 'fantasy_race'],
    skinToneRange      : ['L1A', 'race_matrix', 'skin_tone_range'],
    ageRange           : ['L1A', 'age_profile', 'age_range'],
    maturityLevel      : ['L1A', 'age_profile', 'maturity_level'],
    skinCondition      : ['L1A', 'age_profile', 'skin_condition'],
    faceShape          : ['L1A', 'face_dna', 'face_shape'],
    eyeShape           : ['L1A', 'face_dna', 'eye_shape'],
    eyeColor           : ['L1A', 'face_dna', 'eye_color'],
    noseShape          : ['L1A', 'face_dna', 'nose_shape'],
    lipShape           : ['L1A', 'face_dna', 'lip_shape'],
    jawLine            : ['L1A', 'face_dna', 'jaw_line'],
    cheekStructure     : ['L1A', 'face_dna', 'cheek_structure'],
    skinUndertone      : ['L1A', 'face_dna', 'skin_undertone'],
    heightCategory     : ['L1A', 'body_dna', 'height_category'],
    frameType          : ['L1A', 'body_dna', 'frame_type'],
    shoulderWidth      : ['L1A', 'body_dna', 'shoulder_width'],
    waistDef           : ['L1A', 'body_dna', 'waist_definition'],
    limbProportion     : ['L1A', 'body_dna', 'limb_proportion'],
    mj_iw              : ['L1A', 'platform_usage', 'midjourney_iw'],
    mj_cw              : ['L1A', 'platform_usage', 'midjourney_cw'],
    sd_ipadapter       : ['L1A', 'platform_usage', 'sd_ipadapter'],
    kling_faceref      : ['L1A', 'platform_usage', 'kling_faceref'],

    // ── Layer 1B — Technical Constraints ──
    anatomyLocks       : ['L1B', 'anatomy_locks'],
    faceLocks          : ['L1B', 'face_locks'],
    qualityLocks       : ['L1B', 'quality_locks'],

    // ── Layer 2A — Scene Core ──
    primaryFocus       : ['L2A', 'scene_core', 'primary_focus'],
    narrativeMoment    : ['L2A', 'scene_core', 'narrative_moment'],
    era                : ['L2A', 'time_setting', 'era'],
    timeOfDay          : ['L2A', 'time_setting', 'time_of_day'],
    season             : ['L2A', 'time_setting', 'season'],
    timeFlow           : ['L2A', 'time_setting', 'time_flow'],
    locationType       : ['L2A', 'space_setting', 'location_type'],
    sceneScale         : ['L2A', 'space_setting', 'scale'],
    spatialQuality     : ['L2A', 'space_setting', 'spatial_quality'],

    // ── Layer 2B — Environment ──
    settingType        : ['L2B', 'location_detail', 'setting_type'],
    maintenanceState   : ['L2B', 'location_detail', 'maintenance_state'],
    precipitation      : ['L2B', 'weather', 'precipitation'],
    windEffect         : ['L2B', 'weather', 'wind_effect'],
    visibility         : ['L2B', 'weather', 'visibility'],
    skyCondition       : ['L2B', 'weather', 'sky_condition'],
    propImportance     : ['L2B', 'props', 'prop_importance'],

    // ── Layer 3 — Composition ──
    shotType           : ['L3', 'camera_setup', 'shot_type'],
    cameraAngle        : ['L3', 'camera_setup', 'camera_angle'],
    focalLength        : ['L3', 'camera_setup', 'focal_length'],
    aperture           : ['L3', 'camera_setup', 'aperture'],
    cameraStability    : ['L3', 'camera_setup', 'camera_stability'],
    subjectPlacement   : ['L3', 'framing', 'subject_placement'],
    symmetry           : ['L3', 'framing', 'symmetry'],
    leadingLines       : ['L3', 'framing', 'leading_lines'],
    depthLayers        : ['L3', 'framing', 'depth_layers'],
    frameInFrame       : ['L3', 'framing', 'frame_in_frame'],

    // ── Layer 4A — Motion ──
    cameraMovement     : ['L4A', 'camera_movement', 'movement_type'],
    moveDirection      : ['L4A', 'camera_movement', 'direction'],
    moveSpeed          : ['L4A', 'camera_movement', 'speed'],
    moveEasing         : ['L4A', 'camera_movement', 'easing'],
    primaryMotion      : ['L4A', 'subject_motion', 'primary_motion'],
    motionIntensity    : ['L4A', 'subject_motion', 'motion_intensity'],
    clothPhysics       : ['L4A', 'subject_motion', 'cloth_physics'],
    hairPhysics        : ['L4A', 'subject_motion', 'hair_physics'],

    // ── Layer 4B — Temporal ──
    fps                : ['L4B', 'temporal', 'fps'],
    loop               : ['L4B', 'temporal', 'loop'],
    transitionType     : ['L4B', 'temporal', 'transition_type'],

    // ── Layer 5 — Lighting ──
    lightingPreset     : ['L5', 'lighting', 'preset'],
    keyLightSource     : ['L5', 'key_light', 'source_type'],
    keyLightPos        : ['L5', 'key_light', 'position'],
    keyLightQuality    : ['L5', 'key_light', 'quality'],
    keyLightTemp       : ['L5', 'key_light', 'color_temperature'],
    fillLightSource    : ['L5', 'fill_light', 'source_type'],
    shadowStyle        : ['L5', 'shadow', 'shadow_style'],
    lightingCond       : ['L5', 'shadow', 'lighting_condition'],

    // ── Layer 6 — Atmosphere ──
    primaryTone        : ['L6', 'emotional_tone', 'primary_tone'],
    secondaryTone      : ['L6', 'emotional_tone', 'secondary_tone'],
    artStyle           : ['L6', 'visual_style', 'art_style'],
    colorPalette       : ['L6', 'visual_style', 'color_palette'],
    contrast           : ['L6', 'visual_style', 'contrast'],
    textureEmphasis    : ['L6', 'texture_grain', 'texture_emphasis'],
    filmGrain          : ['L6', 'texture_grain', 'film_grain'],

    // ── Layer 7 — Technical ──
    aspectRatio        : ['L7', 'render_specs', 'aspect_ratio'],
    resolution         : ['L7', 'render_specs', 'resolution'],
    qualityLevel       : ['L7', 'render_specs', 'quality_level'],
    iso                : ['L7', 'virtual_camera', 'iso'],
    shutterSpeed       : ['L7', 'virtual_camera', 'shutter_speed'],
    renderEngine       : ['L7', 'virtual_camera', 'render_engine'],
    colorGrading       : ['L7', 'post_processing', 'color_grading'],
    lensEffects        : ['L7', 'post_processing', 'lens_effects'],
    sharpening         : ['L7', 'post_processing', 'sharpening'],
    codec              : ['L7', 'video_specs', 'codec'],
    deliveryFormat     : ['L7', 'video_specs', 'delivery_format'],
    stabilization      : ['L7', 'video_specs', 'stabilization'],

    // ── Layer 8A — Metadata ──
    category           : ['L8A', 'metadata', 'category'],
    targetPlatforms    : ['L8A', 'metadata', 'target_platform'],

    // ── Layer 8B — Variations ──
    genreProfile       : ['L8B', 'variations', 'genre_profile'],

    // ── Layer 8C — Output Config ──
    sectionOrder       : ['L8C', 'output_config', 'section_order'],
    emphasisSyntax     : ['L8C', 'output_config', 'emphasis_syntax'],
    lengthLimit        : ['L8C', 'output_config', 'length_limit'],
    truncation         : ['L8C', 'output_config', 'truncation_strategy'],
    situationalNegs    : ['L8C', 'negative_banks', 'situational_negative_banks'],
  };

  /**
   * Resolve nested JSON path.
   * e.g. getNestedData('L0_subj', ['subjects', 'subject_type'])
   */
  function getNestedData(fileKey, pathArr) {
    let node = DATA[fileKey];
    if (!node) return null;
    for (const key of pathArr) {
      if (node == null) return null;
      node = node[key];
    }
    return node;
  }

  /**
   * Populate all mapped selects from loaded JSON data.
   */
  function populateAllDropdowns() {
    let count = 0;
    for (const [selectId, [fileKey, ...path]] of Object.entries(SELECT_MAP)) {
      const fieldData = getNestedData(fileKey, path);
      if (!fieldData) {
        // JSON not loaded or path wrong — skip silently
        continue;
      }
      const groups = extractOptions(fieldData);
      if (groups.length === 0) continue;
      populateSelect(selectId, groups);
      count++;
    }
    console.log(`[PGv2] Populated ${count} dropdowns`);
  }

  // ============================================================
  // 5. STATE MANAGEMENT
  // ============================================================

  /**
   * Read all form elements and sync into state.
   */
  function syncStateFromForm() {
    // Helper: get select value
    function sv(id) {
      const el = document.getElementById(id);
      return el ? el.value : '';
    }
    // Helper: get multi-select values
    function smv(id) {
      const el = document.getElementById(id);
      if (!el) return [];
      return Array.from(el.selectedOptions).map(o => o.value);
    }
    // Helper: get input value
    function iv(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }
    // Helper: get checkbox value
    function cv(id) {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    }
    // Helper: get number value
    function nv(id, def = 0) {
      const el = document.getElementById(id);
      return el ? (parseFloat(el.value) || def) : def;
    }

    // Generator type
    state.generatorType  = sv('generatorType');
    state.platform       = sv('targetPlatformActive');
    state.sectionOrder   = sv('sectionOrder');
    state.emphasisSyntax = sv('emphasisSyntax');
    state.separator      = sv('separator') || ', ';
    state.lengthLimit    = parseInt(sv('lengthLimit')) || 1000;
    state.truncation     = sv('truncation');

    // L1A
    state.characterName  = iv('characterName');
    state.lockMethod     = sv('lockMethod');
    state.identityLocked = cv('lockIdentity');
    state.realisticRace  = sv('realisticRace');
    state.fantasyRace    = sv('fantasyRace');
    state.skullLocksOut  = iv('skullLocksOut');
    state.skinToneRange  = sv('skinToneRange');
    state.lockRace       = cv('lockRace');
    state.ageRange       = sv('ageRange');
    state.maturityLevel  = sv('maturityLevel');
    state.lockAge        = cv('lockAge');
    state.faceShape      = sv('faceShape');
    state.eyeShape       = sv('eyeShape');
    state.eyeColor       = sv('eyeColor');
    state.noseShape      = sv('noseShape');
    state.lipShape       = sv('lipShape');
    state.jawLine        = sv('jawLine');
    state.cheekStructure = sv('cheekStructure');
    state.skinUndertone  = sv('skinUndertone');
    state.lockEyes       = cv('lockEyes');
    state.heightCategory = sv('heightCategory');
    state.frameType      = sv('frameType');
    state.lockHeight     = cv('lockHeight');
    state.lockFrame      = cv('lockFrame');
    state.shoulderWidth  = sv('shoulderWidth');
    state.waistDef       = sv('waistDef');
    state.limbProportion = sv('limbProportion');

    // L1B
    state.negativeDNA    = iv('negativeDNA') || (document.querySelector('textarea[placeholder*="wrong race"]')?.value || '');
    state.anatomyLocks   = smv('anatomyLocks');
    state.faceLocks      = smv('faceLocks');
    state.qualityLocks   = smv('qualityLocks');

    // L0 — Subjects
    state.subjectType       = sv('subjectType');
    state.archetype         = sv('archetype');
    state.species           = sv('species');
    state.genderPresent     = sv('genderPresent');
    state.stature           = sv('stature');
    state.bodyFrame         = sv('bodyFrame');
    state.ears              = sv('ears');
    state.skinColor         = sv('skinColor');
    state.skinTexture       = sv('skinTexture');
    state.hairColor         = sv('hairColor');
    state.hairStyle         = sv('hairStyle');
    state.hairLength        = sv('hairLength');
    state.distinctiveFeatures = iv('distinctiveFeatures') || (document.querySelector('input[placeholder*="scar_across"]')?.value || '');
    state.outfitPreset      = sv('outfitPreset');
    state.upperBody         = sv('upperBody');
    state.lowerBody         = sv('lowerBody');
    state.outerwear         = sv('outerwear');
    state.footwear          = sv('footwear');
    state.headwear          = sv('headwear');
    state.accessories       = smv('accessories');
    state.physicsEngine     = sv('physicsEngine');
    state.basePose          = sv('basePose');
    state.actionVerb        = sv('actionVerb');
    state.actionObject      = iv('actionObject') || (document.querySelector('input[placeholder*="ancient_artifact"]')?.value || '');
    state.energyLevel       = sv('energyLevel');
    state.balance           = sv('balance');
    state.lineOfSight       = sv('lineOfSight');
    state.primaryEmotion    = sv('primaryEmotion');
    state.secondaryEmotion  = sv('secondaryEmotion');
    state.emotionIntensity  = sv('emotionIntensity');
    state.microExpressions  = smv('microExpressions');
    state.eyeState          = sv('eyeState');
    state.cybernetics       = iv('cybernetics') || (document.querySelector('input[placeholder*="cybernetic_right"]')?.value || '');
    state.magicalEffects    = iv('magicalEffects') || (document.querySelector('input[placeholder*="aura_golden"]')?.value || '');
    state.physicalCondition = sv('physicalCondition');
    state.relationshipToPrimary = sv('relationshipToPrimary');
    state.backgroundEntities    = sv('backgroundEntities');
    state.crowdDensity          = sv('crowdDensity');

    // L2A
    state.primaryFocus   = sv('primaryFocus');
    state.narrativeMoment= sv('narrativeMoment');
    state.era            = sv('era');
    state.timeOfDay      = sv('timeOfDay');
    state.season         = sv('season');
    state.timeFlow       = sv('timeFlow');
    state.locationType   = sv('locationType');
    state.specificPlace  = iv('specificPlace') || (document.querySelector('input[placeholder*="abandoned metro"]')?.value || '');
    state.sceneScale     = sv('sceneScale');
    state.spatialQuality = sv('spatialQuality');

    // L2B
    state.settingType       = sv('settingType');
    state.geoContext        = iv('geoContext') || (document.querySelector('input[placeholder*="Neo Tokyo"]')?.value || '');
    state.maintenanceState  = sv('maintenanceState');
    state.structuralFeats   = iv('structuralFeats') || (document.querySelector('input[placeholder*="exposed_pipes"]')?.value || '');
    state.precipitation     = sv('precipitation');
    state.windEffect        = sv('windEffect');
    state.visibility        = sv('visibility');
    state.skyCondition      = sv('skyCondition');
    state.keyProps          = iv('keyProps') || (document.querySelector('input[placeholder*="ancient_sword"]')?.value || '');
    state.propImportance    = sv('propImportance');

    // L3
    state.shotType         = sv('shotType');
    state.cameraAngle      = sv('cameraAngle');
    state.focalLength      = sv('focalLength');
    state.aperture         = sv('aperture');
    state.cameraStability  = sv('cameraStability');
    state.subjectPlacement = sv('subjectPlacement');
    state.symmetry         = sv('symmetry');
    state.leadingLines     = sv('leadingLines');
    state.depthLayers      = sv('depthLayers');
    state.foregroundElem   = iv('foregroundElem') || (document.querySelector('input[placeholder*="blurred foliage"]')?.value || '');
    state.frameInFrame     = sv('frameInFrame');

    // L4A
    state.cameraMovement  = sv('cameraMovement');
    state.moveDirection   = sv('moveDirection');
    state.moveSpeed       = sv('moveSpeed');
    state.moveEasing      = sv('moveEasing');
    state.primaryMotion   = sv('primaryMotion');
    state.motionIntensity = sv('motionIntensity');
    state.clothPhysics    = sv('clothPhysics');
    state.hairPhysics     = sv('hairPhysics');
    state.particleEffects = iv('particleEffects') || (document.querySelector('input[placeholder*="floating_petals"]')?.value || '');

    // L4B
    state.duration       = iv('duration') || (document.querySelector('input[type="number"][value="5"]')?.value || '5');
    state.fps            = sv('fps');
    state.loop           = sv('loop');
    state.transitionType = sv('transitionType');
    state.actionAtStart  = iv('actionAtStart') || (document.querySelector('input[placeholder*="character_stands"]')?.value || '');
    state.actionAtEnd    = iv('actionAtEnd') || (document.querySelector('input[placeholder*="character_turns"]')?.value || '');
    state.peakMoment     = iv('peakMoment') || (document.querySelector('input[placeholder*="expression_change"]')?.value || '');

    // L5
    state.lightingPreset    = sv('lightingPreset');
    state.keyLightSource    = sv('keyLightSource');
    state.keyLightPos       = sv('keyLightPos');
    state.keyLightQuality   = sv('keyLightQuality');
    state.keyLightTemp      = sv('keyLightTemp');
    state.keyLightIntensity = nv('keyLightIntensity', 7);
    state.fillLightSource   = sv('fillLightSource');
    state.fillIntensity     = nv('fillIntensity', 3);
    state.rimEnabled        = cv('rimEnable');
    state.rimColor          = iv('rimColor') || (document.querySelector('input[placeholder*="cyan, gold"]')?.value || '');
    state.rimIntensity      = nv('rimIntensity', 5);
    state.shadowStyle       = sv('shadowStyle');
    state.fogEnabled        = cv('fogEnable');
    state.godrayEnabled     = cv('godrayEnable');
    state.causticEnabled    = cv('causticEnable');
    state.lightingCond      = sv('lightingCond');

    // L6
    state.primaryTone    = sv('primaryTone');
    state.secondaryTone  = sv('secondaryTone');
    state.artStyle       = sv('artStyle');
    state.filmReference  = iv('filmReference') || (document.querySelector('input[placeholder*="Blade Runner"]')?.value || '');
    state.colorPalette   = sv('colorPalette');
    state.customColors   = iv('customColors') || (document.querySelector('input[placeholder*="neon magenta"]')?.value || '');
    state.contrast       = sv('contrast');
    state.textureEmphasis= sv('textureEmphasis');
    state.filmGrain      = sv('filmGrain');

    // L7
    state.aspectRatio    = sv('aspectRatio');
    state.resolution     = sv('resolution');
    state.qualityLevel   = sv('qualityLevel');
    state.iso            = sv('iso');
    state.shutterSpeed   = sv('shutterSpeed');
    state.renderEngine   = sv('renderEngine');
    state.colorGrading   = sv('colorGrading');
    state.lensEffects    = smv('lensEffects');
    state.sharpening     = sv('sharpening');
    state.codec          = sv('codec');
    state.deliveryFormat = sv('deliveryFormat');
    state.stabilization  = sv('stabilization');

    // L8B
    state.baseSeed      = nv('baseSeed', 42);
    state.deterministic = cv('seedLock');
    state.batchCount    = nv('batchCount', 1);
    state.genreProfile  = sv('genreProfile');

    // L8A
    state.title          = iv('metaTitle') || (document.querySelector('input[placeholder*="Eira in Forest"]')?.value || '');
    state.description    = iv('metaDesc') || '';
    state.author         = iv('metaAuthor') || (document.querySelector('input[placeholder*="Your name"]')?.value || '');
    state.tags           = iv('metaTags') || (document.querySelector('input[placeholder*="fantasy, dark"]')?.value || '');
    state.category       = sv('category');
    state.targetPlatforms= smv('targetPlatforms');
    state.version        = iv('metaVersion') || (document.querySelector('input[placeholder*="v1.0"]')?.value || 'v1.0');

    // Negative extras
    state.situationalNegs = smv('situationalNegs');
    state.additionalNeg   = iv('additionalNeg') || (document.querySelector('textarea[placeholder*="cluttered background"]')?.value || '');
  }

  /**
   * Apply state values back to form elements.
   * Used when loading templates or importing JSON.
   */
  function applyStateToForm(s) {
    function setv(id, val) {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.value = val;
    }
    function setc(id, val) {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    }
    function setmv(id, vals) {
      const el = document.getElementById(id);
      if (!el || !Array.isArray(vals)) return;
      Array.from(el.options).forEach(o => { o.selected = vals.includes(o.value); });
    }

    if (!s) return;

    // Generator
    setv('generatorType', s.generatorType);
    setv('sectionOrder', s.sectionOrder);
    setv('emphasisSyntax', s.emphasisSyntax);
    setv('separator', s.separator);
    setv('lengthLimit', s.lengthLimit);
    setv('truncation', s.truncation);

    // L1A
    setv('characterName', s.characterName);
    setc('lockIdentity', s.identityLocked);
    setv('realisticRace', s.realisticRace);
    setv('fantasyRace', s.fantasyRace);
    setv('skinToneRange', s.skinToneRange);
    setc('lockRace', s.lockRace);
    setv('ageRange', s.ageRange);
    setv('maturityLevel', s.maturityLevel);
    setc('lockAge', s.lockAge);
    setv('faceShape', s.faceShape);
    setv('eyeShape', s.eyeShape);
    setv('eyeColor', s.eyeColor);
    setc('lockEyes', s.lockEyes);
    setv('noseShape', s.noseShape);
    setv('lipShape', s.lipShape);
    setv('jawLine', s.jawLine);
    setv('cheekStructure', s.cheekStructure);
    setv('skinUndertone', s.skinUndertone);
    setv('heightCategory', s.heightCategory);
    setv('frameType', s.frameType);
    setc('lockHeight', s.lockHeight);
    setc('lockFrame', s.lockFrame);
    setv('shoulderWidth', s.shoulderWidth);
    setv('waistDef', s.waistDef);
    setv('limbProportion', s.limbProportion);

    // L0
    setv('subjectType', s.subjectType);
    setv('archetype', s.archetype);
    setv('species', s.species);
    setv('genderPresent', s.genderPresent);
    setv('stature', s.stature);
    setv('bodyFrame', s.bodyFrame);
    setv('ears', s.ears);
    setv('skinColor', s.skinColor);
    setv('skinTexture', s.skinTexture);
    setv('hairColor', s.hairColor);
    setv('hairStyle', s.hairStyle);
    setv('hairLength', s.hairLength);
    setv('outfitPreset', s.outfitPreset);
    setv('upperBody', s.upperBody);
    setv('lowerBody', s.lowerBody);
    setv('outerwear', s.outerwear);
    setv('footwear', s.footwear);
    setv('headwear', s.headwear);
    setmv('accessories', s.accessories);
    setv('physicsEngine', s.physicsEngine);
    setv('basePose', s.basePose);
    setv('actionVerb', s.actionVerb);
    setv('energyLevel', s.energyLevel);
    setv('balance', s.balance);
    setv('lineOfSight', s.lineOfSight);
    setv('primaryEmotion', s.primaryEmotion);
    setv('secondaryEmotion', s.secondaryEmotion);
    setv('emotionIntensity', s.emotionIntensity);
    setmv('microExpressions', s.microExpressions);
    setv('eyeState', s.eyeState);
    setv('physicalCondition', s.physicalCondition);

    // L2A
    setv('primaryFocus', s.primaryFocus);
    setv('narrativeMoment', s.narrativeMoment);
    setv('era', s.era);
    setv('timeOfDay', s.timeOfDay);
    setv('season', s.season);
    setv('timeFlow', s.timeFlow);
    setv('locationType', s.locationType);
    setv('sceneScale', s.sceneScale);
    setv('spatialQuality', s.spatialQuality);

    // L2B
    setv('settingType', s.settingType);
    setv('maintenanceState', s.maintenanceState);
    setv('precipitation', s.precipitation);
    setv('windEffect', s.windEffect);
    setv('visibility', s.visibility);
    setv('skyCondition', s.skyCondition);
    setv('propImportance', s.propImportance);

    // L3
    setv('shotType', s.shotType);
    setv('cameraAngle', s.cameraAngle);
    setv('focalLength', s.focalLength);
    setv('aperture', s.aperture);
    setv('cameraStability', s.cameraStability);
    setv('subjectPlacement', s.subjectPlacement);
    setv('symmetry', s.symmetry);
    setv('leadingLines', s.leadingLines);
    setv('depthLayers', s.depthLayers);
    setv('frameInFrame', s.frameInFrame);

    // L4A
    setv('cameraMovement', s.cameraMovement);
    setv('moveDirection', s.moveDirection);
    setv('moveSpeed', s.moveSpeed);
    setv('moveEasing', s.moveEasing);
    setv('primaryMotion', s.primaryMotion);
    setv('motionIntensity', s.motionIntensity);
    setv('clothPhysics', s.clothPhysics);
    setv('hairPhysics', s.hairPhysics);

    // L4B
    setv('fps', s.fps);
    setv('loop', s.loop);
    setv('transitionType', s.transitionType);

    // L5
    setv('lightingPreset', s.lightingPreset);
    setv('keyLightSource', s.keyLightSource);
    setv('keyLightPos', s.keyLightPos);
    setv('keyLightQuality', s.keyLightQuality);
    setv('keyLightTemp', s.keyLightTemp);
    setv('shadowStyle', s.shadowStyle);
    setv('lightingCond', s.lightingCond);
    setc('rimEnable', s.rimEnabled);
    setc('fogEnable', s.fogEnabled);
    setc('godrayEnable', s.godrayEnabled);
    setc('causticEnable', s.causticEnabled);

    // L6
    setv('primaryTone', s.primaryTone);
    setv('secondaryTone', s.secondaryTone);
    setv('artStyle', s.artStyle);
    setv('colorPalette', s.colorPalette);
    setv('contrast', s.contrast);
    setv('textureEmphasis', s.textureEmphasis);
    setv('filmGrain', s.filmGrain);

    // L7
    setv('aspectRatio', s.aspectRatio);
    setv('resolution', s.resolution);
    setv('qualityLevel', s.qualityLevel);
    setv('iso', s.iso);
    setv('shutterSpeed', s.shutterSpeed);
    setv('renderEngine', s.renderEngine);
    setv('colorGrading', s.colorGrading);
    setmv('lensEffects', s.lensEffects);
    setv('sharpening', s.sharpening);
    setv('codec', s.codec);
    setv('deliveryFormat', s.deliveryFormat);
    setv('stabilization', s.stabilization);

    // Weights
    if (s.weights) {
      applyWeightsToSliders(s.weights);
    }
  }

  // ── LocalStorage persistence ──

  function saveStateToStorage() {
    try {
      localStorage.setItem(LS_KEY_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('[PGv2] localStorage save failed:', e.message);
    }
  }

  function loadStateFromStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY_STATE);
      if (raw) {
        const saved = JSON.parse(raw);
        // Merge saved into default state (protect against missing keys)
        state = Object.assign({}, state, saved);
        state.weights = Object.assign({}, DEFAULT_WEIGHTS, saved.weights || {});
        applyStateToForm(state);
        console.log('[PGv2] State restored from localStorage');
      }
    } catch (e) {
      console.warn('[PGv2] localStorage load failed:', e.message);
    }
  }

  // ============================================================
  // 6. PROMPT GENERATION
  // ============================================================

  /**
   * Apply emphasis syntax to a token based on its weight.
   * @param {string} token
   * @param {number} weight  — section weight (0.5 – 2.0)
   * @param {string} syntax  — 'none' | 'parentheses' | 'natural_repetition' | 'attention_markers'
   */
  function emphasize(token, weight, syntax) {
    if (!token) return '';
    if (syntax === 'parentheses' || syntax === 'weight_suffix') {
      if (weight >= 1.5) return `(${token}:${weight.toFixed(1)})`;
      if (weight <= 0.7) return `[${token}]`;
    }
    if (syntax === 'natural_repetition' && weight >= 1.8) {
      return `${token}, ${token}`;
    }
    if (syntax === 'attention_markers' && weight >= 1.5) {
      return `highly detailed ${token}`;
    }
    return token;
  }

  /**
   * Filter tokens below minimum weight threshold from the prompt.
   * Sections with weight 0 are excluded entirely.
   */
  function weightedTokens(tokens, weight, syntax) {
    if (weight <= 0) return [];
    return tokens
      .filter(t => t && t.trim())
      .map(t => emphasize(t.trim(), weight, syntax));
  }

  /**
   * Build the identity/character description string (L1A + L0 combined).
   */
  function buildIdentitySection(s, syntax) {
    const w = s.weights.identity;
    const tokens = [];

    // Character name
    if (s.characterName) tokens.push(s.characterName);

    // Race + age + maturity
    if (s.realisticRace)  tokens.push(s.realisticRace);
    if (s.ageRange)       tokens.push(s.ageRange);
    if (s.fantasyRace && s.fantasyRace !== 'none') tokens.push(s.fantasyRace + ' features');

    // Face DNA
    if (s.eyeShape)      tokens.push(s.eyeShape + ' eyes');
    if (s.eyeColor)      tokens.push(s.eyeColor + ' eye color');
    if (s.faceShape)     tokens.push(s.faceShape + ' face shape');
    if (s.noseShape)     tokens.push(s.noseShape + ' nose');
    if (s.lipShape)      tokens.push(s.lipShape + ' lips');
    if (s.jawLine)       tokens.push(s.jawLine + ' jawline');
    if (s.cheekStructure)tokens.push(s.cheekStructure + ' cheekbones');
    if (s.skinUndertone) tokens.push(s.skinUndertone + ' skin undertone');

    // Body DNA
    if (s.heightCategory) tokens.push(s.heightCategory);
    if (s.frameType)      tokens.push(s.frameType + ' build');

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build the subjects/character visual description (L0).
   */
  function buildSubjectsSection(s, syntax) {
    const w = s.weights.subjects;
    const tokens = [];

    // Physical appearance
    if (s.skinColor)   tokens.push(s.skinColor + ' skin');
    if (s.skinTexture) tokens.push(s.skinTexture + ' skin texture');
    if (s.hairColor)   tokens.push(s.hairColor + ' hair');
    if (s.hairStyle)   tokens.push(s.hairStyle + ' hairstyle');
    if (s.hairLength)  tokens.push(s.hairLength + ' hair length');
    if (s.ears && s.ears !== 'human_normal') tokens.push(s.ears);
    if (s.distinctiveFeatures) tokens.push(s.distinctiveFeatures);

    // Outfit
    if (s.upperBody)  tokens.push(s.upperBody);
    if (s.lowerBody)  tokens.push(s.lowerBody);
    if (s.outerwear)  tokens.push(s.outerwear);
    if (s.footwear && s.footwear !== 'barefoot') tokens.push(s.footwear);
    if (s.headwear && s.headwear !== 'no headwear') tokens.push(s.headwear);
    if (s.accessories && s.accessories.length) tokens.push(...s.accessories);

    // Modifiers
    if (s.cybernetics)       tokens.push(s.cybernetics);
    if (s.magicalEffects)    tokens.push(s.magicalEffects);
    if (s.physicalCondition) tokens.push(s.physicalCondition);

    // Pose
    if (s.basePose)   tokens.push(s.basePose.replace(/_/g, ' '));
    if (s.actionVerb) tokens.push(s.actionVerb.replace(/_/g, ' '));
    if (s.actionObject) tokens.push('with ' + s.actionObject);

    // Expression
    if (s.primaryEmotion)  tokens.push(s.primaryEmotion.replace(/_/g, ' ') + ' expression');
    if (s.eyeState)        tokens.push(s.eyeState.replace(/_/g, ' ') + ' eyes');
    if (s.microExpressions && s.microExpressions.length) tokens.push(...s.microExpressions.map(e => e.replace(/_/g, ' ')));

    // Line of sight
    if (s.lineOfSight && s.lineOfSight !== 'at_camera') tokens.push('looking ' + s.lineOfSight.replace('away_', ''));

    // Secondary
    if (s.backgroundEntities && s.backgroundEntities !== 'none') tokens.push(s.backgroundEntities.replace(/_/g, ' ') + ' in background');

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build Scene Core + Environment section (L2A + L2B).
   */
  function buildSceneSection(s, syntax) {
    const tokens = [];

    // Scene core (own weight)
    const sceneTokens = [];
    if (s.specificPlace)  sceneTokens.push(s.specificPlace);
    if (s.locationType)   sceneTokens.push(s.locationType.replace(/_/g, ' '));
    if (s.era)            sceneTokens.push(s.era);
    if (s.timeOfDay)      sceneTokens.push(s.timeOfDay.replace(/_/g, ' '));
    if (s.season)         sceneTokens.push(s.season + ' season');
    if (s.narrativeMoment)sceneTokens.push(s.narrativeMoment.replace(/_/g, ' '));
    tokens.push(...weightedTokens(sceneTokens, s.weights.scene, syntax));

    // Environment
    const envTokens = [];
    if (s.geoContext)        envTokens.push(s.geoContext);
    if (s.settingType)       envTokens.push(s.settingType.replace(/_/g, ' '));
    if (s.maintenanceState && s.maintenanceState !== 'pristine_new') envTokens.push(s.maintenanceState.replace(/_/g, ' '));
    if (s.structuralFeats)   envTokens.push(s.structuralFeats);
    if (s.precipitation && s.precipitation !== 'none_clear') envTokens.push(s.precipitation.replace(/_/g, ' '));
    if (s.windEffect && s.windEffect !== 'calm_still') envTokens.push(s.windEffect.replace(/_/g, ' ') + ' wind');
    if (s.skyCondition)      envTokens.push(s.skyCondition.replace(/_/g, ' '));
    if (s.keyProps)          envTokens.push(s.keyProps);
    tokens.push(...weightedTokens(envTokens, s.weights.environment, syntax));

    return tokens;
  }

  /**
   * Build Composition section (L3).
   */
  function buildCompositionSection(s, syntax) {
    const w = s.weights.composition;
    const tokens = [];

    if (s.shotType)         tokens.push(s.shotType.replace(/_/g, ' ').replace(/ECU|MS|CU|LS|EWS/g, ''));
    if (s.cameraAngle && s.cameraAngle !== 'eye_level') tokens.push(s.cameraAngle.replace(/_/g, ' ') + ' angle');
    if (s.focalLength)      tokens.push(s.focalLength + ' lens');
    if (s.aperture)         tokens.push(s.aperture);
    if (s.subjectPlacement && s.subjectPlacement !== 'center') tokens.push('subject ' + s.subjectPlacement.replace(/_/g, ' '));
    if (s.depthLayers && s.depthLayers !== 'flat_no_depth') tokens.push(s.depthLayers.replace(/_/g, ' '));
    if (s.foregroundElem)   tokens.push('foreground: ' + s.foregroundElem);
    if (s.frameInFrame && s.frameInFrame !== 'none') tokens.push('frame within frame');
    if (s.leadingLines && s.leadingLines !== 'none') tokens.push(s.leadingLines.replace(/_/g, ' ') + ' leading lines');

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build Lighting section (L5).
   */
  function buildLightingSection(s, syntax) {
    const w = s.weights.lighting;
    const tokens = [];

    if (s.lightingPreset)  tokens.push(s.lightingPreset.replace(/_/g, ' ') + ' lighting');
    if (s.keyLightSource)  tokens.push(s.keyLightSource.replace(/_/g, ' ') + ' key light');
    if (s.keyLightPos)     tokens.push('light from ' + s.keyLightPos.replace(/_/g, ' '));
    if (s.keyLightQuality) tokens.push(s.keyLightQuality + ' light quality');
    if (s.keyLightTemp)    tokens.push(s.keyLightTemp);
    if (s.fillLightSource && s.fillLightSource !== 'none') tokens.push(s.fillLightSource.replace(/_/g, ' ') + ' fill light');
    if (s.rimEnabled && s.rimColor) tokens.push(s.rimColor + ' rim light');
    if (s.shadowStyle)     tokens.push(s.shadowStyle.replace(/_/g, ' ') + ' shadows');
    if (s.fogEnabled)      tokens.push('volumetric fog');
    if (s.godrayEnabled)   tokens.push('god rays');
    if (s.causticEnabled)  tokens.push('caustic light');
    if (s.lightingCond)    tokens.push(s.lightingCond.replace(/_/g, ' '));

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build Atmosphere section (L6).
   */
  function buildAtmosphereSection(s, syntax) {
    const w = s.weights.atmosphere;
    const tokens = [];

    if (s.primaryTone)   tokens.push(s.primaryTone.replace(/_/g, ' ') + ' mood');
    if (s.secondaryTone && s.secondaryTone !== 'none') tokens.push(s.secondaryTone.replace(/_/g, ' ') + ' undertone');
    if (s.artStyle)      tokens.push(s.artStyle.replace(/_/g, ' ') + ' style');
    if (s.filmReference) tokens.push('inspired by ' + s.filmReference);
    if (s.colorPalette)  tokens.push(s.colorPalette.replace(/_/g, ' ') + ' color palette');
    if (s.customColors)  tokens.push(s.customColors);
    if (s.contrast)      tokens.push(s.contrast.replace(/_/g, ' ') + ' contrast');
    if (s.filmGrain && s.filmGrain !== 'none_clean') tokens.push(s.filmGrain.replace(/_/g, ' ') + ' grain');

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build Technical section (L7).
   */
  function buildTechnicalSection(s, syntax) {
    const w = s.weights.technical;
    if (w <= 0) return [];
    const tokens = [];

    if (s.aspectRatio)  tokens.push(s.aspectRatio + ' aspect ratio');
    if (s.resolution)   tokens.push(s.resolution);
    if (s.renderEngine) tokens.push('rendered in ' + s.renderEngine);
    if (s.iso)          tokens.push('ISO ' + s.iso);
    if (s.colorGrading) tokens.push(s.colorGrading.replace(/_/g, ' ') + ' color grade');
    if (s.lensEffects && s.lensEffects.length) tokens.push(...s.lensEffects);
    if (s.sharpening && s.sharpening !== 'none_soft') tokens.push(s.sharpening.replace(/_/g, ' ') + ' sharpening');

    return weightedTokens(tokens, w, syntax);
  }

  /**
   * Build Motion section (L4A + L4B) — video only.
   */
  function buildMotionSection(s, syntax) {
    if (s.generatorType === 'image') return [];
    const wMot  = s.weights.motion;
    const wTemp = s.weights.temporal;
    const tokens = [];

    const motTokens = [];
    if (s.cameraMovement && s.cameraMovement !== 'static_locked') motTokens.push(s.cameraMovement.replace(/_/g, ' ') + ' camera');
    if (s.moveDirection)  motTokens.push('moving ' + s.moveDirection);
    if (s.moveSpeed)      motTokens.push(s.moveSpeed.replace(/_/g, ' ') + ' speed');
    if (s.primaryMotion)  motTokens.push(s.primaryMotion.replace(/_/g, ' '));
    if (s.clothPhysics && s.clothPhysics !== 'none') motTokens.push(s.clothPhysics.replace(/_/g, ' ') + ' cloth movement');
    if (s.hairPhysics && s.hairPhysics !== 'none')   motTokens.push(s.hairPhysics.replace(/_/g, ' ') + ' hair physics');
    if (s.particleEffects) motTokens.push(s.particleEffects);
    tokens.push(...weightedTokens(motTokens, wMot, syntax));

    const tempTokens = [];
    if (s.duration)       tempTokens.push(s.duration + ' seconds');
    if (s.fps)            tempTokens.push(s.fps + ' fps');
    if (s.loop === 'true') tempTokens.push('seamless loop');
    if (s.actionAtStart)  tempTokens.push('starts with: ' + s.actionAtStart);
    if (s.actionAtEnd)    tempTokens.push('ends with: ' + s.actionAtEnd);
    tokens.push(...weightedTokens(tempTokens, wTemp, syntax));

    return tokens;
  }

  /**
   * Sort sections according to sectionOrder setting.
   */
  function orderSections(sections, order) {
    const orders = {
      identity_first : ['identity', 'subjects', 'lighting', 'composition', 'atmosphere', 'scene', 'environment', 'motion', 'technical'],
      cinematic_order: ['composition', 'subjects', 'lighting', 'scene', 'atmosphere', 'identity', 'motion', 'technical'],
      scene_first    : ['scene', 'environment', 'atmosphere', 'lighting', 'identity', 'subjects', 'composition', 'motion', 'technical'],
      mood_first     : ['atmosphere', 'lighting', 'identity', 'subjects', 'scene', 'environment', 'composition', 'motion', 'technical'],
      video_optimized: ['identity', 'subjects', 'motion', 'composition', 'lighting', 'scene', 'atmosphere', 'technical'],
      sdxl_budget    : ['identity', 'subjects', 'lighting', 'composition'],
    };

    const seq = orders[order] || orders.identity_first;
    const result = [];
    seq.forEach(key => {
      if (sections[key] && sections[key].length) result.push(...sections[key]);
    });
    return result;
  }

  /**
   * Build negative prompt string from L1B + situational banks + manual.
   */
  function buildNegativePrompt(s) {
    const parts = [];

    // Manual negative DNA from L1B
    if (s.negativeDNA) {
      parts.push(...s.negativeDNA.split('\n').map(l => l.trim()).filter(Boolean));
    }

    // Anatomy locks
    if (s.anatomyLocks && s.anatomyLocks.length) {
      parts.push(...s.anatomyLocks.map(v => v.replace(/no_/g, '').replace(/_/g, ' ')));
    }

    // Face locks
    if (s.faceLocks && s.faceLocks.length) {
      parts.push(...s.faceLocks.map(v => v.replace(/no_/g, '').replace(/_/g, ' ')));
    }

    // Quality locks
    if (s.qualityLocks && s.qualityLocks.length) {
      parts.push(...s.qualityLocks.map(v => v.replace(/no_/g, '').replace(/_/g, ' ')));
    }

    // Situational banks
    const negBanks = {
      clean_portrait_background : 'cluttered background, busy background',
      no_text_artifacts         : 'text, watermark, signature, username',
      no_extra_characters       : 'extra people, multiple subjects',
      cinematic_quality         : 'amateur, low production value',
      anatomy_protection        : 'extra fingers, deformed hands, extra limbs, anatomy distortion, merged fingers, floating limbs',
      face_protection           : 'wrong race, age drift, deformed face, asymmetric face, crossed eyes, plastic skin',
      'style_protection (no cartoon/anime)': 'cartoon, anime style, flat colors, 2D illustration',
      video_motion_quality      : 'stuttering, jitter, flicker, motion artifacts',
      outdoor_scene_clean       : 'interior elements in outdoor, incongruent background',
      'period_accuracy (no modern elements)': 'anachronistic elements, modern technology in period setting',
    };

    if (s.situationalNegs && s.situationalNegs.length) {
      s.situationalNegs.forEach(key => {
        const val = negBanks[key];
        if (val) parts.push(val);
      });
    }

    // Manual additional
    if (s.additionalNeg) {
      parts.push(...s.additionalNeg.split(',').map(p => p.trim()).filter(Boolean));
    }

    // Deduplicate
    return [...new Set(parts)].join(', ');
  }

  /**
   * Truncate prompt to character limit while respecting priority.
   */
  function truncatePrompt(tokens, limit, strategy) {
    let prompt = tokens.join(', ');
    if (prompt.length <= limit) return prompt;

    if (strategy === 'front_preserve') {
      return prompt.substring(0, limit);
    }

    if (strategy === 'proportional_trim') {
      // Remove from end
      while (prompt.length > limit && tokens.length) {
        tokens.pop();
        prompt = tokens.join(', ');
      }
      return prompt;
    }

    if (strategy === 'keyword_compress') {
      // Remove descriptors, keep core nouns
      return tokens
        .map(t => t.split(' ')[0]) // take first word of each token
        .join(', ')
        .substring(0, limit);
    }

    // Default: priority_only — trim from end
    while (prompt.length > limit && tokens.length) {
      tokens.pop();
      prompt = tokens.join(', ');
    }
    return prompt;
  }

  /**
   * Main generate function — builds positive prompt, negative prompt, JSON export.
   */
  function generatePrompt() {
    syncStateFromForm();
    saveStateToStorage();

    const syntax = state.emphasisSyntax;

    // Build each section
    const sections = {
      identity   : buildIdentitySection(state, syntax),
      subjects   : buildSubjectsSection(state, syntax),
      scene      : buildSceneSection(state, syntax),
      composition: buildCompositionSection(state, syntax),
      lighting   : buildLightingSection(state, syntax),
      atmosphere : buildAtmosphereSection(state, syntax),
      technical  : buildTechnicalSection(state, syntax),
      motion     : buildMotionSection(state, syntax),
    };

    // Order sections
    const orderedTokens = orderSections(sections, state.sectionOrder);

    // Apply separator & truncate
    const sep    = state.separator || ', ';
    let positive = orderedTokens.filter(Boolean).join(sep);
    positive     = truncatePrompt(orderedTokens, state.lengthLimit, state.truncation);

    // Append platform params
    const platParams = getPlatformParams();
    if (platParams) positive += '\n\n' + platParams;

    // Negative
    const negative = buildNegativePrompt(state);

    // Output to textareas
    setOutputTextarea('positive', positive);
    setOutputTextarea('negative', negative);

    // JSON output
    const jsonOut = buildExportJSON();
    setOutputTextarea('json', JSON.stringify(jsonOut, null, 2));

    // Update platform params display
    updatePlatformDisplay();

    showStatus('Prompt generated!', 'ok');
    console.log('[PGv2] Prompt generated, chars:', positive.length);
  }

  /**
   * Find output textarea by role (positive / negative / json).
   */
  function setOutputTextarea(role, text) {
    const textareas = document.querySelectorAll('textarea.output');
    const idx = { positive: 0, negative: 1, json: 2 };
    const el  = textareas[idx[role]];
    if (el) {
      el.value = text;
      el.readOnly = false; // allow copy
    }
  }

  // ============================================================
  // 7. SECTION WEIGHTS SYSTEM
  // ============================================================

  /**
   * Map of slider IDs (in weight-grid) to state.weights keys.
   * Order must match DOM order in .weight-grid
   */
  const WEIGHT_IDS = [
    // First two are locked (no slider): identity, constraints
    { stateKey: 'subjects',    sliderId: 'wSliderSubj',  displayId: 'wSubj'  },
    { stateKey: 'lighting',    sliderId: 'wSliderLight', displayId: 'wLight' },
    { stateKey: 'composition', sliderId: 'wSliderComp',  displayId: 'wComp'  },
    { stateKey: 'atmosphere',  sliderId: 'wSliderAtmo',  displayId: 'wAtmo'  },
    { stateKey: 'scene',       sliderId: 'wSliderScene', displayId: 'wScene' },
    { stateKey: 'environment', sliderId: 'wSliderEnv',   displayId: 'wEnv'   },
    { stateKey: 'motion',      sliderId: 'wSliderMot',   displayId: 'wMot'   },
    { stateKey: 'temporal',    sliderId: 'wSliderTemp',  displayId: 'wTemp'  },
    { stateKey: 'technical',   sliderId: 'wSliderTech',  displayId: 'wTech'  },
  ];

  /**
   * Bind all weight sliders in .weight-grid.
   * The HTML has unlabelled range inputs — we query by position.
   */
  function bindWeightSliders() {
    // Get all range inputs inside .weight-grid
    const sliders = document.querySelectorAll('.weight-grid input[type=range]');

    sliders.forEach((slider, i) => {
      if (i >= WEIGHT_IDS.length) return;
      const cfg = WEIGHT_IDS[i];

      // Give slider an ID for easy access
      slider.id = cfg.sliderId;

      // Set initial value from state
      slider.value = state.weights[cfg.stateKey] || DEFAULT_WEIGHTS[cfg.stateKey] || 1.0;

      // Update display
      updateWeightDisplay(cfg.displayId, slider.value);

      // Listen
      slider.addEventListener('input', function () {
        const val = parseFloat(this.value);
        state.weights[cfg.stateKey] = val;
        updateWeightDisplay(cfg.displayId, val);
        updateWeightBar(slider);
      });
    });
  }

  function updateWeightDisplay(displayId, val) {
    const el = document.getElementById(displayId);
    if (el) el.textContent = parseFloat(val).toFixed(1);
  }

  function updateWeightBar(slider) {
    const item = slider.closest('.w-item');
    if (!item) return;
    const bar = item.querySelector('.w-bar');
    if (bar) {
      const pct = (parseFloat(slider.value) / 2.0) * 100;
      bar.style.width = pct + '%';
    }
  }

  function applyWeightsToSliders(weights) {
    WEIGHT_IDS.forEach(cfg => {
      const slider  = document.getElementById(cfg.sliderId);
      if (slider && weights[cfg.stateKey] !== undefined) {
        slider.value = weights[cfg.stateKey];
        updateWeightDisplay(cfg.displayId, weights[cfg.stateKey]);
        updateWeightBar(slider);
      }
    });
  }

  /**
   * Handle weight preset dropdown (if present in HTML).
   */
  function applyWeightPreset(presetName) {
    const presets = {
      default_balanced           : { subjects:1.5, lighting:1.5, composition:1.3, atmosphere:1.2, scene:1.0, environment:1.0, motion:1.0, temporal:0.8, technical:0.8 },
      character_portrait_extreme : { subjects:2.0, lighting:2.0, composition:1.8, atmosphere:1.0, scene:0.5, environment:0.5, motion:0.5, temporal:0.5, technical:0.5 },
      environment_showcase       : { subjects:0.8, lighting:1.5, composition:1.5, atmosphere:1.8, scene:1.8, environment:2.0, motion:0.5, temporal:0.5, technical:0.8 },
      cinematic_balanced         : { subjects:1.5, lighting:1.8, composition:1.8, atmosphere:1.5, scene:1.2, environment:1.0, motion:1.0, temporal:0.8, technical:1.0 },
      mood_atmosphere_heavy      : { subjects:1.0, lighting:1.8, composition:1.2, atmosphere:2.0, scene:1.0, environment:1.2, motion:0.5, temporal:0.5, technical:0.5 },
      video_action_focused       : { subjects:1.5, lighting:1.2, composition:1.5, atmosphere:0.8, scene:1.0, environment:0.8, motion:2.0, temporal:1.5, technical:0.8 },
      sdxl_token_budget          : { subjects:2.0, lighting:1.5, composition:1.0, atmosphere:0.5, scene:0.5, environment:0.0, motion:0.0, temporal:0.0, technical:0.0 },
    };

    const preset = presets[presetName];
    if (!preset) return;

    Object.assign(state.weights, preset);
    applyWeightsToSliders(state.weights);
    showStatus('Weight preset applied: ' + presetName, 'info');
  }

  // ============================================================
  // 8. TEMPLATE MANAGEMENT
  // ============================================================

  /**
   * Populate the Load Template dropdown with built-in + custom templates.
   */
  function populateTemplateDropdown() {
    const sel = document.querySelector('select[id="templateLoad"], select:has(option[value=""])');
    // Fallback: find the first select near "Load Template" label
    const allSelects = document.querySelectorAll('select');
    let templateSel = null;
    for (const s of allSelects) {
      const prev = s.previousElementSibling;
      if (prev && prev.tagName === 'LABEL' && prev.textContent.includes('Template')) {
        templateSel = s;
        break;
      }
    }
    if (!templateSel) return;

    templateSel.innerHTML = '<option value="">-- New / Custom --</option>';

    // Built-in
    const builtinGrp = document.createElement('optgroup');
    builtinGrp.label = 'Built-in Presets';
    Object.keys(BUILTIN_TEMPLATES).forEach(name => {
      const o = document.createElement('option');
      o.value = 'builtin:' + name;
      o.textContent = name;
      builtinGrp.appendChild(o);
    });
    templateSel.appendChild(builtinGrp);

    // Custom from localStorage
    const customTemplates = loadCustomTemplates();
    if (Object.keys(customTemplates).length) {
      const customGrp = document.createElement('optgroup');
      customGrp.label = 'My Templates';
      Object.keys(customTemplates).forEach(name => {
        const o = document.createElement('option');
        o.value = 'custom:' + name;
        o.textContent = name;
        customGrp.appendChild(o);
      });
      templateSel.appendChild(customGrp);
    }

    // On change — load template
    templateSel.addEventListener('change', function () {
      const val = this.value;
      if (!val) return;

      let tmpl = null;
      if (val.startsWith('builtin:')) {
        tmpl = BUILTIN_TEMPLATES[val.replace('builtin:', '')];
      } else if (val.startsWith('custom:')) {
        tmpl = loadCustomTemplates()[val.replace('custom:', '')];
      }

      if (tmpl) {
        loadTemplate(tmpl);
        showStatus('Template loaded: ' + val.split(':')[1], 'ok');
      }
    });
  }

  /**
   * Apply a template object to form + state.
   */
  function loadTemplate(tmpl) {
    // Merge template into state
    const merged = Object.assign({}, state, tmpl);
    if (tmpl.weights) merged.weights = Object.assign({}, state.weights, tmpl.weights);
    state = merged;
    applyStateToForm(state);
    generatePrompt();
  }

  /**
   * Save current state as a custom template.
   */
  function saveCurrentAsTemplate() {
    syncStateFromForm();
    const name = prompt('Template name:');
    if (!name) return;

    const templates = loadCustomTemplates();
    templates[name] = { ...state };
    try {
      localStorage.setItem(LS_KEY_TEMPLATES, JSON.stringify(templates));
      populateTemplateDropdown();
      showStatus('Template saved: ' + name, 'ok');
    } catch (e) {
      showStatus('Save failed: ' + e.message, 'warn');
    }
  }

  function loadCustomTemplates() {
    try {
      const raw = localStorage.getItem(LS_KEY_TEMPLATES);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  // ============================================================
  // 9. IMPORT / EXPORT
  // ============================================================

  /**
   * Build full export JSON structure matching 14-layer schema.
   */
  function buildExportJSON() {
    return {
      schema_version    : '4.0',
      generator_type    : state.generatorType,
      identity_anchor   : {
        character_name : state.characterName,
        lock_method    : state.lockMethod,
        locked         : state.identityLocked,
        race_matrix    : { realistic: state.realisticRace, fantasy: state.fantasyRace, skin_tone: state.skinToneRange },
        age_profile    : { range: state.ageRange, maturity: state.maturityLevel },
        face_dna       : {
          shape: state.faceShape, eye_shape: state.eyeShape, eye_color: state.eyeColor,
          nose: state.noseShape, lips: state.lipShape, jaw: state.jawLine,
          cheeks: state.cheekStructure, undertone: state.skinUndertone,
        },
        body_dna       : {
          height: state.heightCategory, frame: state.frameType,
          shoulders: state.shoulderWidth, waist: state.waistDef, limbs: state.limbProportion,
        },
      },
      technical_constraints: {
        negative_dna    : state.negativeDNA,
        anatomy_locks   : state.anatomyLocks,
        face_locks      : state.faceLocks,
        quality_locks   : state.qualityLocks,
      },
      subjects: {
        type: state.subjectType, archetype: state.archetype, species: state.species,
        gender: state.genderPresent, stature: state.stature, frame: state.bodyFrame,
        skin_color: state.skinColor, skin_texture: state.skinTexture,
        hair: { color: state.hairColor, style: state.hairStyle, length: state.hairLength },
        distinctive: state.distinctiveFeatures,
        outfit: {
          preset: state.outfitPreset, upper: state.upperBody, lower: state.lowerBody,
          outer: state.outerwear, shoes: state.footwear, head: state.headwear,
          accessories: state.accessories,
        },
        pose: { base: state.basePose, action: state.actionVerb, object: state.actionObject, energy: state.energyLevel },
        expression: {
          primary: state.primaryEmotion, secondary: state.secondaryEmotion,
          intensity: state.emotionIntensity, micro: state.microExpressions, eye_state: state.eyeState,
        },
        modifiers: { cybernetics: state.cybernetics, magic: state.magicalEffects, condition: state.physicalCondition },
      },
      scene_core: {
        focus: state.primaryFocus, narrative: state.narrativeMoment,
        time: { era: state.era, day: state.timeOfDay, season: state.season, flow: state.timeFlow },
        space: { type: state.locationType, place: state.specificPlace, scale: state.sceneScale },
      },
      environment: {
        setting: state.settingType, geo_context: state.geoContext,
        weather: { rain: state.precipitation, wind: state.windEffect, sky: state.skyCondition },
        props: { key: state.keyProps, importance: state.propImportance },
      },
      composition: {
        shot: state.shotType, angle: state.cameraAngle, focal: state.focalLength,
        aperture: state.aperture, stability: state.cameraStability,
        framing: { placement: state.subjectPlacement, symmetry: state.symmetry, depth: state.depthLayers },
      },
      motion: state.generatorType !== 'image' ? {
        camera: { type: state.cameraMovement, dir: state.moveDirection, speed: state.moveSpeed },
        subject: { primary: state.primaryMotion, intensity: state.motionIntensity, cloth: state.clothPhysics, hair: state.hairPhysics },
        particles: state.particleEffects,
      } : null,
      temporal_sequence: state.generatorType !== 'image' ? {
        duration: state.duration, fps: state.fps, loop: state.loop,
        transition: state.transitionType, start: state.actionAtStart, end: state.actionAtEnd, peak: state.peakMoment,
      } : null,
      lighting: {
        preset: state.lightingPreset,
        key: { source: state.keyLightSource, position: state.keyLightPos, quality: state.keyLightQuality, temp: state.keyLightTemp, intensity: state.keyLightIntensity },
        fill: { source: state.fillLightSource, intensity: state.fillIntensity },
        rim: { enabled: state.rimEnabled, color: state.rimColor, intensity: state.rimIntensity },
        effects: { fog: state.fogEnabled, godray: state.godrayEnabled, caustic: state.causticEnabled },
        condition: state.lightingCond,
      },
      atmosphere: {
        tone: { primary: state.primaryTone, secondary: state.secondaryTone },
        style: { art: state.artStyle, film_ref: state.filmReference, palette: state.colorPalette, custom: state.customColors },
        contrast: state.contrast, grain: state.filmGrain,
      },
      technical: {
        render: { aspect: state.aspectRatio, resolution: state.resolution, quality: state.qualityLevel },
        camera: { iso: state.iso, shutter: state.shutterSpeed, engine: state.renderEngine },
        post: { grade: state.colorGrading, lens: state.lensEffects, sharp: state.sharpening },
        video: { codec: state.codec, format: state.deliveryFormat, stabilize: state.stabilization },
      },
      output_config: {
        section_order  : state.sectionOrder,
        separator      : state.separator,
        emphasis       : state.emphasisSyntax,
        length_limit   : state.lengthLimit,
        truncation     : state.truncation,
        weights        : state.weights,
        platform       : state.platform,
        negative_banks : state.situationalNegs,
      },
      variations: {
        seed: state.baseSeed, deterministic: state.deterministic,
        batch: state.batchCount, genre: state.genreProfile,
      },
      metadata: {
        title: state.title, description: state.description,
        author: state.author, tags: state.tags, category: state.category,
        platforms: state.targetPlatforms, version: state.version, notes: state.notes,
        generated_at: new Date().toISOString(),
      },
    };
  }

  /**
   * Export: Download current state as JSON file.
   */
  function exportJSON() {
    syncStateFromForm();
    const data    = buildExportJSON();
    const json    = JSON.stringify(data, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    const fname   = (state.title || 'prompt_config').replace(/\s+/g, '_') + '_v' + (state.version || '1') + '.json';
    a.href        = url;
    a.download    = fname;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Exported: ' + fname, 'ok');
  }

  /**
   * Import: Trigger file picker, load JSON into form.
   */
  function importJSON() {
    const input    = document.createElement('input');
    input.type     = 'file';
    input.accept   = '.json,application/json';
    input.onchange = function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        try {
          const imported = JSON.parse(ev.target.result);
          const flat     = flattenImportedJSON(imported);
          state          = Object.assign({}, state, flat);
          applyStateToForm(state);
          generatePrompt();
          showStatus('Imported: ' + file.name, 'ok');
        } catch (err) {
          showStatus('Import failed: ' + err.message, 'warn');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /**
   * Flatten nested export JSON back to flat state object.
   * Handles the 14-layer schema structure.
   */
  function flattenImportedJSON(j) {
    const flat = {};
    try {
      flat.generatorType  = j.generator_type;
      // identity
      const ia = j.identity_anchor || {};
      flat.characterName  = ia.character_name;
      flat.lockMethod     = ia.lock_method;
      flat.identityLocked = ia.locked;
      const rm = ia.race_matrix || {};
      flat.realisticRace  = rm.realistic;
      flat.fantasyRace    = rm.fantasy;
      flat.skinToneRange  = rm.skin_tone;
      const ap = ia.age_profile || {};
      flat.ageRange       = ap.range;
      flat.maturityLevel  = ap.maturity;
      const fd = ia.face_dna || {};
      flat.faceShape      = fd.shape;    flat.eyeShape    = fd.eye_shape;
      flat.eyeColor       = fd.eye_color; flat.noseShape  = fd.nose;
      flat.lipShape       = fd.lips;     flat.jawLine     = fd.jaw;
      flat.cheekStructure = fd.cheeks;   flat.skinUndertone = fd.undertone;
      const bd = ia.body_dna || {};
      flat.heightCategory = bd.height;   flat.frameType   = bd.frame;
      flat.shoulderWidth  = bd.shoulders;flat.waistDef    = bd.waist;
      flat.limbProportion = bd.limbs;
      // constraints
      const tc = j.technical_constraints || {};
      flat.negativeDNA    = tc.negative_dna;
      flat.anatomyLocks   = tc.anatomy_locks;
      flat.faceLocks      = tc.face_locks;
      flat.qualityLocks   = tc.quality_locks;
      // subjects
      const s = j.subjects || {};
      flat.subjectType    = s.type;       flat.archetype   = s.archetype;
      flat.genderPresent  = s.gender;     flat.stature     = s.stature;
      flat.skinColor      = s.skin_color; flat.skinTexture = s.skin_texture;
      const hair = s.hair || {};
      flat.hairColor      = hair.color;   flat.hairStyle   = hair.style;   flat.hairLength = hair.length;
      flat.distinctiveFeatures = s.distinctive;
      const out = s.outfit || {};
      flat.outfitPreset   = out.preset;   flat.upperBody   = out.upper;
      flat.lowerBody      = out.lower;    flat.outerwear   = out.outer;
      flat.footwear       = out.shoes;    flat.headwear    = out.head;
      flat.accessories    = out.accessories;
      const pose = s.pose || {};
      flat.basePose       = pose.base;    flat.actionVerb  = pose.action;
      flat.actionObject   = pose.object;  flat.energyLevel = pose.energy;
      const expr = s.expression || {};
      flat.primaryEmotion = expr.primary; flat.secondaryEmotion = expr.secondary;
      flat.emotionIntensity = expr.intensity;
      flat.microExpressions = expr.micro; flat.eyeState = expr.eye_state;
      const mod = s.modifiers || {};
      flat.cybernetics    = mod.cybernetics; flat.magicalEffects = mod.magic;
      flat.physicalCondition = mod.condition;
      // scene
      const sc = j.scene_core || {};
      flat.primaryFocus   = sc.focus;     flat.narrativeMoment = sc.narrative;
      const time = sc.time || {};
      flat.era = time.era; flat.timeOfDay = time.day; flat.season = time.season;
      const space = sc.space || {};
      flat.locationType = space.type; flat.specificPlace = space.place; flat.sceneScale = space.scale;
      // env
      const env = j.environment || {};
      flat.settingType = env.setting; flat.geoContext = env.geo_context;
      const wx = env.weather || {};
      flat.precipitation = wx.rain; flat.windEffect = wx.wind; flat.skyCondition = wx.sky;
      const props = env.props || {};
      flat.keyProps = props.key; flat.propImportance = props.importance;
      // composition
      const comp = j.composition || {};
      flat.shotType = comp.shot; flat.cameraAngle = comp.angle; flat.focalLength = comp.focal;
      flat.aperture = comp.aperture; flat.cameraStability = comp.stability;
      const fr = comp.framing || {};
      flat.subjectPlacement = fr.placement; flat.symmetry = fr.symmetry; flat.depthLayers = fr.depth;
      // motion
      const mot = j.motion || {};
      const cam = mot.camera || {};
      flat.cameraMovement = cam.type; flat.moveDirection = cam.dir; flat.moveSpeed = cam.speed;
      const subMot = mot.subject || {};
      flat.primaryMotion = subMot.primary; flat.motionIntensity = subMot.intensity;
      flat.clothPhysics = subMot.cloth; flat.hairPhysics = subMot.hair;
      flat.particleEffects = mot.particles;
      // temporal
      const temp = j.temporal_sequence || {};
      flat.duration = temp.duration; flat.fps = temp.fps; flat.loop = temp.loop;
      flat.transitionType = temp.transition; flat.actionAtStart = temp.start;
      flat.actionAtEnd = temp.end; flat.peakMoment = temp.peak;
      // lighting
      const lt = j.lighting || {};
      flat.lightingPreset = lt.preset;
      const kl = lt.key || {};
      flat.keyLightSource = kl.source; flat.keyLightPos = kl.position;
      flat.keyLightQuality = kl.quality; flat.keyLightTemp = kl.temp; flat.keyLightIntensity = kl.intensity;
      const fl = lt.fill || {};
      flat.fillLightSource = fl.source; flat.fillIntensity = fl.intensity;
      const rl = lt.rim || {};
      flat.rimEnabled = rl.enabled; flat.rimColor = rl.color; flat.rimIntensity = rl.intensity;
      const eff = lt.effects || {};
      flat.fogEnabled = eff.fog; flat.godrayEnabled = eff.godray; flat.causticEnabled = eff.caustic;
      flat.lightingCond = lt.condition;
      // atmosphere
      const atmo = j.atmosphere || {};
      const tone = atmo.tone || {};
      flat.primaryTone = tone.primary; flat.secondaryTone = tone.secondary;
      const style = atmo.style || {};
      flat.artStyle = style.art; flat.filmReference = style.film_ref;
      flat.colorPalette = style.palette; flat.customColors = style.custom;
      flat.contrast = atmo.contrast; flat.filmGrain = atmo.grain;
      // technical
      const tech = j.technical || {};
      const rend = tech.render || {};
      flat.aspectRatio = rend.aspect; flat.resolution = rend.resolution; flat.qualityLevel = rend.quality;
      const vcam = tech.camera || {};
      flat.iso = vcam.iso; flat.shutterSpeed = vcam.shutter; flat.renderEngine = vcam.engine;
      const post = tech.post || {};
      flat.colorGrading = post.grade; flat.lensEffects = post.lens; flat.sharpening = post.sharp;
      // output config
      const oc = j.output_config || {};
      flat.sectionOrder = oc.section_order; flat.separator = oc.separator;
      flat.emphasisSyntax = oc.emphasis; flat.lengthLimit = oc.length_limit;
      flat.truncation = oc.truncation; flat.platform = oc.platform;
      flat.situationalNegs = oc.negative_banks;
      if (oc.weights) flat.weights = oc.weights;
      // variations
      const vari = j.variations || {};
      flat.baseSeed = vari.seed; flat.deterministic = vari.deterministic;
      flat.batchCount = vari.batch; flat.genreProfile = vari.genre;
      // metadata
      const meta = j.metadata || {};
      flat.title = meta.title; flat.description = meta.description;
      flat.author = meta.author; flat.tags = meta.tags;
      flat.category = meta.category; flat.targetPlatforms = meta.platforms;
      flat.version = meta.version; flat.notes = meta.notes;
    } catch (e) {
      console.warn('[PGv2] flattenImportedJSON error:', e);
    }
    return flat;
  }

  // ============================================================
  // 10. PLATFORM PARAMETERS
  // ============================================================

  /**
   * Get active platform suffix string.
   */
  function getPlatformParams() {
    const plat = state.platform || 'MidJourney';
    return PLATFORM_PARAMS[plat] || '';
  }

  /**
   * Update platform params display cards in main panel.
   */
  function updatePlatformDisplay() {
    const cards = document.querySelectorAll('.plat-card');
    const platforms = Object.keys(PLATFORM_PARAMS);
    cards.forEach((card, i) => {
      if (i >= platforms.length) return;
      const name   = platforms[i];
      const params = PLATFORM_PARAMS[name];
      const nameEl = card.querySelector('.plat-name');
      const pEl    = card.querySelector('.plat-params');
      if (nameEl) nameEl.textContent = name;
      if (pEl) pEl.textContent = params;
    });
  }

  /**
   * Inject a platform selector dropdown into topbar (if not already present).
   * This allows user to switch active platform without going into metadata.
   */
  function injectPlatformSelector() {
    const topbar  = document.querySelector('.topbar-right');
    if (!topbar || document.getElementById('activePlatformSel')) return;

    const label = document.createElement('span');
    label.style.cssText = 'color:var(--text-dim);font-size:10.5px;';
    label.textContent   = 'Platform:';

    const sel  = document.createElement('select');
    sel.id     = 'targetPlatformActive';
    sel.style.cssText = 'width:140px;font-size:11px;padding:3px 6px;';
    Object.keys(PLATFORM_PARAMS).forEach(name => {
      const o       = document.createElement('option');
      o.value       = name;
      o.textContent = name;
      sel.appendChild(o);
    });
    sel.value = state.platform || 'MidJourney';
    sel.addEventListener('change', function () {
      state.platform = this.value;
    });

    topbar.insertBefore(sel, topbar.firstChild);
    topbar.insertBefore(label, topbar.firstChild);
  }

  // ============================================================
  // 11. STATUS BAR
  // ============================================================

  let statusTimeout = null;

  /**
   * Show a brief status message in topbar.
   * @param {string} msg
   * @param {'info'|'ok'|'warn'} type
   */
  function showStatus(msg, type = 'info') {
    let el = document.getElementById('pgStatusBar');
    if (!el) {
      el = document.createElement('span');
      el.id = 'pgStatusBar';
      el.style.cssText = 'font-size:10.5px;padding:2px 8px;border-radius:4px;transition:.2s ease;';
      const sep = document.querySelector('.topbar-sep');
      if (sep) sep.after(el);
    }

    const colors = {
      info : { bg: 'rgba(159,239,0,.12)', color: '#9fef00' },
      ok   : { bg: 'rgba(159,239,0,.2)',  color: '#9fef00' },
      warn : { bg: 'rgba(255,107,107,.15)', color: '#ff6b6b' },
    };
    const c = colors[type] || colors.info;
    el.style.background = c.bg;
    el.style.color      = c.color;
    el.textContent      = msg;

    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => { el.textContent = ''; el.style.background = 'none'; }, 4000);
  }

  // ============================================================
  // 12. BUTTON WIRING
  // ============================================================

  /**
   * Wire all action buttons in the HTML.
   */
  function bindButtons() {
    // Generate Prompt (all .generate-trigger class OR text-matched buttons)
    document.querySelectorAll('button').forEach(btn => {
      const txt = btn.textContent.trim();

      if (txt.includes('GENERATE PROMPT') || txt.includes('Generate')) {
        btn.addEventListener('click', generatePrompt);

      } else if (txt.includes('Import JSON') || txt.includes('📂 Import')) {
        btn.addEventListener('click', importJSON);

      } else if (txt.includes('Export JSON') || txt.includes('💾 Export')) {
        btn.addEventListener('click', exportJSON);

      } else if (txt.includes('Save Template') || txt.includes('💾 Save Template')) {
        btn.addEventListener('click', saveCurrentAsTemplate);

      } else if (txt.includes('Regenerate') || txt.includes('🔄 Regenerate')) {
        btn.addEventListener('click', generatePrompt);

      } else if (txt.includes('Validate JSON') || txt.includes('✓ Validate')) {
        btn.addEventListener('click', validateJSONOutput);

      } else if (txt.includes('Apply to Form') || txt.includes('↩ Apply')) {
        btn.addEventListener('click', applyJSONOutput);

      } else if (txt.includes('Format') || txt.includes('⚡ Format')) {
        btn.addEventListener('click', formatJSONOutput);

      } else if (txt.includes('📋 Copy')) {
        btn.addEventListener('click', function () {
          // Find nearest textarea
          const panel   = btn.closest('.panel');
          const ta      = panel ? panel.querySelector('textarea') : null;
          if (ta) {
            navigator.clipboard.writeText(ta.value).then(() => showStatus('Copied!', 'ok'));
          }
        });
      }
    });

    // Weight preset dropdown
    const wPresetSel = document.querySelector('.weight-grid ~ * select, select[id="weightPreset"]');
    // Fallback: find select near "Weight Preset" label
    document.querySelectorAll('select').forEach(sel => {
      const prev = sel.previousElementSibling;
      if (prev && prev.tagName === 'LABEL' && prev.textContent.includes('Weight Preset')) {
        sel.addEventListener('change', function () {
          if (this.value) applyWeightPreset(this.value);
        });
      }
    });

    // Auto-generate on any form change (debounced)
    const debouncedGenerate = debounce(generatePrompt, 800);
    document.addEventListener('change', function (e) {
      const tag = e.target.tagName;
      if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') {
        debouncedGenerate();
      }
    });
  }

  /** JSON output panel actions */
  function validateJSONOutput() {
    const ta = document.querySelectorAll('textarea.output')[2];
    if (!ta) return;
    try {
      JSON.parse(ta.value);
      showStatus('JSON valid ✓', 'ok');
    } catch (e) {
      showStatus('JSON invalid: ' + e.message, 'warn');
    }
  }

  function formatJSONOutput() {
    const ta = document.querySelectorAll('textarea.output')[2];
    if (!ta) return;
    try {
      ta.value = JSON.stringify(JSON.parse(ta.value), null, 2);
      showStatus('JSON formatted', 'ok');
    } catch (e) {
      showStatus('Cannot format — invalid JSON', 'warn');
    }
  }

  function applyJSONOutput() {
    const ta = document.querySelectorAll('textarea.output')[2];
    if (!ta) return;
    try {
      const imported = JSON.parse(ta.value);
      const flat     = flattenImportedJSON(imported);
      state          = Object.assign({}, state, flat);
      applyStateToForm(state);
      generatePrompt();
      showStatus('Applied from JSON', 'ok');
    } catch (e) {
      showStatus('Apply failed: ' + e.message, 'warn');
    }
  }

  // ============================================================
  // 13. UTILITIES
  // ============================================================

  /** Simple debounce */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Auto-resize all output textareas to fit content.
   */
  function autoResizeTextareas() {
    document.querySelectorAll('textarea.output').forEach(ta => {
      ta.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 600) + 'px';
      });
    });
  }

  /**
   * Add keyboard shortcut: Ctrl+Enter → Generate
   */
  function bindKeyboard() {
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generatePrompt();
      }
      // Ctrl+Shift+E → Export
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        exportJSON();
      }
      // Ctrl+Shift+I → Import
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        importJSON();
      }
    });
  }

  // ============================================================
  // 14. INITIALIZATION SEQUENCE
  // ============================================================

  async function init() {
    console.log('[PGv2] Initializing Prompt Generator v2...');

    // Step 1: Load all JSON data files
    await loadAllJSON();

    // Step 2: Populate dropdowns from JSON
    populateAllDropdowns();

    // Step 3: Restore previous state from localStorage
    loadStateFromStorage();

    // Step 4: Bind weight sliders
    bindWeightSliders();

    // Step 5: Populate template dropdown + wire template events
    populateTemplateDropdown();

    // Step 6: Wire all buttons
    bindButtons();

    // Step 7: Inject platform selector in topbar
    injectPlatformSelector();

    // Step 8: Misc UI enhancements
    autoResizeTextareas();
    bindKeyboard();

    // Step 9: Initial prompt generation
    generatePrompt();

    showStatus('Prompt Generator V4 ready — Ctrl+Enter to generate', 'ok');
    console.log('[PGv2] Ready.');
  }

  // Boot after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose select functions globally for debugging / v1.js interop
  window.PGv2 = {
    generate       : generatePrompt,
    exportJSON     : exportJSON,
    importJSON     : importJSON,
    loadTemplate   : loadTemplate,
    saveTemplate   : saveCurrentAsTemplate,
    applyPreset    : applyWeightPreset,
    getState       : () => ({ ...state }),
    resetState     : () => { state = {}; localStorage.removeItem(LS_KEY_STATE); location.reload(); },
  };

})();
