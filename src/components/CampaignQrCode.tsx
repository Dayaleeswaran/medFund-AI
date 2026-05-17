"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { QrCode as QrIcon, Download, Share2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

export function CampaignQrCode({ campaignId, title }: { campaignId: string, title: string }) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);

  async function generateQr() {
    setLoading(true);
    try {
      const res = await fetch("/api/fintech/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.qrPayload) {
        setQrData(data.qrPayload);
      } else {
        throw new Error("Failed to generate QR");
      }
    } catch (e) {
      toast.error("QR Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={(open) => open && !qrData && generateQr()}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
          <QrIcon className="h-4 w-4" />
          Get Campaign QR
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm border-[var(--mf-neon)]/20 bg-[#061f36] text-white">
        <div className="flex flex-col gap-1.5 text-center sm:text-left">
          <DialogTitle>Campaign QR Code</DialogTitle>
          <p className="text-xs text-white/50">Share this to receive instant donations</p>
        </div>
        
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="rounded-3xl bg-white p-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            {loading ? (
              <div className="flex h-[200px] w-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--mf-navy)]" />
              </div>
            ) : qrData ? (
              <QRCode 
                value={qrData} 
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            ) : null}
          </div>

          <div className="w-full space-y-3">
            <p className="text-center text-sm font-semibold">{title}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={() => {
                  toast.success("Link copied to clipboard");
                  if (qrData) navigator.clipboard.writeText(qrData);
                }}
              >
                <Share2 className="h-4 w-4" />
                Copy Link
              </Button>
              <Button variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
