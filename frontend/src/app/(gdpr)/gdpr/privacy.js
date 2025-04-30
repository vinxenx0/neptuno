// frontend/src/app/%28gdpr%29/gdpr/consent.js

import { NextApiRequest, NextApiResponse } from 'next'

// Simulando base de datos temporal
// En producción usarías un DB tipo PostgreSQL, MongoDB, etc.
let fakeConsentDB: { [userId: string]: any } = {}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      // Acceso: Devolver consentimiento del usuario
      const userId = req.query.userId as string
      const consentData = fakeConsentDB[userId]
      if (consentData) {
        return res.status(200).json({ consentData })
      } else {
        return res.status(404).json({ message: 'Consentimiento no encontrado.' })
      }

    case 'DELETE':
      // Derecho al olvido: Borrar consentimiento
      const userIdToDelete = req.query.userId as string
      delete fakeConsentDB[userIdToDelete]
      return res.status(200).json({ message: 'Consentimiento eliminado.' })

    default:
      res.setHeader('Allow', ['GET', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
