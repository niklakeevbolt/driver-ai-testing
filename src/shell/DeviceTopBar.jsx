import { useRef, useState, useEffect } from 'react'
import { DEVICE_SIZES } from './constants.js'
import { useDeviceFrame } from './context.jsx'

const FONT = "var(--font-sans, InterVariable, ui-sans-serif, system-ui, sans-serif)";

// CSS variable fallbacks so the bar renders correctly in any prototype,
// even those that don't import the full Clay token set.
const T = {
  bgNeutralSecondary: "var(--color-bg-neutral-secondary, #eaecf0)",
  layerFloor1: "var(--color-layer-floor-1, #ffffff)",
  contentPrimary: "var(--color-content-primary, #1a1a1a)",
  contentSecondary: "var(--color-content-secondary, #6b7280)",
  contentTertiary: "var(--color-content-tertiary, #9ca3af)",
  bgActionSecondary: "var(--color-bg-action-secondary, #e8f5ee)",
  contentActionPrimary: "var(--color-content-action-primary, #1d965c)",
  borderNeutralSecondary: "var(--color-border-neutral-secondary, #e0e3e8)",
  borderSeparator: "var(--color-border-separator, #e5e7eb)",
  layerFloor0Grouped: "var(--color-layer-floor-0-grouped, #f0f2f5)",
  shadow: "0 1px 2px rgba(0,0,0,0.08)",
};

const PLATFORMS = ['iOS', 'Android']

const styles = {
  pillToggle: {
    display: "flex",
    gap: 2,
    padding: 2,
    background: T.bgNeutralSecondary,
    borderRadius: 9999,
  },
  deviceSelectRoot: {
    position: "relative",
  },
  deviceButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 9999,
    border: "none",
    color: T.contentPrimary,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
  },
  deviceMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    background: T.layerFloor1,
    border: `1px solid ${T.borderNeutralSecondary}`,
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    zIndex: 30,
    padding: 4,
    minWidth: 220,
  },
  platformLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: T.contentTertiary,
    padding: "8px 10px 4px",
    margin: 0,
    fontFamily: FONT,
  },
  deviceOption: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: "6px 10px",
    borderRadius: 6,
    border: "none",
    fontFamily: FONT,
    cursor: "pointer",
    textAlign: "left",
  },
  topBar: {
    width: "100%",
    height: 48,
    background: T.layerFloor0Grouped,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    fontFamily: FONT,
    flexShrink: 0,
  },
}

function pillOptionStyle(active) {
  return {
    padding: "4px 12px",
    borderRadius: 9999,
    border: "none",
    background: active ? T.layerFloor1 : "transparent",
    color: active ? T.contentPrimary : T.contentSecondary,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT,
    boxShadow: active ? T.shadow : "none",
  };
}

function selectedDeviceButtonStyle(open) {
  return {
    ...styles.deviceButton,
    background: open ? T.layerFloor1 : T.bgNeutralSecondary,
    boxShadow: open ? T.shadow : "none",
  };
}

function deviceOptionStyle(selected) {
  return {
    ...styles.deviceOption,
    background: selected ? T.bgActionSecondary : "transparent",
    color: selected ? T.contentActionPrimary : T.contentPrimary,
  };
}

