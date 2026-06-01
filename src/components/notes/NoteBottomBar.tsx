import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import DictationStatusDock from "../DictationStatusDock.jsx";
import { cn } from "../lib/utils";

interface NoteBottomBarProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAskSubmit: (text: string) => void;
  onInputFocus?: () => void;
  audioLevel?: number;
  askDisabled?: boolean;
  actionPicker?: React.ReactNode;
  hideInput?: boolean;
}

export default function NoteBottomBar({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onAskSubmit,
  onInputFocus,
  audioLevel = 0,
  askDisabled,
  actionPicker,
  hideInput,
}: NoteBottomBarProps) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasText = inputText.trim().length > 0;

  const handleSubmit = useCallback(() => {
    const text = inputText.trim();
    if (!text || askDisabled) return;
    onAskSubmit(text);
    setInputText("");
    setIsExpanded(false);
  }, [inputText, askDisabled, onAskSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setIsExpanded(false);
        inputRef.current?.blur();
      }
    },
    [handleSubmit]
  );

  const handleInputFocus = useCallback(() => {
    setIsExpanded(true);
    onInputFocus?.();
  }, [onInputFocus]);

  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!hasText && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, hasText]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute bottom-0 left-0 right-0 z-10 px-5 pb-4 pt-3 pointer-events-none",
        !isRecording && "bg-background"
      )}
    >
      <div
        className={cn(
          "flex items-end gap-2 pointer-events-auto",
          (hideInput || isRecording) && "justify-center"
        )}
      >
        <div
          className={cn(
            "shrink-0 transition-all duration-300 ease-out overflow-hidden",
            !hideInput && isExpanded && !isRecording ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          {isRecording ? (
            <DictationStatusDock
              active={true}
              audioLevel={audioLevel}
              stopLabel={t("notes.editor.stop")}
              showHint={false}
              centralButtonProps={{
                onClick: onStopRecording,
              }}
            />
          ) : isProcessing ? (
            <DictationStatusDock
              compact={true}
              processing={true}
              processingLabel={t("app.mic.processing")}
              showHint={false}
            />
          ) : (
            <DictationStatusDock
              compact={true}
              hotkeyLabel={t("notes.editor.transcribe")}
              showHint={false}
              centralButtonProps={{
                onClick: onStartRecording,
              }}
            />
          )}
        </div>

        {!hideInput && !isRecording && (
          <div
            className={cn(
              "flex-1 min-w-0 flex items-center h-10 px-3 gap-2",
              "rounded-xl",
              "bg-foreground/3 dark:bg-white/4",
              "border",
              "transition-all duration-200",
              isExpanded
                ? "border-foreground/12 dark:border-white/10 shadow-[0_0_0_3px_rgba(0,0,0,0.02)] dark:shadow-[0_0_0_3px_rgba(255,255,255,0.02)]"
                : "border-border/20 dark:border-white/6"
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              disabled={askDisabled}
              placeholder={t("embeddedChat.askPlaceholder")}
              className={cn(
                "input-inline flex-1 bg-transparent outline-none min-w-0 p-0",
                "text-[13px] text-foreground",
                "placeholder:text-foreground/25 dark:placeholder:text-foreground/15"
              )}
            />

            {hasText ? (
              <button
                onClick={handleSubmit}
                disabled={askDisabled}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                  "bg-foreground dark:bg-foreground/90 text-background",
                  "transition-all duration-150",
                  "hover:bg-foreground/85 dark:hover:bg-foreground/80",
                  "active:scale-90",
                  "disabled:opacity-30"
                )}
                aria-label={t("embeddedChat.send")}
              >
                <ArrowUp size={13} strokeWidth={2.5} />
              </button>
            ) : !isExpanded ? (
              <div className="shrink-0">{actionPicker}</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
