interface VerifiedBadgeProps {
  verified: boolean;
  size?: "sm" | "md";
}

export function VerifiedBadge({ verified, size = "sm" }: VerifiedBadgeProps) {
  if (!verified) return null;
  const dim = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span
      className={`inline-flex items-center justify-center ${dim} rounded-full bg-blue-500 ml-1 flex-shrink-0`}
      aria-label="Verified account"
      title="Verified"
    >
      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}
