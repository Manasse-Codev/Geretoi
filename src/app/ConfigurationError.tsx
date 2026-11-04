type ConfigurationErrorProps = { missingVariables: string[] };

export function ConfigurationError({ missingVariables }: ConfigurationErrorProps) {
  return (
    <main className="auth-loading" role="alert" aria-labelledby="configuration-error-title">
      <section>
        <h1 id="configuration-error-title">Configuration manquante</h1>
        <p>Ajoutez ces variables de configuration :</p>
        <ul>{missingVariables.map((name) => <li key={name}>{name}</li>)}</ul>
      </section>
    </main>
  );
}
