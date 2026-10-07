export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Super Benfica. Todos os direitos reservados.</p>
        <p>Seus dados são tratados conforme a LGPD e usados apenas para processar seus pedidos.</p>
      </div>
    </footer>
  );
}
