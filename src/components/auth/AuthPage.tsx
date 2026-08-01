"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  GraduationCap,
  Building2,
  Rocket,
  Mail,
  Phone,
  MessageCircle,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";

type Role = "candidate" | "recruiter";
type EntityType = "institution" | "company" | "startup";
type Step = "form" | "verify" | "done";
type Channel = "email" | "whatsapp";

const ENTITY_META: Record<
  EntityType,
  { label: string; icon: React.ReactNode; nameLabel: string; placeholder: string }
> = {
  institution: {
    label: "Institution",
    icon: <GraduationCap className="w-5 h-5" />,
    nameLabel: "Institution name",
    placeholder: "e.g. Stanford University",
  },
  company: {
    label: "Company",
    icon: <Building2 className="w-5 h-5" />,
    nameLabel: "Company name",
    placeholder: "e.g. Acme Corp.",
  },
  startup: {
    label: "Startup",
    icon: <Rocket className="w-5 h-5" />,
    nameLabel: "Startup name",
    placeholder: "e.g. Nimbus Labs",
  },
};

export default function AuthPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("candidate");
  const [entity, setEntity] = useState<EntityType>("company");
  const [step, setStep] = useState<Step>("form");
  const [channel, setChannel] = useState<Channel>("email");
  const [orgOrUser, setOrgOrUser] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const destination =
    channel === "email"
      ? email || "your email"
      : phone
        ? `WhatsApp ${phone}`
        : "your WhatsApp";

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    setOtp(["", "", "", "", "", ""]);
    setStep("verify");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 700));
    setVerifying(false);
    setStep("done");
  }

  function setOtpAt(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`) as HTMLInputElement | null;
      el?.focus();
    }
  }

  function handleContinue() {
    if (role === "recruiter") {
      try {
        localStorage.setItem("recruiter.entity", entity);
        localStorage.setItem("recruiter.name", orgOrUser);
        localStorage.setItem("recruiter.email", email);
      } catch {}
      router.push("/recruiter");
    } else {
      router.push("/dashboard");
    }
  }

  const entityMeta = ENTITY_META[entity];

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-8 lg:py-12 overflow-y-auto">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-primary-foreground font-bold shadow-glow">
              L
            </div>
            <span className="text-xl font-bold tracking-tight text-ink">
              Let<span className="text-primary-glow">Get</span>In
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-ink-soft hover:text-ink transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0 flex-1">
          {step === "form" && (
            <>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Welcome to <span className="text-gradient-brand">LetGetIn</span>
              </h1>
              <p className="text-ink-soft mt-2">
                Get started — it's free. No credit card needed.
              </p>

              {/* Role toggle */}
              <div className="mt-8">
                <p className="text-sm font-medium text-ink mb-3">I am a…</p>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard
                    active={role === "candidate"}
                    onClick={() => setRole("candidate")}
                    icon={<User className="w-5 h-5" />}
                    label="Candidate"
                  />
                  <RoleCard
                    active={role === "recruiter"}
                    onClick={() => setRole("recruiter")}
                    icon={<Briefcase className="w-5 h-5" />}
                    label="Recruiter"
                  />
                </div>
              </div>

              {/* Entity type — only for recruiter */}
              {role === "recruiter" && (
                <div className="mt-6 animate-fade-up">
                  <p className="text-sm font-medium text-ink mb-3">
                    Register as
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ENTITY_META) as EntityType[]).map((k) => (
                      <RoleCard
                        key={k}
                        active={entity === k}
                        onClick={() => setEntity(k)}
                        icon={ENTITY_META[k].icon}
                        label={ENTITY_META[k].label}
                      />
                    ))}
                  </div>
                </div>
              )}

              <Divider label="CREATE YOUR ACCOUNT" />

              {/* Google — candidates only */}
              {role === "candidate" && (
                <>
                  <button
                    type="button"
                    onClick={() => alert("Google sign-in coming soon")}
                    className="w-full flex items-center justify-center gap-3 border border-border rounded-xl px-4 py-3 font-medium text-ink hover:border-primary-glow hover:bg-primary/[0.03] transition"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  <Divider label="OR" />
                </>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <Field
                  label={
                    role === "candidate" ? "Username" : entityMeta.nameLabel
                  }
                >
                  <input
                    value={orgOrUser}
                    onChange={(e) => setOrgOrUser(e.target.value)}
                    placeholder={
                      role === "candidate" ? "johndoe" : entityMeta.placeholder
                    }
                    className="input-base"
                  />
                </Field>

                {/* Channel switch */}
                <div>
                  <p className="text-sm font-medium text-ink mb-2">
                    {role === "recruiter" ? "Verify official contact via" : "Verify with"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-xl border border-border">
                    <ChannelTab
                      active={channel === "email"}
                      onClick={() => setChannel("email")}
                      icon={<Mail className="w-4 h-4" />}
                      label={role === "recruiter" ? "Official email" : "Email"}
                    />
                    <ChannelTab
                      active={channel === "whatsapp"}
                      onClick={() => setChannel("whatsapp")}
                      icon={<MessageCircle className="w-4 h-4" />}
                      label="WhatsApp OTP"
                    />
                  </div>
                </div>

                {channel === "email" ? (
                  <Field
                    label={
                      role === "recruiter"
                        ? "Official email address"
                        : "Email address"
                    }
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        role === "recruiter"
                          ? "you@yourcompany.com"
                          : "name@company.com"
                      }
                      className="input-base"
                    />
                  </Field>
                ) : (
                  <Field
                    label={
                      role === "recruiter"
                        ? "Official communication number (WhatsApp)"
                        : "Mobile number (WhatsApp)"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-border bg-white text-ink text-sm">
                        <Phone className="w-4 h-4 text-ink-soft" /> +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="input-base flex-1"
                      />
                    </div>
                  </Field>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Password">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Confirm password">
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className="input-base"
                    />
                  </Field>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gradient-brand text-primary-foreground font-semibold px-6 py-3.5 rounded-xl shadow-elegant hover:shadow-glow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending code…
                    </>
                  ) : (
                    <>Send verification code</>
                  )}
                </button>

                <p className="text-xs text-ink-soft text-center pt-1">
                  By continuing you agree to our{" "}
                  <a href="#" className="text-primary-glow hover:underline">
                    Terms
                  </a>{" "}
                  &{" "}
                  <a href="#" className="text-primary-glow hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </>
          )}

          {step === "verify" && (
            <div className="animate-fade-up">
              <button
                onClick={() => setStep("form")}
                className="text-sm text-ink-soft hover:text-ink flex items-center gap-1.5 mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7 text-primary-glow" />
              </div>
              <h1 className="text-3xl font-extrabold text-ink tracking-tight">
                Verify your {channel === "email" ? "email" : "WhatsApp"}
              </h1>
              <p className="text-ink-soft mt-2">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-ink">{destination}</span>.
              </p>

              <form onSubmit={handleVerify} className="mt-8 space-y-5">
                <div className="flex gap-2 sm:gap-3 justify-between">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => setOtpAt(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const el = document.getElementById(
                            `otp-${i - 1}`,
                          ) as HTMLInputElement | null;
                          el?.focus();
                        }
                      }}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border border-border bg-white focus:border-primary-glow focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full bg-gradient-brand text-primary-foreground font-semibold px-6 py-3.5 rounded-xl shadow-elegant hover:shadow-glow transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>Verify & continue</>
                  )}
                </button>

                <p className="text-sm text-ink-soft text-center">
                  Didn't get it?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="text-primary-glow font-medium hover:underline"
                  >
                    Resend or change {channel === "email" ? "email" : "number"}
                  </button>
                </p>
              </form>
            </div>
          )}

          {step === "done" && (
            <div className="animate-fade-up text-center py-10">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-extrabold text-ink tracking-tight">
                You're in! 🎉
              </h1>
              <p className="text-ink-soft mt-3 max-w-sm mx-auto">
                {role === "recruiter"
                  ? `Your ${entityMeta.label.toLowerCase()} account is verified. Next, tell us about your ${entityMeta.label.toLowerCase()}.`
                  : "Your account has been created and verified. Time to build your verified professional identity."}
              </p>
              <button
                onClick={handleContinue}
                className="inline-flex mt-8 bg-gradient-brand text-primary-foreground font-semibold px-8 py-3.5 rounded-xl shadow-elegant hover:shadow-glow transition"
              >
                {role === "recruiter"
                  ? `Continue to ${entityMeta.label.toLowerCase()} setup`
                  : "Go to dashboard"}
              </button>
            </div>
          )}

          <p className="text-sm text-ink-soft text-center mt-8">
            Already have an account?{" "}
            <a href="#" className="text-primary-glow font-semibold hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* RIGHT — brand panel */}
      <div className="hidden lg:flex relative bg-gradient-brand overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_left,white,transparent_60%)]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary-glow/40 blur-3xl" />

        <div className="relative max-w-md text-white">
          <div className="inline-flex items-center gap-2 text-xs font-semibold bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" />{" "}
            {role === "recruiter"
              ? "Hire verified talent, faster"
              : "Verified Professional Identity"}
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            {role === "recruiter" ? (
              <>Stop screening.<br />Start selecting.</>
            ) : (
              <>Stop claiming.<br />Start proving.</>
            )}
          </h2>
          <p className="mt-4 text-white/80 text-lg leading-relaxed">
            {role === "recruiter"
              ? "Access a pool of pre-verified candidates whose skills are proven — not just stated."
              : "Join 120,000+ professionals whose skills are verified — not just stated. Companies bid for talent here."}
          </p>

          <div className="mt-10 space-y-3">
            {(role === "recruiter"
              ? [
                  "Verified candidates across 6 dimensions",
                  "Bid on top talent — no more resume roulette",
                  "One dashboard for jobs, offers & applicants",
                ]
              : [
                  "Verified skills across 6 dimensions",
                  "Companies come to you with offers",
                  "Own your identity — portable & permanent",
                ]
            ).map((t) => (
              <div key={t} className="flex items-center gap-3 text-white/95">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-4 transition ${
        active
          ? "border-primary-glow bg-primary/[0.06] text-primary-glow shadow-sm"
          : "border-border bg-white text-ink-soft hover:border-primary-glow/40"
      }`}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          active ? "bg-primary/10" : "bg-surface"
        }`}
      >
        {icon}
      </span>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

function ChannelTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-white text-ink shadow-sm border border-border"
          : "text-ink-soft hover:text-ink"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs font-semibold tracking-wider text-ink-soft">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.9 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-2 13.2-5.2l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.4 0-9.9-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.7 5.1l6.1 5c-.4.4 6.8-5 6.8-14.1 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
