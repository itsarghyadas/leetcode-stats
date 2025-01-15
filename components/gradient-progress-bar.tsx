export default function GradientProgressBar({
  value,
  className,
  gradientFrom,
  gradientTo,
}: {
  value: number;
  className?: string;
  gradientFrom: string;
  gradientTo: string;
}): JSX.Element {
  return (
    <div className={`h-1.5 w-full bg-zinc-700 rounded-full ${className || ''}`}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${value}%`,
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          boxShadow: `0 0 10px -5px ${gradientFrom}, 0 0 10px -3px ${gradientTo}`,
        }}
      />
    </div>
  );
}
