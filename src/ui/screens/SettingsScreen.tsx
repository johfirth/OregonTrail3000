import React, { useState, useEffect } from 'react';
import { ThemeMode, TextSpeed, FontSize } from '../../engine/types';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../hooks/useTheme';
import { useIcons } from '../hooks/useIcons';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps): React.ReactElement {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { COLORS, FONTS, BASE_STYLES, isRetro } = useTheme();
  const icons = useIcons();
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function ToggleButton({ id, label, active, onClick }: {
    id: string; label: string; active: boolean; onClick: () => void;
  }) {
    const isHovered = hoveredBtn === id;
    return (
      <button
        onClick={onClick}
        onMouseEnter={() => setHoveredBtn(id)}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          ...BASE_STYLES.button,
          fontSize: '12px',
          padding: '6px 14px',
          backgroundColor: active ? COLORS.highlight : COLORS.buttonBg,
          color: active ? COLORS.bgDark : COLORS.text,
          borderColor: active ? COLORS.highlight : COLORS.borderLight,
          ...(isHovered && !active ? { backgroundColor: COLORS.buttonHover, borderColor: COLORS.info } : {}),
        }}
      >
        {label}
      </button>
    );
  }

  function SettingRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <span style={{ color: COLORS.text, fontSize: '13px', fontFamily: FONTS.mono }}>
          {label}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {children}
        </div>
      </div>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return (
      <div style={{
        color: COLORS.info,
        fontSize: '12px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginTop: '20px',
        marginBottom: '8px',
        fontFamily: FONTS.mono,
      }}>
        ─── {title} ───
      </div>
    );
  }

  // Theme preview swatches
  function ThemePreview({ mode }: { mode: ThemeMode }) {
    const previewColors = mode === ThemeMode.Retro80s
      ? { bg: '#0000AA', text: '#FFFFFF', accent: '#FFFF55', border: '#5555FF' }
      : { bg: '#061A40', text: '#FFFFFF', accent: '#FC3D21', border: '#2D5A8E' };

    return (
      <div style={{
        display: 'inline-flex',
        gap: '2px',
        marginLeft: '6px',
        verticalAlign: 'middle',
      }}>
        {[previewColors.bg, previewColors.accent, previewColors.border, previewColors.text].map((c, i) => (
          <div key={i} style={{
            width: '10px',
            height: '10px',
            backgroundColor: c,
            border: '1px solid #555',
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      ...BASE_STYLES.container,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        border: `2px solid ${COLORS.borderLight}`,
        padding: '24px',
        backgroundColor: COLORS.bgPanel,
      }}>
        <h1 style={{
          color: COLORS.text,
          fontFamily: FONTS.display,
          fontSize: '18px',
          textAlign: 'center',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}>
          {isRetro ? '[SETTINGS]' : icons.settings} SETTINGS
        </h1>
        <div style={{
          color: COLORS.muted,
          fontSize: '10px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          Press Escape to close
        </div>

        {/* === DISPLAY === */}
        <SectionHeader title="Display" />

        <SettingRow label={`${isRetro ? '[THEME]' : '🎨'} Theme`}>
          <ToggleButton
            id="theme-nasa"
            label="NASA Modern"
            active={settings.theme === ThemeMode.NASA}
            onClick={() => updateSettings({ theme: ThemeMode.NASA })}
          />
          <ThemePreview mode={ThemeMode.NASA} />
          <ToggleButton
            id="theme-retro"
            label="Retro 80s"
            active={settings.theme === ThemeMode.Retro80s}
            onClick={() => updateSettings({ theme: ThemeMode.Retro80s })}
          />
          <ThemePreview mode={ThemeMode.Retro80s} />
        </SettingRow>

        <SettingRow label={`${isRetro ? '[FONT]' : '📏'} Font Size`}>
          <ToggleButton
            id="font-small"
            label="Small"
            active={settings.fontSize === FontSize.Small}
            onClick={() => updateSettings({ fontSize: FontSize.Small })}
          />
          <ToggleButton
            id="font-medium"
            label="Medium"
            active={settings.fontSize === FontSize.Medium}
            onClick={() => updateSettings({ fontSize: FontSize.Medium })}
          />
          <ToggleButton
            id="font-large"
            label="Large"
            active={settings.fontSize === FontSize.Large}
            onClick={() => updateSettings({ fontSize: FontSize.Large })}
          />
        </SettingRow>

        <SettingRow label={<>{isRetro ? '[LOG]' : icons.doc} Log Lines</>}>
          {[25, 50, 100].map(n => (
            <ToggleButton
              key={n}
              id={`log-${n}`}
              label={`${n}`}
              active={settings.narrativeLogLines === n}
              onClick={() => updateSettings({ narrativeLogLines: n })}
            />
          ))}
        </SettingRow>

        {/* === GAMEPLAY === */}
        <SectionHeader title="Gameplay" />

        <SettingRow label={`${isRetro ? '[KEYS]' : '⌨️'} Keyboard Hints`}>
          <ToggleButton
            id="kb-on"
            label="On"
            active={settings.showKeyboardHints}
            onClick={() => updateSettings({ showKeyboardHints: true })}
          />
          <ToggleButton
            id="kb-off"
            label="Off"
            active={!settings.showKeyboardHints}
            onClick={() => updateSettings({ showKeyboardHints: false })}
          />
        </SettingRow>

        <SettingRow label={`${isRetro ? '[CREW]' : '👥'} Crew Panel`}>
          <ToggleButton
            id="crew-on"
            label="On"
            active={settings.showCrewPanel}
            onClick={() => updateSettings({ showCrewPanel: true })}
          />
          <ToggleButton
            id="crew-off"
            label="Off"
            active={!settings.showCrewPanel}
            onClick={() => updateSettings({ showCrewPanel: false })}
          />
        </SettingRow>

        <SettingRow label={<>{isRetro ? '[SAVE]' : icons.save} Auto-Save</>}>
          <ToggleButton
            id="auto-on"
            label="On"
            active={settings.autoSave}
            onClick={() => updateSettings({ autoSave: true })}
          />
          <ToggleButton
            id="auto-off"
            label="Off"
            active={!settings.autoSave}
            onClick={() => updateSettings({ autoSave: false })}
          />
        </SettingRow>

        {/* === TEXT === */}
        <SectionHeader title="Text" />

        <SettingRow label={`${isRetro ? '[SPEED]' : '⚡'} Text Speed`}>
          {([
            [TextSpeed.Slow, 'Slow'],
            [TextSpeed.Normal, 'Normal'],
            [TextSpeed.Fast, 'Fast'],
            [TextSpeed.Instant, 'Instant'],
          ] as [TextSpeed, string][]).map(([speed, label]) => (
            <ToggleButton
              key={speed}
              id={`speed-${speed}`}
              label={label}
              active={settings.textSpeed === speed}
              onClick={() => updateSettings({ textSpeed: speed })}
            />
          ))}
        </SettingRow>

        {/* === SYSTEM === */}
        <SectionHeader title="System" />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            onMouseEnter={() => setHoveredBtn('back')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...BASE_STYLES.button,
              ...(hoveredBtn === 'back' ? BASE_STYLES.buttonHover : {}),
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => {
              resetSettings();
            }}
            onMouseEnter={() => setHoveredBtn('reset')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...BASE_STYLES.buttonDanger,
              fontSize: '12px',
              ...(hoveredBtn === 'reset' ? { opacity: 0.8 } : {}),
            }}
          >
            {isRetro ? '[RESET]' : '🔄'} Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
