export default function GridBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]"
      style={{ backgroundSize: "40px 40px" }}
      aria-hidden
    />
  );
}
