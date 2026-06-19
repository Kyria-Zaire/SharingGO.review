import { Camera, Keyboard, Eraser, ScanLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { CameraScanner } from "./CameraScanner";
import type { CameraPermission } from "@/features/boarding/hooks/useCameraScanner";

type ScannerTab = "camera" | "manual";

export interface BoardingScannerPanelProps {
  // Manual mode
  tokenInput: string;
  onTokenChange: (value: string) => void;
  /** Single entry point → triggers validate → confirm → consume flow */
  onManualSubmit: () => void;
  onClear: () => void;
  isValidating: boolean;
  isConsuming: boolean;
  disabled?: boolean;

  // Camera mode
  cameraPermission: CameraPermission;
  cameraIsScanning: boolean;
  cameraPaused: boolean;
  onCameraDetected: (token: string) => void;
  onCameraRequestPermission: () => Promise<void>;

  // Tab switch — parent resets scan state
  onTabChange: () => void;
}

export function BoardingScannerPanel({
  tokenInput,
  onTokenChange,
  onManualSubmit,
  onClear,
  isValidating,
  isConsuming,
  disabled,
  cameraPermission,
  cameraIsScanning,
  cameraPaused,
  onCameraDetected,
  onCameraRequestPermission,
  onTabChange,
}: BoardingScannerPanelProps) {
  const cameraAvailable = cameraPermission !== "unavailable";
  const [activeTab, setActiveTab] = useState<ScannerTab>(cameraAvailable ? "camera" : "manual");

  const manualBusy = isValidating || isConsuming || disabled;

  function switchTab(tab: ScannerTab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    onTabChange();
  }

  return (
    <Card className="min-w-0 overflow-hidden border-primary/20 p-0">
      {/* Tab bar */}
      <div className="flex border-b border-border" role="tablist">
        <TabButton
          active={activeTab === "camera"}
          onClick={() => switchTab("camera")}
          disabled={!cameraAvailable}
          title={!cameraAvailable ? "Aucune caméra détectée" : undefined}
          icon={<Camera className="h-4 w-4" />}
          label="Caméra"
          id="tab-camera"
          controls="panel-camera"
        />
        <TabButton
          active={activeTab === "manual"}
          onClick={() => switchTab("manual")}
          icon={<Keyboard className="h-4 w-4" />}
          label="Saisie manuelle"
          id="tab-manual"
          controls="panel-manual"
        />
      </div>

      {/* Camera panel */}
      <div
        id="panel-camera"
        role="tabpanel"
        aria-labelledby="tab-camera"
        hidden={activeTab !== "camera"}
        className="p-3 space-y-3 sm:p-4 sm:space-y-4"
      >
        <CameraScanner
          permission={cameraPermission}
          isScanning={cameraIsScanning}
          paused={cameraPaused}
          onDetected={onCameraDetected}
          onRequestPermission={onCameraRequestPermission}
        />
        <p className="text-center text-xs text-muted-foreground">
          Pointez la caméra vers le QR code du billet passager.
        </p>
      </div>

      {/* Manual panel */}
      <div
        id="panel-manual"
        role="tabpanel"
        aria-labelledby="tab-manual"
        hidden={activeTab !== "manual"}
        className="p-4 space-y-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <ScanLine className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold text-foreground">Saisie manuelle JWT</h3>
            <p className="text-xs text-muted-foreground">
              Collez le JWT du QR — dépannage si la caméra est indisponible.
            </p>
          </div>
        </div>

        <label htmlFor="boarding-jwt" className="sr-only">
          JWT boarding
        </label>
        <textarea
          id="boarding-jwt"
          rows={5}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
          className="min-h-[7.5rem] w-full min-w-0 resize-y break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
          value={tokenInput}
          onChange={(e) => onTokenChange(e.target.value)}
          disabled={manualBusy}
          spellCheck={false}
          autoComplete="off"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {/* Single action: validate → confirm → consume (same flow as camera) */}
          <Button
            variant="primary"
            size="lg"
            className="w-full font-semibold shadow-md shadow-primary/20 sm:flex-1"
            onClick={onManualSubmit}
            isLoading={isValidating || isConsuming}
            disabled={manualBusy || !tokenInput.trim()}
          >
            {isValidating ? "Vérification…" : isConsuming ? "Embarquement…" : "Vérifier le billet"}
          </Button>
          <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={onClear} disabled={manualBusy}>
            <Eraser className="h-4 w-4" />
            Effacer
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Le billet sera vérifié, puis vous confirmerez l'embarquement manuellement.
        </p>
      </div>
    </Card>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  icon: React.ReactNode;
  label: string;
  id: string;
  controls: string;
}

function TabButton({ active, onClick, disabled, title, icon, label, id, controls }: TabButtonProps) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors sm:gap-2 sm:py-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "border-b-2 border-primary text-primary bg-primary/5"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
