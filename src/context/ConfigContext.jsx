import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api'

const ConfigContext = createContext({ whatsapp: '', empresaNombre: '', horario: '', envios: '' })

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({ whatsapp: '', empresaNombre: 'YA&DAI Software', horario: '', envios: '' })

  useEffect(() => {
    api.getConfig()
      .then(data => setConfig({
        whatsapp:      data.whatsapp_number || '',
        empresaNombre: data.empresa_nombre  || 'YA&DAI Software',
        horario:       data.horario         || 'Lunes a Sábado',
        envios:        data.envios          || 'Envíos a domicilio',
      }))
      .catch(() => {})
      .finally(() => window.hideSplash?.())
  }, [])

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
}

export function useConfig() { return useContext(ConfigContext) }
