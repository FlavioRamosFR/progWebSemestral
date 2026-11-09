import { NextResponse } from "next/server";
import { singToken } from "@/lib/auth";

export async function POST(resquest: Request) {
    try {
        const { username, password } = await resquest.json()

        if (username === 'admin@admin.br' && password === '1234') {
            const token = await singToken({ username });
            const response = NextResponse.json({ success: token });
            // Salva o token em un Cookie HTTP-only (seguro contra ataques XSS)
            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 2, // 2 horas
                path: '/',
            });
            return response;
        }
        return NextResponse.json(
            {error: 'Credenciais invalidas'},
            {status: 401}
        )
    }catch (erros){
        return NextResponse.json(
            {error:'Erro interno do servidor'},
            {status: 500}
        )
    }
}