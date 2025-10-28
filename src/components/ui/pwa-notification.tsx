import React from 'react'
import { usePWA } from '../../hooks/usePWA'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, RefreshCw, Wifi, WifiOff, X } from 'lucide-react'

export const PWANotification: React.FC = () => {
  const { isOnline, needRefresh, updateApp, setNeedRefresh } = usePWA()

  if (!needRefresh && isOnline) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isOnline ? (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <CardTitle className="text-sm">Offline</CardTitle>
                  </>
                ) : needRefresh ? (
                  <>
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">Atualização Disponível</CardTitle>
                  </>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setNeedRefresh(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {!isOnline ? (
              <div className="space-y-2">
                <CardDescription>
                  Você está offline. Algumas funcionalidades podem estar limitadas.
                </CardDescription>
                <Badge variant="secondary" className="text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Sem conexão
                </Badge>
              </div>
            ) : needRefresh ? (
              <div className="space-y-3">
                <CardDescription>
                  Uma nova versão do dashboard está disponível. Atualize para ter acesso às últimas funcionalidades.
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    onClick={updateApp}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Atualizar Agora
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNeedRefresh(false)}
                  >
                    Depois
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}















