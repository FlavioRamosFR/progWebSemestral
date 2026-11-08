
import { AlertCircle,LockKeyhole,CreditCard,ShieldAlert,SearchX,ServerCrash, type LucideIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import ErrorPage from '@/app/componentes/ErrorPage'; 

interface ErroConfig {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  icon: LucideIcon;
  tone: 'amber' | 'blue' | 'red';
}

// Configurações das páginas de erro
const erros: Record<string, ErroConfig> = {
  '400': {
    eyebrow: 'Erro de requisição',
    title: 'Solicitação inválida',
    description:
      'Não foi possível processar sua solicitação. Os dados enviados podem estar incorretos ou incompletos. Verifique as informações e tente novamente.',
    status: '400 — Bad Request',
    icon: AlertCircle,
    tone: 'amber',
  },

  '401': {
    eyebrow: 'Autenticação necessária',
    title: 'Acesso não autenticado',
    description:
      'Você precisa estar autenticado para acessar este recurso. Sua sessão pode ter expirado. Faça login novamente para continuar.',
    status: '401 — Unauthorized',
    icon: LockKeyhole,
    tone: 'blue',
  },

  '402': {
    eyebrow: 'Pagamento necessário',
    title: 'Pagamento necessário',
    description:
      'O acesso a este recurso exige uma condição de pagamento. Verifique as informações da sua conta ou entre em contato com o administrador.',
    status: '402 — Payment Required',
    icon: CreditCard,
    tone: 'amber',
  },

  '403': {
    eyebrow: 'Acesso proibido',
    title: 'Você não tem permissão',
    description:
      'Sua solicitação foi compreendida, mas você não possui autorização para acessar este recurso.',
    status: '403 — Forbidden',
    icon: ShieldAlert,
    tone: 'red',
  },

  '404': {
    eyebrow: 'Página não encontrada',
    title: 'Ops! Não encontramos essa página.',
    description:
      'A página que você está tentando acessar não existe, foi removida ou está temporariamente indisponível.',
    status: '404 — Not Found',
    icon: SearchX,
    tone: 'amber',
  },

  '500': {
    eyebrow: 'Erro interno do servidor',
    title: 'Algo deu errado!',
    description:
      'Ocorreu um problema inesperado ao processar sua solicitação. Nossa equipe precisa verificar o ocorrido. Tente novamente mais tarde.',
    status: '500 — Internal Server Error',
    icon: ServerCrash,
    tone: 'red',
  },
};

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function ErrorCodePage({ params }: PageProps) {
  // Recupera o código informado na URL
  const { code } = await params;

  // Procura a configuração correspondente
  const erro = erros[code];

  // Se o código não existir, apresenta o 404 do Next.js
  if (!erro) {
    notFound();
  }

  return (
    <ErrorPage
      code={code}
      {...erro}
    />
  );
}