function PillToggle({
  options,
  value,
  onChange,
}) {
  return (
    <div style={styles.pillToggle}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={pillOptionStyle(active)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function DeviceSelect({
  deviceSizeIdx,
  setDeviceSizeIdx,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = DEVICE_SIZES[deviceSizeIdx] ?? DEVICE_SIZES[3]

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} style={styles.deviceSelectRoot}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={selectedDeviceButtonStyle(open)}
      >
        <span>{current.label}</span>
        <span style={{ fontSize: 9, color: T.contentSecondary }}>▾</span>
      </button>

      {open && (
        <div role="listbox" style={styles.deviceMenu}>
          {PLATFORMS.map((platform, gi) => (
            <div key={platform}>
              <p style={styles.platformLabel}>{platform}</p>
              {DEVICE_SIZES.map((d, i) => {
                if (d.platform !== platform) return null;
                const selected = i === deviceSizeIdx;
                return (
                  <button
                    type="button"
                    key={d.label}
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setDeviceSizeIdx(i);
                      window.location.reload();
                    }}
                    style={deviceOptionStyle(selected)}
                  >
                    <span style={{ fontSize: 13, fontWeight: selected ? 600 : 500 }}>
                      {d.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: selected ? T.contentActionPrimary : T.contentSecondary,
                        opacity: selected ? 0.85 : 1,
                      }}
                    >
                      {d.width} × {d.height}
                    </span>
                  </button>
                );
              })}
              {gi < PLATFORMS.length - 1 && (
                <div style={{ height: 1, background: T.borderSeparator, margin: "4px 6px" }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeviceTopBar({
  darkMode,
  setDarkMode,
  rtl,
  setRtl,
  landscape,
  setLandscape,
  deviceSizeIdx,
  setDeviceSizeIdx,
  rightSlot,
}) {
  return (
    <div style={styles.topBar}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <DeviceSelect deviceSizeIdx={deviceSizeIdx} setDeviceSizeIdx={setDeviceSizeIdx} />

        <PillToggle
          options={[
            {
              value: "portrait",
              label: (
                <svg
                  width="10"
                  height="14"
                  viewBox="0 0 10 14"
                  fill="none"
                  aria-label="Portrait"
                  style={{ display: "block" }}
                >
                  <rect x="0.5" y="0.5" width="9" height="13" rx="1.5" stroke="currentColor" />
                </svg>
              ),
            },
            {
              value: "landscape",
              label: (
                <svg
                  width="14"
                  height="10"
                  viewBox="0 0 14 10"
                  fill="none"
                  aria-label="Landscape"
                  style={{ display: "block" }}
                >
                  <rect x="0.5" y="0.5" width="13" height="9" rx="1.5" stroke="currentColor" />
                </svg>
              ),
            },
          ]}
          value={landscape ? "landscape" : "portrait"}
          onChange={(v) => setLandscape(v === "landscape")}
        />

        <PillToggle
          options={[
            {
              value: "light",
              label: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-label="Light"
                  style={{ display: "block" }}
                >
                  <circle cx="7" cy="7" r="2.75" stroke="currentColor" strokeWidth="1.2" />
                  <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M7 1V2.2" />
                    <path d="M7 11.8V13" />
                    <path d="M1 7H2.2" />
                    <path d="M11.8 7H13" />
                    <path d="M2.76 2.76L3.6 3.6" />
                    <path d="M10.4 10.4L11.24 11.24" />
                    <path d="M2.76 11.24L3.6 10.4" />
                    <path d="M10.4 3.6L11.24 2.76" />
                  </g>
                </svg>
              ),
            },
            {
              value: "dark",
              label: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-label="Dark"
                  style={{ display: "block" }}
                >
                  <path
                    d="M12 8.5A5 5 0 1 1 5.5 2a4 4 0 0 0 6.5 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            },
          ]}
          value={darkMode ? "dark" : "light"}
          onChange={(v) => setDarkMode(v === "dark")}
        />

        <PillToggle
          options={[
            { value: "ltr", label: "LTR" },
            { value: "rtl", label: "RTL" },
          ]}
          value={rtl ? "rtl" : "ltr"}
          onChange={(v) => setRtl(v === "rtl")}
        />
      </div>

      {rightSlot && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{rightSlot}</div>
      )}
    </div>
  );
}

/** Convenience wrapper that reads from the nearest DeviceFrameProvider. */
export function DeviceFrameTopBar({ rightSlot }) {
  const ctx = useDeviceFrame();
  return <DeviceTopBar {...ctx} rightSlot={rightSlot} />;
}
