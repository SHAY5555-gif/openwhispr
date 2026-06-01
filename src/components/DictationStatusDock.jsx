import { MessageSquare, WandSparkles } from "lucide-react";
import { cn } from "./lib/utils";

const FLOW_BARS = [7, 10, 14, 19, 24, 24, 19, 14, 10, 7];

function FlowWaveform({ active }) {
  return (
    <div className="flex h-6 w-[42px] items-center justify-center gap-[3px]">
      {FLOW_BARS.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="block w-[3px] origin-center rounded-full bg-white"
          style={{
            height,
            animation: active
              ? `waveform-bar ${0.78 + (index % 4) * 0.05}s ease-in-out ${index * 0.045}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}

function DockButton({ children, className, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full",
        "border border-white/30 bg-[#171515] text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.18)]",
        "transition-colors duration-150 hover:bg-[#211f1f]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function DictationStatusDock({
  active = true,
  className = undefined,
  centralButtonRef = undefined,
  centralButtonProps = {},
  hotkeyLabel = undefined,
  stopLabel = "Finish and paste",
  language = "EN",
  onPolish = undefined,
  onChat = undefined,
  showHint = false,
}) {
  const { className: centralClassName, style: centralStyle, ...centralProps } = centralButtonProps;
  const hint = active ? stopLabel : hotkeyLabel;

  return (
    <div className={cn("group/flowdock relative flex flex-col items-center", className)}>
      {hint ? (
        <div
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
            "whitespace-nowrap rounded-lg bg-[#1d1a1a] px-2.5 py-1.5 text-[12px] font-medium leading-none text-[#f2f1f0]",
            "shadow-[0_10px_26px_rgba(0,0,0,0.24)]",
            "opacity-0 transition-opacity duration-150 group-hover/flowdock:opacity-100",
            showHint && "opacity-100"
          )}
        >
          {hint}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1d1a1a]" />
        </div>
      ) : null}

      <div className="flex h-[38px] items-center justify-center gap-[7px]">
        <DockButton aria-label="Language" title="Language" className="text-[11px] font-semibold">
          {language}
        </DockButton>

        <button
          ref={centralButtonRef}
          type="button"
          aria-label={active ? stopLabel : hotkeyLabel || "Dictate"}
          title={active ? stopLabel : hotkeyLabel || "Dictate"}
          className={cn(
            "flex h-[34px] w-[92px] shrink-0 items-center justify-center rounded-full px-2",
            "border border-white/30 bg-[#171515] text-white",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.18)]",
            "transition-all duration-150 hover:bg-[#211f1f] active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45",
            centralClassName
          )}
          style={centralStyle}
          {...centralProps}
        >
          <FlowWaveform active={active} />
        </button>

        <DockButton aria-label="Polish" title="Polish" onClick={onPolish}>
          <WandSparkles size={15} strokeWidth={2.2} />
        </DockButton>

        <DockButton aria-label="Chat" title="Chat" onClick={onChat}>
          <MessageSquare size={15} strokeWidth={2.2} />
        </DockButton>
      </div>
    </div>
  );
}
