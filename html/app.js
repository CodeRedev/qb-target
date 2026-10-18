
(function (global) {
    'use strict';

    // -----------------------------------------------------------------------
    // Themes
    // -----------------------------------------------------------------------

    function createTheme(id, name, accent, accentText, selectedIconBackground) {
        return {
            id: id,
            name: name,
            sw: ['#0d0d0f', accent],
            vars: {
                bg: 'rgba(14,14,17,.9)',
                line: 'rgba(255,255,255,.1)',
                line2: 'rgba(255,255,255,.35)',
                tx: '#f2f2f4',
                mu: '#8b8d95',
                ac: accent,
                acfg: accentText,
                acc: accent,
                glow: accent + '33',
                icbg: 'rgba(255,255,255,.08)',
                icsel: selectedIconBackground || 'rgba(0,0,0,.14)'
            }
        };
    }

    const THEMES = [
        createTheme('mono', 'Mono', '#f2f2f4', '#0b0b0d'),
        createTheme('ocean', 'Ocean', '#19d3b0', '#04120f'),
        createTheme('violet', 'Violet', '#a46bff', '#12071f'),
        createTheme('amber', 'Amber', '#ffb224', '#1a1000'),
        createTheme('forest', 'Forest', '#2fd45f', '#04140a'),
        createTheme('azure', 'Azure', '#2f8cff', '#ffffff', 'rgba(255,255,255,.2)'),
        createTheme('crimson', 'Crimson', '#ff5a47', '#1a0603')
    ];

    // -----------------------------------------------------------------------
    // Style lists: [id, name, description]
    // -----------------------------------------------------------------------

    const MENU_STYLES = [
        ['card', 'Card', 'One card holding every option'],
        ['blocks', 'Blocks', 'Square blocks with bracket corners'],
        ['split', 'Split', 'Icon box and label box side by side'],
        ['line', 'Line', 'Borderless rows with an accent bar'],
        ['pill', 'Pill', 'Rounded pills with round icons'],
        ['outline', 'Outline', 'Outlined blocks, selected one in colour'],
        ['slant', 'Slant', 'Leaning blocks with a sporty feel'],
        ['arc', 'Arc', 'Options curve in an arc around the marker'],
        ['radial', 'Radial', 'Round buttons on a circle around the marker'],
        ['sweep', 'Sweep', 'Colour sweeps across the selected row']
    ];

    const MARKER_STYLES = [
        ['dot', 'Dot', 'Solid dot with a soft halo'],
        ['ring', 'Ring', 'Clean ring with a centre dot'],
        ['target', 'Target', 'Double ring, bullseye core'],
        ['pulse', 'Pulse', 'Ripples spreading from a dot'],
        ['diamond', 'Diamond', 'Diamond frame, solid core'],
        ['rdiamond', 'Soft Diamond', 'Diamond with rounded corners'],
        ['arc', 'Arc', 'Two open arcs slowly circling the dot'],
        ['orbit', 'Orbit', 'A dot circling the point'],
        ['spark', 'Spark', 'Four-point star with a soft pulse'],
        ['burst', 'Burst', 'Ticks radiating from a dot'],
        ['tile', 'Tile', 'Rounded square with a soft pulse']
    ];

    const DEFAULTS = {
        menuStyle: 'split',
        markerStyle: 'ring',
        theme: 'mono',
        menuScale: 100,
        markerScale: 100,
        accent: '',
        motion: true,
        caps: true
    };

    const HTML_ESCAPES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    };

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value).replace(/[&<>"]/g, function (character) {
            return HTML_ESCAPES[character];
        });
    }

    function findTheme(themeId) {
        for (let i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === themeId) {
                return THEMES[i];
            }
        }
        return THEMES[0];
    }

    function applyTheme(element, themeId, accent) {
        const themeVars = findTheme(themeId).vars;

        Object.keys(themeVars).forEach(function (name) {
            element.style.setProperty('--' + name, themeVars[name]);
        });

        if (!/^#[0-9a-f]{6}$/i.test(accent || '')) {
            return;
        }

        const value = parseInt(accent.slice(1), 16);
        const red = value >> 16;
        const green = (value >> 8) & 255;
        const blue = value & 255;
        const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
        const isLight = luminance > 0.55;

        element.style.setProperty('--ac', accent);
        element.style.setProperty('--acc', accent);
        element.style.setProperty('--glow', accent + '33');
        element.style.setProperty('--acfg', isLight ? '#0b0b0d' : '#ffffff');
        element.style.setProperty('--icsel', isLight ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.2)');
    }

    function getItemStyle(style, index, count) {
        if (style === 'arc') {
            const offsetFromCenter = index - (count - 1) / 2;
            const marginLeft = Math.round(Math.pow(offsetFromCenter, 2) * 9);
            return ' style="margin-left:' + marginLeft + 'px"';
        }

        if (style === 'radial') {
            const stepDegrees = Math.min(36, 160 / Math.max(1, count - 1));
            const radius = 84;
            const angle = (index - (count - 1) / 2) * stepDegrees * Math.PI / 180;
            const left = Math.round(-46 + radius * Math.cos(angle));
            const top = Math.round(radius * Math.sin(angle));
            return ' style="left:' + left + 'px;top:' + top + 'px"';
        }

        return '';
    }

    function getDefaultIndex(style) {
        if (style === 'radial') {
            return 0;
        }
        return -1;
    }

    // -----------------------------------------------------------------------
    // Menu
    // -----------------------------------------------------------------------

    function buildMenuHTML(settings) {
        const options = settings.options || [];
        let html = '<div class="imenu s-' + settings.style + '"><div class="list">';

        options.forEach(function (option, index) {
            const isSelected = index === settings.index;
            const slot = option.slot !== undefined ? option.slot : index + 1;
            const icon = option.icon || 'fas fa-hand-pointer';

            html += '<div class="opt' + (isSelected ? ' sel' : '') + '"';
            html += ' data-i="' + index + '"';
            html += ' data-slot="' + Number(slot) + '"';
            html += getItemStyle(settings.style, index, options.length) + '>';
            html += '<span class="ic"><i class="' + escapeHTML(icon) + '"></i></span>';
            html += '<span class="lb">' + escapeHTML(option.label) + '</span>';
            html += '</div>';
        });

        html += '</div></div>';
        return html;
    }

    function mountMenu(element, settings) {
        element.classList.add('xi-root');
        applyTheme(element, settings.theme, settings.accent);
        element.classList.toggle('nomotion', settings.motion === false);
        element.classList.toggle('nocaps', settings.caps === false);
        element.style.setProperty('--ms', (settings.scale || 100) / 100);
        element.innerHTML = buildMenuHTML(settings);
    }

    function setIndex(element, selectedIndex) {
        const options = element.querySelectorAll('.opt');

        Array.prototype.forEach.call(options, function (node, index) {
            node.classList.toggle('sel', index === selectedIndex);
        });
    }

    // -----------------------------------------------------------------------
    // Marker
    // -----------------------------------------------------------------------

    function buildBurstPath() {
        let path = '';

        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            path += 'M' + (17 * cos).toFixed(1) + ' ' + (17 * sin).toFixed(1);
            path += 'L' + (25 * cos).toFixed(1) + ' ' + (25 * sin).toFixed(1);
        }

        return path;
    }

    const MARKERS = {
        dot:
            '<circle class="a halo" r="12" fill="none" stroke-width="2"/>' +
            '<circle class="fill-a" r="6"/>',

        ring:
            '<circle class="t" r="16" fill="none" stroke-width="3.5"/>' +
            '<circle class="fill-a" r="4.5"/>',

        target:
            '<circle class="a halo" r="27" fill="none" stroke-width="2"/>' +
            '<circle class="t" r="16" fill="none" stroke-width="3"/>' +
            '<circle class="fill-a" r="6"/>',

        pulse:
            '<circle class="a ripple" r="26" fill="none" stroke-width="2.5"/>' +
            '<circle class="a ripple r2" r="26" fill="none" stroke-width="2.5"/>' +
            '<circle class="fill-a" r="6"/>',

        diamond:
            '<path class="t" d="M0-24L24 0L0 24L-24 0Z" fill="none" stroke-width="3" stroke-linejoin="round"/>' +
            '<path class="fill-a beat" d="M0-8L8 0L0 8L-8 0Z"/>',

        rdiamond:
            '<g transform="rotate(45)">' +
            '<rect class="t" x="-17" y="-17" width="34" height="34" rx="10" fill="none" stroke-width="3"/>' +
            '</g>' +
            '<g transform="rotate(45)">' +
            '<rect class="fill-a beat" x="-6" y="-6" width="12" height="12" rx="4"/>' +
            '</g>',

        arc:
            '<g class="spin slow">' +
            '<path class="t" d="M12.9-15.3A20 20 0 0 1 12.9 15.3M-12.9 15.3A20 20 0 0 1 -12.9-15.3" ' +
            'fill="none" stroke-width="3.5" stroke-linecap="round"/>' +
            '</g>' +
            '<circle class="fill-a" r="4.5"/>',

        orbit:
            '<circle class="t" r="22" fill="none" stroke-width="2" opacity=".35"/>' +
            '<g class="spin orb"><circle class="fill-t" cx="22" r="4.5"/></g>' +
            '<circle class="fill-a" r="6"/>',

        spark:
            '<path class="fill-t beat" d="M0-27C2-9 9-2 27 0C9 2 2 9 0 27C-2 9-9 2-27 0C-9-2-2-9 0-27Z"/>' +
            '<circle class="fill-a" r="4"/>',

        burst:
            '<g class="spin slow">' +
            '<path class="t" d="' + buildBurstPath() + '" fill="none" stroke-width="3" stroke-linecap="round"/>' +
            '</g>' +
            '<circle class="fill-a" r="5.5"/>',

        tile:
            '<rect class="a halo" x="-18" y="-18" width="36" height="36" rx="9" fill="none" stroke-width="2"/>' +
            '<rect class="t" x="-18" y="-18" width="36" height="36" rx="9" fill="none" stroke-width="3"/>' +
            '<circle class="fill-a" r="5.5"/>'
    };

    function buildMarkerHTML(style) {
        const shapes = MARKERS[style] || MARKERS.ring;
        return '<div class="marker"><svg viewBox="-60 -60 120 120">' + shapes + '</svg></div>';
    }

    function mountMarker(element, settings) {
        element.classList.add('xi-root');
        applyTheme(element, settings.theme, settings.accent);
        element.classList.toggle('nomotion', settings.motion === false);
        element.style.setProperty('--ks', (settings.scale || 100) / 100);
        element.innerHTML = buildMarkerHTML(settings.style);
    }

    global.XI = {
        THEMES: THEMES,
        MENU_STYLES: MENU_STYLES,
        MARKER_STYLES: MARKER_STYLES,
        DEFAULTS: DEFAULTS,
        theme: findTheme,
        applyTheme: applyTheme,
        getDefaultIndex: getDefaultIndex,
        mountMenu: mountMenu,
        mountMarker: mountMarker,
        setIndex: setIndex
    };
})(window);


