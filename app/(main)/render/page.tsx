"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ImageDropzone } from "@/components/image-dropzone";
import { UploadedImage } from "@/components/uploaded-image";
import { OutputImage } from "@/components/output-image";
import {
  DesignQuestionnaireForm,
  DEFAULT_QUESTIONNAIRE,
} from "@/components/design-questionnaire";
import { RenderGallery } from "@/components/render-gallery";
import { useRenderHistory } from "@/hooks/useRenderHistory";
import { useSubscription } from "@/hooks/use-subscription";
import { PlanNotActiveModal } from "@/components/plan-not-active-modal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { DesignQuestionnaire } from "@/types";

async function triggerDownload(url: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `render-${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
}

function SubscribedToast() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("subscribed") === "1") {
      toast.success(
        "Welcome! Your 3-day free trial has started. You have 10 renders included."
      );
    }
  }, [searchParams]);
  return null;
}

function RenderPageInner() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [questionnaire, setQuestionnaire] = useState<DesignQuestionnaire>(
    DEFAULT_QUESTIONNAIRE
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pricingOpen, setPricingOpen] = useState(false);
  const upgradingRef = useRef(false);

  const { history, addEntry, removeEntry, clearAll } = useRenderHistory();
  const {
    subscribed,
    status: subStatus,
    loading: subLoading,
    hadTrial,
    generationCount,
    generationLimit,
    refresh: refreshSubscription,
  } = useSubscription();

  const trialRemaining = generationCount < generationLimit;

  const handleImageUpload = useCallback((base64: string) => {
    setUploadedImage(base64);
    setOutputImage(null);
    setError(null);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setOutputImage(null);
    setError(null);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) return;
    if (!subLoading && !subscribed && !trialRemaining) {
      setPricingOpen(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutputImage(null);
    try {
      const response = await fetch("/api/replicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadedImage, questionnaire }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === "subscription_required") {
          await refreshSubscription();
          setPricingOpen(true);
          return;
        }
        throw new Error(data.error || "Generation failed");
      }
      const url: string = Array.isArray(data.output)
        ? data.output[data.output.length - 1]
        : data.output;
      if (!url) throw new Error("No output image returned");

      setOutputImage(url);

      // Save to history
      addEntry(url, uploadedImage, questionnaire);

      // Refresh usage count so sidebar trial counter updates immediately
      refreshSubscription();

      // Auto-download immediately
      triggerDownload(url);

      toast.success("Design generated & downloaded!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    uploadedImage,
    questionnaire,
    addEntry,
    subLoading,
    subscribed,
    trialRemaining,
    refreshSubscription,
  ]);

  return (
    <div className="space-y-6">
      <PlanNotActiveModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        hadTrial={hadTrial}
        onActivated={() => {
          setPricingOpen(false);
          refreshSubscription().then(() => handleGenerate());
        }}
      />

      {error && (
        <Alert
          variant="destructive"
          className="glass-panel text-foreground border-red-300/25 bg-red-500/10 shadow-[0_20px_50px_rgba(127,29,29,0.18)]"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass-panel-strong overflow-hidden rounded-[2rem] border-white/15">
        <CardHeader className="items-center pb-3 text-center">
          <div className="bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            AI Interior Studio
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Design your room — every detail, exactly as you want it
          </CardTitle>
          <p className="text-muted-foreground max-w-xl text-sm leading-6">
            Answer 6 quick steps to build a precise prompt. Your layout and
            structure will be preserved exactly.
          </p>
        </CardHeader>
        <CardContent>
          <DesignQuestionnaireForm
            value={questionnaire}
            onChange={setQuestionnaire}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            canGenerate={!!uploadedImage}
            trialExhausted={!subscribed && !trialRemaining}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel flex min-h-[420px] flex-col gap-3 rounded-[1.75rem] p-4 sm:p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Original Photo
          </h2>
          {uploadedImage ? (
            <UploadedImage src={uploadedImage} onRemove={handleRemoveImage} />
          ) : (
            <ImageDropzone
              onImageUpload={handleImageUpload}
              onError={handleError}
            />
          )}
        </div>

        <div className="glass-panel flex min-h-[420px] flex-col gap-3 rounded-[1.75rem] p-4 sm:p-5">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            AI Design
          </h2>
          <div className="flex-1">
            <OutputImage
              src={outputImage}
              isLoading={isLoading}
              subscribed={subscribed || subStatus === "trialing"}
            />
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="glass-panel rounded-[1.75rem] p-4 sm:p-6">
          <RenderGallery
            entries={history}
            onRemove={removeEntry}
            onClearAll={clearAll}
          />
        </div>
      )}
    </div>
  );
}

export default function RenderPage() {
  return (
    <Suspense>
      <SubscribedToast />
      <RenderPageInner />
    </Suspense>
  );
}
