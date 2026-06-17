'use client';

import { useFormStatus } from 'react-dom';

// Submit tlačidlo so stavom načítania — disablne sa počas pending server action.
export function SubmitButton({
  children,
  pendingLabel = 'Ukladám…',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