// ---------------------------------------------------------------------------
const UI_CONFIG = {
    menuStyle: 'split',
    markerStyle: 'ring',
    theme: 'mono',
    accent: '',
    menuScale: 100,
    markerScale: 100,
    motion: true,
    caps: true
};

const STORAGE_KEY = 'qb-target:ui-config';

document.addEventListener('DOMContentLoaded', function () {
    const wrapperElement = document.getElementById('target-wrapper');
    const markerElement = document.getElementById('target-marker');
    const iconElement = document.getElementById('target-icon');
    const menuElement = document.getElementById('target-menu');

    let config = buildConfig(Object.assign({}, UI_CONFIG, readSavedConfig()));
    let targetOpen = false;

    function buildConfig(overrides) {
        const merged = Object.assign({}, XI.DEFAULTS, overrides);

        const menuStyleExists = XI.MENU_STYLES.some(function (style) {
            return style[0] === merged.menuStyle;
        });
        if (!menuStyleExists) {
            merged.menuStyle = XI.DEFAULTS.menuStyle;
        }

        const markerStyleExists = XI.MARKER_STYLES.some(function (style) {
            return style[0] === merged.markerStyle;
        });
        if (!markerStyleExists) {
            merged.markerStyle = XI.DEFAULTS.markerStyle;
        }

        return merged;
    }

    function applyConfig() {
        XI.applyTheme(wrapperElement, config.theme, config.accent);

        XI.mountMarker(markerElement, {
            style: config.markerStyle,
            theme: config.theme,
            accent: config.accent,
            motion: config.motion,
            scale: config.markerScale
        });
    }

    function readSavedConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    }

    function writeSavedConfig(newConfig) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        } catch (error) {
            console.error('Could not save target style:', error);
        }
    }

    function isStudioOpen() {
        return document.body.classList.contains('studio-open');
    }

    function getResourceName() {
        if (typeof GetParentResourceName === 'function') {
            return GetParentResourceName();
        }

        return 'qb-target';
    }

    function postNui(endpoint, payload) {
        fetch('https://' + getResourceName() + '/' + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(payload === undefined ? {} : payload)
        }).catch(function (error) {
            console.error('Error:', error);
        });
    }

    function showMarker(isFound) {
        markerElement.style.display = 'block';
        markerElement.classList.toggle('is-idle', !isFound);
    }

    function hideMarker() {
        markerElement.style.display = 'none';
    }

    function showTargetIcon(iconClass) {
        iconElement.className = iconClass;
        iconElement.style.display = 'block';
    }

    function hideTargetIcon() {
        iconElement.className = '';
        iconElement.style.display = 'none';
    }

    function normalizeOptions(rawOptions) {
        const options = [];

        if (!rawOptions) {
            return options;
        }

        const isArray = Array.isArray(rawOptions);

        Object.keys(rawOptions).forEach(function (key) {
            const optionData = rawOptions[key];

            if (optionData === null || optionData === undefined) {
                return;
            }

            options.push({
                slot: isArray ? Number(key) + 1 : Number(key),
                icon: optionData.icon,
                label: optionData.label
            });
        });

        options.sort(function (a, b) {
            return a.slot - b.slot;
        });

        return options;
    }

    function renderMenu(options) {
        XI.mountMenu(menuElement, {
            style: config.menuStyle,
            theme: config.theme,
            accent: config.accent,
            motion: config.motion,
            caps: config.caps,
            scale: config.menuScale,
            options: options,
            index: XI.getDefaultIndex(config.menuStyle)
        });
    }

    function clearMenu() {
        menuElement.innerHTML = '';
    }

    function OpenTarget() {
        targetOpen = true;
        clearMenu();
        hideTargetIcon();
        showMarker(false);
    }

    function CloseTarget() {
        targetOpen = false;
        clearMenu();
        hideTargetIcon();
        hideMarker();
    }

    function FoundTarget(item) {
        if (!targetOpen) {
            return;
        }

        if (item.data) {
            hideMarker();
            showTargetIcon(item.data);
        } else {
            hideTargetIcon();
            showMarker(true);
        }

        renderMenu(normalizeOptions(item.options));
    }

    function ValidTarget(item) {
        if (!targetOpen) {
            return;
        }

        renderMenu(normalizeOptions(item.data));
    }

    function LeftTarget() {
        clearMenu();
        hideTargetIcon();

        if (targetOpen) {
            showMarker(false);
        }
    }

    function handleMouseDown(event) {
        if (isStudioOpen()) {
            return;
        }

        if (!(event.target instanceof Element)) {
            return;
        }

        // Left click on an option
        if (event.button === 0) {
            const optionElement = event.target.closest('.opt');

            if (optionElement && menuElement.contains(optionElement)) {
                postNui('selectTarget', Number(optionElement.dataset.slot));
                CloseTarget();
                return;
            }
        }

        // Right click outside the menu
        if (event.button === 2 && !menuElement.contains(event.target)) {
            LeftTarget();
            postNui('leftTarget', {});
        }
    }

    function handleKeyDown(event) {
        if (isStudioOpen()) {
            return;
        }

        if (event.key === 'Escape' || event.key === 'Backspace') {
            CloseTarget();
            postNui('closeTarget', {});
        }
    }

    // Hovering an option selects it
    function handleMenuMouseOver(event) {
        const optionElement = event.target.closest('.opt');

        if (!optionElement) {
            return;
        }

        XI.setIndex(menuElement, Number(optionElement.dataset.i));
    }

    // Leaving the menu goes back to the default selection
    function handleMenuMouseLeave() {
        XI.setIndex(menuElement, XI.getDefaultIndex(config.menuStyle));
    }

    // -----------------------------------------------------------------------
    // Lua -> NUI messages
    // -----------------------------------------------------------------------

    window.addEventListener('message', function (event) {
        switch (event.data.response) {
            case 'openTarget':
                OpenTarget();
                break;

            case 'closeTarget':
                CloseTarget();
                break;

            case 'foundTarget':
                FoundTarget(event.data);
                break;

            case 'validTarget':
                ValidTarget(event.data);
                break;

            case 'leftTarget':
                LeftTarget();
                break;

            case 'openStudio':
                CloseTarget();
                break;

            case 'setConfig':
                config = buildConfig(Object.assign({}, config, event.data.data));
                applyConfig();
                break;
        }
    });

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    menuElement.addEventListener('mouseover', handleMenuMouseOver);
    menuElement.addEventListener('mouseleave', handleMenuMouseLeave);

    window.addEventListener('unload', function () {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('keydown', handleKeyDown);
        menuElement.removeEventListener('mouseover', handleMenuMouseOver);
        menuElement.removeEventListener('mouseleave', handleMenuMouseLeave);
    });

    window.TargetUI = {
        getConfig: function () {
            return Object.assign({}, config);
        },

        getDefaults: function () {
            return buildConfig(UI_CONFIG);
        },

        saveConfig: function (newConfig) {
            config = buildConfig(newConfig);
            applyConfig();
            writeSavedConfig(config);
        },

        post: postNui
    };

    applyConfig();
});

