import { createClient, FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js';
import { ENV } from '../config/env';

// Cliente Supabase para React Native
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// Função helper para invocar Edge Functions com melhor tratamento de erros
export async function invokeFunction<T = any>(
    functionName: string,
    body: Record<string, any>
): Promise<T> {
    console.log(`📡 Chamando Edge Function: ${functionName}`);
    console.log('📦 Payload:', JSON.stringify(body, null, 2));

    const { data, error } = await supabase.functions.invoke(functionName, {
        body,
    });

    if (error) {
        console.error(`❌ Erro ao invocar ${functionName}:`, error);

        // Tratamento detalhado de erros
        if (error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json();
            console.error('📋 Detalhes do erro HTTP:', errorMessage);
            throw new Error(errorMessage?.error || `Erro HTTP: ${JSON.stringify(errorMessage)}`);
        } else if (error instanceof FunctionsRelayError) {
            console.error('📋 Erro de relay:', error.message);
            throw new Error(`Erro de relay: ${error.message}`);
        } else if (error instanceof FunctionsFetchError) {
            console.error('📋 Erro de fetch:', error.message);
            throw new Error(`Erro de conexão: ${error.message}`);
        }

        throw new Error(error.message || 'Erro ao chamar função do Supabase');
    }

    console.log(`✅ Resposta recebida de ${functionName}`);
    return data as T;
}

