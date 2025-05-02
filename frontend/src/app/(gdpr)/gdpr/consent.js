// frontend/src/app/%28gdpr%29/gdpr/consent.js

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, consentData } = req.body;

    if (!userId || !consentData) {
      return res.status(400).json({ message: 'UserId y consentData son requeridos' });
    }

    // Simula guardar el consentimiento en la base de datos
    // (En producción, usa tu base de datos real)
    try {
      await saveConsentToDatabase(userId, consentData); // función para guardar en DB
      return res.status(200).json({ message: 'Consentimiento guardado correctamente' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al guardar consentimiento' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}

// Simula guardar en una base de datos
async function saveConsentToDatabase(userId, consentData) {
  // Lógica para guardar en tu base de datos
  console.log('Guardando consentimiento de usuario:', userId, consentData);
}


// Aquí puedes implementar la lógica para enviar preferencias al backend
const sendConsentData = async (consentData) => {
  const response = await fetch('/api/consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: 'usuario123', // Puede ser el ID del usuario si estás autenticado
      consentData: consentData,
    }),
  });
  const data = await response.json();
  if (data.message === 'Consentimiento guardado correctamente') {
    console.log('Consentimiento guardado correctamente');
  }
};

// Llamada a sendConsentData cuando el usuario acepta
sendConsentData({ ad_storage: 'granted', analytics_storage: 'denied' });
