interface Props {
  title: string;
  children: React.ReactNode;
  visible: boolean;
  color?: "blue" | "amber" | "green" | "purple";
}

const colors = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  green: "bg-green-50 border-green-200 text-green-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

export default function ConceptCallout({
  title,
  children,
  visible,
  color = "blue",
}: Props) {
  if (!visible) return null;

  return (
    <div
      className={`
        rounded-xl border px-5 py-4 text-left
        transition-all duration-500 animate-in
        ${colors[color]}
      `}
    >
      <div className="font-semibold text-sm uppercase tracking-wide mb-1 opacity-70">
        {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
