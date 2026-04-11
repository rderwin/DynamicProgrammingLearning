interface Props {
  title: string;
  children: React.ReactNode;
  visible: boolean;
  color?: "blue" | "amber" | "green" | "purple";
}

const styles = {
  blue: {
    bg: "bg-blue-50/80 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    accent: "bg-blue-500",
    title: "text-blue-700 dark:text-blue-400",
    text: "text-blue-800 dark:text-blue-300",
  },
  amber: {
    bg: "bg-amber-50/80 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    accent: "bg-amber-500",
    title: "text-amber-700 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
  },
  green: {
    bg: "bg-green-50/80 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    accent: "bg-green-500",
    title: "text-green-700 dark:text-green-400",
    text: "text-green-800 dark:text-green-300",
  },
  purple: {
    bg: "bg-purple-50/80 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    accent: "bg-purple-500",
    title: "text-purple-700 dark:text-purple-400",
    text: "text-purple-800 dark:text-purple-300",
  },
};

const icons = {
  blue: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  amber: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
    </svg>
  ),
  green: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  purple: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
    </svg>
  ),
};

export default function ConceptCallout({
  title,
  children,
  visible,
  color = "blue",
}: Props) {
  if (!visible) return null;

  const s = styles[color];

  return (
    <div
      className={`
        rounded-xl border px-5 py-4 text-left
        animate-fade-in-up
        ${s.bg} ${s.border}
      `}
    >
      <div className={`flex items-center gap-2 mb-2 ${s.title}`}>
        {icons[color]}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className={`text-sm leading-relaxed ${s.text}`}>{children}</div>
    </div>
  );
}
