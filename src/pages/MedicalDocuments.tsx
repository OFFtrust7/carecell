import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileText, Trash2, Download, FlaskConical, Pill, Image as ImageIcon, FileWarning } from "lucide-react";
import { format } from "date-fns";
import PageTransition from "@/components/premium/PageTransition";
import GradientHeading from "@/components/premium/GradientHeading";
import GlassCard from "@/components/premium/GlassCard";
import GlowButton from "@/components/premium/GlowButton";
import PremiumInput from "@/components/premium/PremiumInput";
import EmptyState from "@/components/premium/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TYPE_META: Record<string, { icon: any; label: string }> = {
  lab_report:        { icon: FlaskConical, label: "Lab Report" },
  prescription:      { icon: Pill,         label: "Prescription" },
  scan:              { icon: ImageIcon,    label: "Scan" },
  discharge_summary: { icon: FileText,     label: "Discharge Summary" },
  other:             { icon: FileText,     label: "Other" },
};

export default function MedicalDocumentsPage() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [meta, setMeta] = useState({ doc_type: "lab_report", title: "", notes: "", document_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("medical_documents" as any)
      .select("*")
      .eq("patient_id", user.id)
      .order("document_date", { ascending: false });
    setDocs((data as any[]) || []);
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!meta.title) return toast.error("Please add a title first");
    if (file.size > 10 * 1024 * 1024) return toast.error("File must be under 10MB");

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("medical-documents").upload(path, file);
      if (upErr) throw upErr;

      const { error: dbErr } = await supabase.from("medical_documents" as any).insert({
        patient_id: user.id,
        uploaded_by: user.id,
        doc_type: meta.doc_type,
        title: meta.title,
        notes: meta.notes || null,
        file_path: path,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type,
        document_date: meta.document_date,
      } as any);
      if (dbErr) throw dbErr;

      toast.success("Document uploaded");
      setMeta({ ...meta, title: "", notes: "" });
      load();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = async (path: string, title: string) => {
    const { data, error } = await supabase.storage.from("medical-documents").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Could not get file");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = title;
    a.target = "_blank";
    a.click();
  };

  const remove = async (id: string, path: string) => {
    await supabase.storage.from("medical-documents").remove([path]);
    await supabase.from("medical_documents" as any).delete().eq("id", id);
    load();
  };

  return (
    <PageTransition className="space-y-6">
      <GradientHeading subtitle="Securely store lab reports, prescriptions and scans. Visible only to you and your caregivers.">
        Medical Documents
      </GradientHeading>

      <GlassCard className="p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Document Type</label>
            <Select value={meta.doc_type} onValueChange={(v) => setMeta({ ...meta, doc_type: v })}>
              <SelectTrigger className="glass border-border rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-strong border-border/50">
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PremiumInput label="Document Date" type="date" value={meta.document_date}
            onChange={(e) => setMeta({ ...meta, document_date: e.target.value })} />
        </div>
        <PremiumInput label="Title" value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. CBC Blood Test - April 2026" />
        <PremiumInput label="Notes (optional)" value={meta.notes}
          onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />

        <input ref={inputRef} type="file" onChange={upload} accept="image/*,.pdf,.doc,.docx" className="hidden" />
        <GlowButton onClick={() => inputRef.current?.click()} disabled={uploading || !meta.title} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Uploading..." : "Choose & Upload File"}
        </GlowButton>
        <p className="text-xs text-muted-foreground text-center">PDF, image, or doc — up to 10MB</p>
      </GlassCard>

      {docs.length === 0 ? (
        <GlassCard className="p-4">
          <EmptyState icon={FileWarning} title="No documents yet" description="Upload your first lab report or prescription above." />
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {docs.map((d) => {
            const Icon = TYPE_META[d.doc_type]?.icon || FileText;
            return (
              <GlassCard key={d.id} className="p-4 flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-mint" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">{d.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] border-border/50">{TYPE_META[d.doc_type]?.label}</Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {d.document_date && format(new Date(d.document_date), "MMM d, yyyy")}
                      {d.file_size_kb && ` • ${d.file_size_kb} KB`}
                    </span>
                  </div>
                  {d.notes && <p className="text-xs text-muted-foreground mt-1">{d.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => download(d.file_path, d.title)} className="p-1.5 rounded-lg text-mint hover:bg-mint/10" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(d.id, d.file_path)} className="p-1.5 rounded-lg text-muted-foreground hover:text-critical hover:bg-critical/10" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
