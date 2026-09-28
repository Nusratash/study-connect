export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-1/3" />
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-40" />)}
      </div>
    </div>
  );
}