document.addEventListener('DOMContentLoaded', function () {
    const studioElement = document.getElementById('studio');

    const SAMPLE_OPTIONS = [
        { label: 'Open Bank', icon: 'fas fa-building-columns' },
        { label: 'Toggle Front Door', icon: 'fas fa-door-open' },
        { label: 'Toggle Trunk', icon: 'fas fa-truck-ramp-box' },
        { label: 'Check Plate', icon: 'fas fa-id-card' }
    ];
    const THUMBNAIL_OPTIONS = SAMPLE_OPTIONS.slice(0, 3);

    const TABS = [
        { id: 'menu', label: 'Menu' },
        { id: 'marker', label: 'Marker' },
        { id: 'color', label: 'Color' },
        { id: 'feel', label: 'Feel' }
    ];

    let draft = {};
    let previewIndex = 0;
    let toastTimer = null;

    function find(selector) {
        return studioElement.querySelector(selector);
    }

    function findAll(selector) {
        return Array.prototype.slice.call(studioElement.querySelectorAll(selector));
    }

    function nameOf(list, id) {
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === id) {
                return list[i][1];
            }
        }
        return id;
    }

    function isStudioOpen() {
        return document.body.classList.contains('studio-open');
    }

    function showToast(message) {
        const toast = find('#st-toast');
        toast.textContent = message;
        toast.classList.add('on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('on');
        }, 1800);
    }

    function sliderRow(key, label, description, min, max, step) {
        return (
            '<div class="st-row">' +
            '<div class="st-label"><b>' + label + '</b><small>' + description + '</small></div>' +
            '<div class="st-ctl">' +
            '<input type="range" data-key="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '">' +
            '<output class="st-out" data-out="' + key + '"></output>' +
            '</div>' +
            '</div>'
        );
    }

    function toggleRow(key, label, description) {
        return (
            '<div class="st-row">' +
            '<div class="st-label"><b>' + label + '</b><small>' + description + '</small></div>' +
            '<button class="st-switch" data-switch="' + key + '"><span>On</span><i></i></button>' +
            '</div>'
        );
    }

    function buildSwatches() {
        return XI.THEMES.map(function (theme) {
            return (
                '<button data-theme="' + theme.id + '" style="background:' + theme.sw[1] + '"' +
                ' title="' + theme.name + '" aria-label="' + theme.name + '"></button>'
            );
        }).join('');
    }

    function buildShell() {
        const tabsHTML = TABS.map(function (tab, index) {
            return '<button class="st-tab' + (index === 0 ? ' on' : '') + '" data-tab="' + tab.id + '">' + tab.label + '</button>';
        }).join('');

        studioElement.innerHTML =
            '<div class="st-shell">' +
            '<aside class="st-side">' +
            '<div class="st-head">' +
            '<div class="st-crumb">Target / Style</div>' +
            '<h1>Dial it in</h1>' +
            '<p>Pick your menu and marker style. Every change previews live.</p>' +
            '</div>' +
            '<nav class="st-tabs" id="st-tabs">' + tabsHTML + '</nav>' +
            '<div class="st-panels">' +
            '<div class="st-panel on" id="st-panel-menu"><div class="st-list" id="st-menu-list"></div></div>' +
            '<div class="st-panel" id="st-panel-marker">' +
            '<div class="st-tiles" id="st-tiles"></div>' +
            sliderRow('markerScale', 'Marker size', 'Scale of the target marker.', 60, 125, 5) +
            '</div>' +
            '<div class="st-panel" id="st-panel-color">' +
            '<div class="st-row col">' +
            '<div class="st-ctl between">' +
            '<div class="st-label"><b>Accent</b><small>Pick a theme or enter your own hex.</small></div>' +
            '<div class="st-ctl">' +
            '<input type="color" id="st-color">' +
            '<input class="st-hex" id="st-hex" maxlength="7" placeholder="AUTO">' +
            '</div>' +
            '</div>' +
            '<div class="st-swatches" id="st-swatches">' + buildSwatches() + '</div>' +
            '<div class="st-ctl between">' +
            '<div class="st-label"><small id="st-theme-name"></small></div>' +
            '<button class="st-mini" id="st-auto">Use theme colour</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="st-panel" id="st-panel-feel">' +
            sliderRow('menuScale', 'Menu size', 'Scale of the interaction menu.', 60, 125, 5) +
            toggleRow('caps', 'Uppercase labels', 'Option text in capitals.') +
            toggleRow('motion', 'Animations', 'Marker motion and menu transitions.') +
            '</div>' +
            '</div>' +
            '</aside>' +
            '<section class="st-stage">' +
            '<div class="st-view" id="st-view">' +
            '<div id="st-pv-marker"></div>' +
            '<div id="st-pv-menu"></div>' +
            '<div class="st-read" id="st-read"></div>' +
            '<div class="st-tip">Scroll or click an option to select</div>' +
            '</div>' +
            '<div class="st-foot">' +
            '<div class="st-btns">' +
            '<button class="st-btn" id="st-reset">Reset</button>' +
            '<button class="st-btn" id="st-close">Close</button>' +
            '</div>' +
            '<div class="st-btns">' +
            '<span class="st-toast" id="st-toast"></span>' +
            '<button class="st-btn primary" id="st-save">Save</button>' +
            '</div>' +
            '</div>' +
            '</section>' +
            '</div>';
    }

    function mountMenuThumbnail(element, style) {
        XI.mountMenu(element, {
            style: style,
            theme: draft.theme,
            accent: draft.accent,
            motion: false,
            caps: draft.caps,
            scale: 100,
            options: THUMBNAIL_OPTIONS,
            index: 1
        });
        element.style.zoom = 0.22;
    }

    function mountMarkerThumbnail(element, style) {
        XI.mountMarker(element, {
            style: style,
            theme: draft.theme,
            accent: draft.accent,
            motion: draft.motion,
            scale: 100
        });
        element.style.zoom = 0.46;
    }

    function buildMenuList() {
        const list = find('#st-menu-list');

        list.innerHTML = XI.MENU_STYLES.map(function (style) {
            return (
                '<div class="st-pre" data-style="' + style[0] + '" tabindex="0">' +
                '<div class="st-box"><div class="st-thumb"></div></div>' +
                '<b>' + style[1] + '<br><small>' + style[2] + '</small></b>' +
                '<span class="st-check"></span>' +
                '</div>'
            );
        }).join('');

        findAll('#st-menu-list .st-pre').forEach(function (row) {
            mountMenuThumbnail(row.querySelector('.st-thumb'), row.dataset.style);
        });
    }

    function buildTiles() {
        const tiles = find('#st-tiles');

        tiles.innerHTML = XI.MARKER_STYLES.map(function (style) {
            return (
                '<button class="st-tile" data-marker="' + style[0] + '" title="' + style[2] + '">' +
                '<div class="st-thumb"></div><span>' + style[1] + '</span>' +
                '</button>'
            );
        }).join('');

        findAll('.st-tile').forEach(function (tile) {
            mountMarkerThumbnail(tile.querySelector('.st-thumb'), tile.dataset.marker);
        });
    }

    function buildThumbnails() {
        buildMenuList();
        buildTiles();
    }

    function renderPreview() {
        XI.mountMenu(find('#st-pv-menu'), {
            style: draft.menuStyle,
            theme: draft.theme,
            accent: draft.accent,
            motion: draft.motion,
            caps: draft.caps,
            scale: draft.menuScale,
            options: SAMPLE_OPTIONS,
            index: previewIndex
        });

        XI.mountMarker(find('#st-pv-marker'), {
            style: draft.markerStyle,
            theme: draft.theme,
            accent: draft.accent,
            motion: draft.motion,
            scale: draft.markerScale
        });
    }

    function syncControls() {
        findAll('#st-menu-list .st-pre').forEach(function (row) {
            row.classList.toggle('on', row.dataset.style === draft.menuStyle);
        });

        findAll('.st-tile').forEach(function (tile) {
            tile.classList.toggle('on', tile.dataset.marker === draft.markerStyle);
        });

        findAll('#st-swatches button').forEach(function (button) {
            button.classList.toggle('on', !draft.accent && button.dataset.theme === draft.theme);
        });

        findAll('input[type=range]').forEach(function (slider) {
            const key = slider.dataset.key;
            const percent = ((draft[key] - slider.min) / (slider.max - slider.min)) * 100;

            slider.value = draft[key];
            slider.style.setProperty('--p', percent + '%');
            find('[data-out="' + key + '"]').textContent = draft[key] + '%';
        });

        findAll('.st-switch').forEach(function (button) {
            const isOn = draft[button.dataset.switch] !== false;

            button.classList.toggle('on', isOn);
            button.querySelector('span').textContent = isOn ? 'On' : 'Off';
        });

        const currentAccent = draft.accent || XI.theme(draft.theme).vars.ac;
        const hexInput = find('#st-hex');

        find('#st-color').value = currentAccent;
        if (document.activeElement !== hexInput) {
            hexInput.value = draft.accent || '';
        }

        find('#st-theme-name').textContent = draft.accent ? 'Custom colour' : XI.theme(draft.theme).name + ' theme';

        const colorName = (draft.accent || XI.theme(draft.theme).name).toUpperCase();
        find('#st-read').textContent =
            'Menu · ' + nameOf(XI.MENU_STYLES, draft.menuStyle) +
            '   Marker · ' + nameOf(XI.MARKER_STYLES, draft.markerStyle) +
            '   ' + colorName;
    }

    function refresh(rebuildThumbnails) {
        renderPreview();
        if (rebuildThumbnails) {
            buildThumbnails();
        }
        syncControls();
    }

    function selectPreviewOption(index) {
        previewIndex = index;
        XI.setIndex(find('#st-pv-menu'), previewIndex);
    }

    function openStudio() {
        draft = TargetUI.getConfig();
        previewIndex = 0;
        document.body.classList.add('studio-open');
        refresh(true);
    }

    function closeStudio() {
        document.body.classList.remove('studio-open');
        TargetUI.post('closeStudio', {});
    }

    function saveAndClose() {
        TargetUI.saveConfig(draft);
        closeStudio();
    }

    function handleTabClick(event) {
        const button = event.target.closest('.st-tab');

        if (!button) {
            return;
        }

        findAll('.st-tab').forEach(function (tab) {
            tab.classList.toggle('on', tab === button);
        });
        findAll('.st-panel').forEach(function (panel) {
            panel.classList.toggle('on', panel.id === 'st-panel-' + button.dataset.tab);
        });
    }

    function handleSliderInput(event) {
        const key = event.target.dataset.key;

        if (!key) {
            return;
        }

        draft[key] = parseFloat(event.target.value);
        refresh(false);
    }

    function handlePanelClick(event) {
        const styleRow = event.target.closest('#st-menu-list .st-pre');
        if (styleRow) {
            draft.menuStyle = styleRow.dataset.style;
            refresh(false);
            return;
        }

        const tile = event.target.closest('.st-tile');
        if (tile) {
            draft.markerStyle = tile.dataset.marker;
            refresh(false);
            return;
        }

        const swatch = event.target.closest('#st-swatches [data-theme]');
        if (swatch) {
            draft.theme = swatch.dataset.theme;
            draft.accent = '';
            refresh(true);
            return;
        }

        const toggle = event.target.closest('[data-switch]');
        if (toggle) {
            const key = toggle.dataset.switch;
            draft[key] = draft[key] === false;
            refresh(true);
        }
    }

    function handleColorInput(event) {
        draft.accent = event.target.value;
        refresh(true);
    }

    function handleHexInput(event) {
        let value = event.target.value.trim();

        if (value && value[0] !== '#') {
            value = '#' + value;
        }

        if (/^#[0-9a-f]{6}$/i.test(value)) {
            draft.accent = value.toLowerCase();
            refresh(true);
        }
    }

    function handleReset() {
        draft = TargetUI.getDefaults();
        refresh(true);
        showToast('Reset to defaults');
    }

    function handleSave() {
        showToast('Saved');
        saveAndClose();
    }

    function handlePreviewClick(event) {
        const option = event.target.closest('.opt');

        if (option) {
            selectPreviewOption(Number(option.dataset.i));
        }
    }

    function handlePreviewWheel(event) {
        event.preventDefault();

        const direction = event.deltaY > 0 ? 1 : -1;
        const count = SAMPLE_OPTIONS.length;

        selectPreviewOption((previewIndex + direction + count) % count);
    }

    function handleKeyDown(event) {
        if (!isStudioOpen()) {
            return;
        }

        if (event.key === 'Escape') {
            closeStudio();
        }
    }

    buildShell();

    find('#st-tabs').addEventListener('click', handleTabClick);
    find('.st-panels').addEventListener('input', handleSliderInput);
    find('.st-panels').addEventListener('click', handlePanelClick);
    find('#st-color').addEventListener('input', handleColorInput);
    find('#st-hex').addEventListener('input', handleHexInput);
    find('#st-hex').addEventListener('blur', syncControls);
    find('#st-auto').addEventListener('click', function () {
        draft.accent = '';
        refresh(true);
    });

    find('#st-pv-menu').addEventListener('click', handlePreviewClick);
    find('#st-view').addEventListener('wheel', handlePreviewWheel, { passive: false });

    find('#st-reset').addEventListener('click', handleReset);
    find('#st-close').addEventListener('click', closeStudio);
    find('#st-save').addEventListener('click', handleSave);

    window.addEventListener('keydown', handleKeyDown);

    window.addEventListener('message', function (event) {
        if (event.data.response === 'openStudio') {
            openStudio();
        }
    });
});
