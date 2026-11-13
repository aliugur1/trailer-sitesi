'use client';
export default function PrintButton({ label }: { label: string }) {
  return <button className="btn ghost" type="button" onClick={() => print()}>{label}</button>;
}
