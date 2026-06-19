import { Scanner } from "@yudiel/react-qr-scanner";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff, AlertTriangle } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import type { CameraPermission } from "@/features/boarding/hooks/useCameraScanner";

interface CameraScannerProps {
  permission: CameraPermission;
  isScanning: boolean;
  paused: boolean;
  onDetected: (token: string) => void;
  onRequestPermission: () => Promise<void>;
  onError?: (error: IScannerError) => void;
}

export function CameraScanner({
  permission,
  isScanning,
  paused,
  onDetected,
  onRequestPermission,
  onError,
}: CameraScannerProps) {
  const handleScan = useCallback(
    (codes: IDetectedBarcode[]) => {
      const first = codes[0];
      if (!first?.rawValue) return;
      onDetected(first.rawValue);
    },
    [onDetected]
  );

  if (permission === "unavailable") {
    return <CameraUnavailableState reason="no-camera" />;
  }

  if (permission === "denied") {
    return <CameraUnavailableState reason="denied" />;
  }

  if (permission === "prompt" && !isScanning) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/40 p-6 text-center sm:p-8">
        <Camera className="h-12 w-12 text-primary" />
        <div>
          <p className="text-base font-semibold text-foreground">Activer la caméra</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Le navigateur va demander l'accès à la caméra pour scanner les QR codes.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full max-w-xs text-base font-semibold"
          onClick={onRequestPermission}
        >
          <Camera className="h-5 w-5" />
          Activer la caméra
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[3/4] w-full min-w-0 overflow-hidden rounded-lg bg-black sm:aspect-[4/3]"
    >
      <Scanner
        onScan={handleScan}
        onError={onError}
        paused={paused}
        constraints={{ facingMode: "environment" }}
        formats={["qr_code"]}
        allowMultiple={false}
        classNames={{
          container: "w-full h-full",
          video: "w-full h-full object-cover",
        }}
        components={{ finder: false }}
      />

      {/* Viewfinder overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="relative h-40 w-40 sm:h-52 sm:w-52"
          aria-hidden
        >
          {/* Corner brackets */}
          <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-primary rounded-tl-sm" />
          <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-primary rounded-tr-sm" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary rounded-bl-sm" />
          <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary rounded-br-sm" />

          {/* Scan line animation */}
          {!paused && (
            <span className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/70 animate-scan-line" />
          )}
        </div>
      </div>

      {/* Paused overlay — only when camera visible without fullscreen flow */}
      {paused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-sm font-medium text-white/80 tracking-wide uppercase">Scanner en pause</p>
        </div>
      )}

      {/* Status pill */}
      {!paused && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Scanner actif
          </span>
        </div>
      )}
    </div>
  );
}

function CameraUnavailableState({ reason }: { reason: "no-camera" | "denied" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/40 p-6 text-center sm:p-8">
      {reason === "denied" ? (
        <>
          <AlertTriangle className="h-10 w-10 text-warning" />
          <div>
            <p className="text-base font-semibold text-foreground">Permission caméra refusée</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Autorisez l'accès à la caméra dans les réglages de votre navigateur, puis rechargez la page.
            </p>
          </div>
        </>
      ) : (
        <>
          <CameraOff className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-base font-semibold text-foreground">Caméra non disponible</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aucune caméra détectée sur cet appareil. Utilisez la saisie manuelle.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
