/**
 * Domain types for the Agent Markdown Network Builder.
 *
 * The pipeline is a *compiler*, not a free-form multi-file text generator:
 *   brief -> extraction -> CanonicalAgentManifest -> file proposals ->
 *   user approval -> runtime adapters -> deterministic render -> checks -> repair -> download
 */

/** Truth markers used across extraction, manifest and report surfaces. */
export type MarkerKind = "MISSING" | "ASSUMPTION" | "SOURCE_NEEDED" | "UNVERIFIED" | "BLOCKER";

export interface TruthMarker {
  kind: MarkerKind;
  /** Canonical manifest field or subsystem the marker belongs to. */
  field: string;
  /** Plain language, no jargon on the first level. */
  message: string;
}

export type Autonomy = "read-only" | "suggest" | "write-with-approval" | "autonomous";

export interface ToolSpec {
  name: string;
  purpose: string;
  /** "lesen" | "schreiben" | "ausführen" | "netzwerk" */
  access: "lesen" | "schreiben" | "ausführen" | "netzwerk";
  guard: string;
}

/** The single source of truth every renderer reads from. */
export interface AgentManifest {
  id: string;
  name: string;
  slug: string;
  purpose: string;
  brief: string;
  domain: DomainKey;
  domainLabel: string;
  stack: string[];
  capabilities: string[];
  prohibitions: string[];
  inputs: string[];
  outputs: string[];
  qualityBars: string[];
  dimensions: string[];
  escalations: string[];
  tools: ToolSpec[];
  autonomy: Autonomy;
  tone: string;
  cadence: string[];
  targets: RuntimeId[];
  provider: ProviderId;
  model: string;
  createdAt: string;
  confidence: number;
  markers: TruthMarker[];
}

export type DomainKey =
  | "code-review"
  | "research"
  | "support"
  | "data"
  | "writing"
  | "ops"
  | "generic";

export type RuntimeId =
  | "claude-code"
  | "codex-cli"
  | "cursor"
  | "copilot"
  | "windsurf"
  | "portable";

export interface Runtime {
  id: RuntimeId;
  name: string;
  /** One plain sentence, no jargon. */
  blurb: string;
  glyph: string;
  /** Entry file the runtime actually reads on its own. */
  entryFile: string;
  /** Does the runtime load SOUL.md / HEARTBEAT.md by itself? */
  loadsSoulNatively: boolean;
  /** Plain sentence shown when loadsSoulNatively === false. */
  nativeNote: string;
}

export type ProviderId = "anthropic" | "openai" | "google" | "mistral" | "local";

export interface Provider {
  id: ProviderId;
  name: string;
  blurb: string;
  glyph: string;
  accent: string;
  models: ModelOption[];
}

export interface ModelOption {
  id: string;
  name: string;
  blurb: string;
  strength: string;
}

export type FileKind =
  | "soul"
  | "heartbeat"
  | "agents"
  | "system-prompt"
  | "tools"
  | "standard"
  | "guardrails"
  | "evaluation"
  | "runtime"
  | "manifest"
  | "report";

export interface FileBlueprint {
  id: string;
  kind: FileKind;
  path: string;
  title: string;
  /** Plain language purpose for the tile. */
  blurb: string;
  /** Always included, cannot be switched off. */
  locked: boolean;
  /** Preselected in the proposal step. */
  proposed: boolean;
  /** Runtime this file belongs to (runtime adapter output). */
  runtime?: RuntimeId;
  /** Files this file references — used by the link checker. */
  references: string[];
}

export interface GeneratedFile extends FileBlueprint {
  content: string;
  bytes: number;
  lines: number;
  /** True when the target runtime does not load this file by itself. */
  notNativelyLoaded: boolean;
}

export type FindingSeverity = "blocker" | "conflict" | "gap" | "note";

export interface Finding {
  id: string;
  severity: FindingSeverity;
  /** Plain language headline — readable without technical background. */
  title: string;
  detail: string;
  /** Which files are affected. */
  files: string[];
  marker: MarkerKind;
  /** Label of the targeted repair, null when only a human can decide. */
  repairLabel: string | null;
  repair?: RepairAction;
}

export type RepairAction =
  | { type: "add-prohibition"; value: string }
  | { type: "add-quality-bar"; value: string }
  | { type: "add-escalation"; value: string }
  | { type: "downgrade-autonomy"; value: Autonomy }
  | { type: "add-file"; value: string }
  | { type: "add-output"; value: string }
  | { type: "add-tool-guard"; value: string };

export interface CheckReport {
  deterministic: Finding[];
  semantic: Finding[];
  passed: string[];
  score: number;
}

export type StepId = "brief" | "targets" | "engine" | "files" | "build" | "result";
