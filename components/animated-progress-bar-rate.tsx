import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";

export default function AnimatedCircularProgressBarRate({
  acceptanceRate,
}: {
  acceptanceRate: number;
}) {
  return (
    <AnimatedCircularProgressBar
      max={100}
      min={0}
      value={acceptanceRate}
      gaugePrimaryColor="#FFD700" // Changed to golden color
      gaugeSecondaryColor="#FFFFFF"
      className="w-28 h-28 text-white text-lg"
    />
  );
}
