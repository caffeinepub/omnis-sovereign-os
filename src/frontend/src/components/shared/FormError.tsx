interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      data-ocid="form.error_state"
      className="mt-1 text-xs text-destructive"
      role="alert"
    >
      {message}
    </p>
  );
}
