import { useCallback, useEffect, useRef, useState } from "react";

export type CameraPermission = "prompt" | "granted" | "denied" | "unavailable";

export interface UseCameraScannerReturn {
  permission: CameraPermission;
  isScanning: boolean;
  lastScanned: string | null;
  startScan: () => void;
  pauseScan: () => void;
  resumeScan: () => void;
  requestPermission: () => Promise<void>;
  handleDetected: (token: string) => void;
}

export function useCameraScanner(
  onDetected: (token: string) => void,
  paused: boolean
): UseCameraScannerReturn {
  const [permission, setPermission] = useState<CameraPermission>("prompt");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const pausedRef = useRef(paused);
  const lastScannedRef = useRef(lastScanned);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { lastScannedRef.current = lastScanned; }, [lastScanned]);
  useEffect(() => { onDetectedRef.current = onDetected; }, [onDetected]);

  // Detect camera availability via permissions API (best-effort)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPermission("unavailable");
      return;
    }
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((status) => {
        setPermission(status.state as CameraPermission);
        status.onchange = () => setPermission(status.state as CameraPermission);
      })
      .catch(() => {
        // permissions API not supported on this browser — leave as "prompt"
      });
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach((t) => t.stop());
      setPermission("granted");
      setIsScanning(true);
    } catch {
      setPermission("denied");
    }
  }, []);

  const startScan = useCallback(() => setIsScanning(true), []);
  const pauseScan = useCallback(() => setIsScanning(false), []);
  const resumeScan = useCallback(() => {
    setLastScanned(null);
    setIsScanning(true);
  }, []);

  // Stable callback: ignores duplicate scans and honours pause state via refs
  const handleDetected = useCallback((token: string) => {
    if (pausedRef.current) return;
    if (token === lastScannedRef.current) return;
    setLastScanned(token);
    onDetectedRef.current(token);
  }, []);

  return { permission, isScanning, lastScanned, startScan, pauseScan, resumeScan, requestPermission, handleDetected };
}
