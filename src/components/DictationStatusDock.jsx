import { cn } from "./lib/utils";

const FLOW_BARS = [7, 10, 14, 19, 24, 24, 19, 14, 10, 7];

function FlowWaveform({ active, compact, audioLevel }) {
  const level = Math.max(0, Math.min(1, Number(audioLevel) || 0));
  const center = (FLOW_BARS.length - 1) / 2;
  const idleScale = compact ? 0.45 : 0.72;
  const maxHeight = compact ? 18 : 24;

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "h-4 w-[30px] gap-[2px]" : "h-6 w-[42px] gap-[3px]"
      )}
    >
      {FLOW_BARS.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={cn(
            "block origin-center rounded-full bg-white transition-[height,opacity] duration-75 ease-out",
            compact ? "w-[2px]" : "w-[3px]"
          )}
          style={{
            height: Math.round(
              Math.min(
                maxHeight,
                Math.max(
                  3,
                  height * idleScale +
                    (active
                      ? level *
                        (compact ? 12 : 18) *
                        (0.45 + (1 - Math.abs(index - center) / center))
                      : 0)
                )
              )
            ),
            opacity: active ? 1 : 0.82,
          }}
        />
      ))}
    </div>
  );
}

export default function DictationStatusDock({
  active = true,
  compact = false,
  audioLevel = 0,
  processing = false,
  className = undefined,
  centralButtonRef = undefined,
  centralButtonProps = {},
  hotkeyLabel = undefined,
  stopLabel = "Finish and paste",
  processingLabel = "Processing...",
  showHint = false,
}) {
  const { className: centralClassName, style: centralStyle, ...centralProps } = centralButtonProps;
  const hint = processing ? processingLabel : active ? stopLabel : hotkeyLabel;

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

      <div className="flex h-[38px] items-center justify-center">
        <button
          ref={centralButtonRef}
          type="button"
          aria-label={hint || "Dictate"}
          title={hint || "Dictate"}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full",
            "border border-white/30 bg-[#171515] text-white",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.18)]",
            "transition-all duration-150 hover:bg-[#211f1f] active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45",
            compact ? "h-[32px] w-[58px] px-2" : "h-[34px] w-[92px] px-2",
            processing && "cursor-wait opacity-90",
            centralClassName
          )}
          style={centralStyle}
          {...centralProps}
        >
          <FlowWaveform active={active} compact={compact} audioLevel={audioLevel} />
        </button>
      </div>
    </div>
  );
}
