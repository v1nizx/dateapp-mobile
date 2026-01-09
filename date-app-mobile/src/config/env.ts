// Configuração das variáveis de ambiente do Supabase e Perplexity
// Para produção, considere usar expo-constants ou react-native-dotenv

export const ENV = {
    SUPABASE_URL: 'https://tfraboksyrwwuglxrzvh.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcmFib2tzeXJ3d3VnbHhyenZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMjMxOTcsImV4cCI6MjA3NTg5OTE5N30.g89m7ZyIc2V9jNYiJxP5GFXBH8_bqggkTlfp6hI92KE',
    // Nota: A chave do Perplexity deve estar configurada na Edge Function do Supabase
    // não no app mobile (por segurança)
};
