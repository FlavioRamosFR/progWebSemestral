
'use client'

import { LogOutIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/componentes/ui/alert-dialog"

import { Button } from "@/app/componentes/ui/button"

export function AlertDialogLogout() {

  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/logout`,
        {
          method: 'POST',
          credentials: 'include',
        }
      )

      if (!res.ok) {
        throw new Error('Não foi possível encerrar a sessão.')
      }

      router.replace('/login')
      router.refresh()

    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className="mb-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold text-slate-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
          >
            <LogOutIcon
              size={20}
              strokeWidth={1.9}
              className="shrink-0"
            />
            Sair
          </button>
        }
      />

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <LogOutIcon />
          </AlertDialogMedia>

          <AlertDialogTitle>
            Deseja sair da aplicação?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Tem certeza de que deseja encerrar sua sessão?
            Você precisará fazer login novamente para acessar
            o sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            onClick={handleLogout}
          >
            Sim, sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
