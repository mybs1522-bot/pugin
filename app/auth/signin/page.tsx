"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import OnboardCard from "@/components/ui/onboard-card";

const CanvasRevealEffect = dynamic(
  () =>
    import("@/components/ui/canvas-reveal").then((m) => ({
      default: m.CanvasRevealEffect,
    })),
  { ssr: false, loading: () => null }
);

const LOADER_DURATION = 3000;

export default function SignInPage() {
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFading, setLoaderFading] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [reverseCanvas, setReverseCanvas] = useState(false);
  const [showCanvas, setShowCanvas] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Loader timing ── */
  useEffect(() => {
    const fadeTimer = setTimeout(
      () => setLoaderFading(true),
      LOADER_DURATION + 400
    );
    const hideTimer = setTimeout(
      () => setShowLoader(false),
      LOADER_DURATION + 900
    );
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step === "otp") setTimeout(() => codeRefs.current[0]?.focus(), 400);
  }, [step]);

  /* ── Send OTP ── */
  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/otp-send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(body.detail ?? "Could not send code. Try again.");
      return;
    }
    setOtpToken(body.token);
    setStep("otp");
  };

  /* ── Verify OTP ── */
  const verifyOTP = async (enteredCode: string) => {
    setError("");
    setLoading(true);
    const { signIn } = await import("next-auth/react");
    const result = await signIn("otp", {
      email,
      code: enteredCode,
      token: otpToken,
      redirect: false,
      callbackUrl: "/render",
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid or expired code. Try again.");
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => codeRefs.current[0]?.focus(), 50);
      return;
    }
    setReverseCanvas(true);
    setTimeout(() => setShowCanvas(false), 50);
    setStep("success");
    setTimeout(() => {
      window.location.href = result?.url ?? "/render";
    }, 1800);
  };

  /* ── Code input handlers ── */
  const handleCodeChange = async (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[index] = value.replace(/\D/, "");
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
    if (index === 5 && value && next.every((d) => d.length === 1)) {
      await verifyOTP(next.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const goBack = () => {
    setStep("email");
    setOtpToken("");
    setError("");
    setCode(["", "", "", "", "", ""]);
    setReverseCanvas(false);
    setShowCanvas(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      {/* ── Loader screen (white bg) ── */}
      <AnimatePresence>
        {showLoader && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: loaderFading ? 0 : 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <Image
                src="/v6-logo.png"
                alt="V6 Render"
                width={36}
                height={24}
                className="h-8 w-auto object-contain"
                priority
              />
              <span className="text-base font-extrabold tracking-tight text-gray-900">
                V6 Render
              </span>
            </div>
            <OnboardCard
              duration={LOADER_DURATION}
              step1="Loading Assets"
              step2="Preparing Workspace"
              step3="Almost Ready"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WebGL dot matrix background (black dots on white) ── */}
      <div className="absolute inset-0 z-0">
        {showCanvas && (
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-white"
            colors={[
              [0, 0, 0],
              [0, 0, 0],
            ]}
            dotSize={5}
            showGradient={false}
            reverse={false}
          />
        )}
        {reverseCanvas && (
          <CanvasRevealEffect
            animationSpeed={4}
            containerClassName="bg-white"
            colors={[
              [0, 0, 0],
              [0, 0, 0],
            ]}
            dotSize={5}
            showGradient={false}
            reverse={true}
          />
        )}
        {/* White radial vignette — keeps centre clean */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.88)_0%,transparent_72%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ── Brand mark ── */}
      <div className="relative z-10 flex items-center justify-center gap-2.5 pt-10">
        <Image
          src="/v6-logo.png"
          alt="V6 Render"
          width={40}
          height={27}
          className="h-9 w-auto object-contain"
          priority
        />
        <span className="text-base font-extrabold tracking-tight text-gray-900">
          V6 Render
        </span>
      </div>

      {/* ── Main form ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {/* Email step */}
            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-7 text-center"
              >
                <div>
                  <h1 className="text-[2.2rem] leading-tight font-bold tracking-tight text-gray-900">
                    Welcome back
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Sign in to generate photorealistic renders
                  </p>
                </div>

                <form onSubmit={sendOTP} className="space-y-3">
                  <div className="relative">
                    <input
                      ref={emailRef}
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-full border border-gray-200 bg-white/70 px-5 py-3.5 text-center text-gray-900 shadow-sm backdrop-blur placeholder:text-gray-400 focus:border-gray-400 focus:outline-none disabled:opacity-50"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <span className="text-base leading-none">→</span>
                      )}
                    </button>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </form>

                <p className="text-xs text-gray-400">
                  By continuing you agree to our{" "}
                  <Link
                    href="#"
                    className="underline transition-colors hover:text-gray-700"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="underline transition-colors hover:text-gray-700"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </motion.div>
            )}

            {/* OTP step */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6 text-center"
              >
                <div>
                  <h1 className="text-[2.2rem] leading-tight font-bold tracking-tight text-gray-900">
                    Check your inbox
                  </h1>
                  <p className="mt-1 text-gray-500">
                    Code sent to{" "}
                    <span className="font-medium text-gray-800">{email}</span>
                  </p>
                </div>

                {/* Inline 6-box code input */}
                <div className="rounded-full border border-gray-200 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-center">
                    {code.map((digit, i) => (
                      <div key={i} className="flex items-center">
                        <div className="relative">
                          <input
                            ref={(el) => {
                              codeRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleCodeChange(i, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            disabled={loading}
                            className="w-9 appearance-none border-none bg-transparent text-center text-xl font-semibold text-gray-900 focus:outline-none disabled:opacity-40"
                            style={{ caretColor: "transparent" }}
                          />
                          {!digit && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="text-xl text-gray-300">·</span>
                            </div>
                          )}
                        </div>
                        {i < 5 && (
                          <span className="text-lg text-gray-200">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}

                {loading && (
                  <p className="animate-pulse text-sm text-gray-400">
                    Verifying…
                  </p>
                )}

                <p
                  onClick={goBack}
                  className="cursor-pointer text-sm text-gray-400 transition-colors hover:text-gray-700"
                >
                  Resend code
                </p>

                <button
                  onClick={goBack}
                  className="flex w-full items-center justify-center gap-1.5 text-xs text-gray-300 transition-colors hover:text-gray-600"
                >
                  <ArrowLeft className="h-3 w-3" /> Use a different email
                </button>
              </motion.div>
            )}

            {/* Success step */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-6 text-center"
              >
                <h1 className="text-[2.2rem] leading-tight font-bold tracking-tight text-gray-900">
                  You&apos;re in!
                </h1>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500"
                >
                  Redirecting to your workspace…
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
