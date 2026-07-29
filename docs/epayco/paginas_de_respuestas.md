---
title: "Páginas de Respuesta y Confirmación"
slug: "checkout-respuesta-y-confirmacion"
updated: 2025-10-30T15:54:52Z
published: 2025-10-30T15:54:52Z
canonical: "docs.epayco.com/checkout-respuesta-y-confirmacion"
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.epayco.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Páginas de Respuesta y Confirmación

ePayco proporciona dos mecanismos para notificar el resultado de una transacción: la **página de respuesta** y la **URL de confirmación** (webhook). Es importante entender la diferencia entre ambas y cómo implementarlas correctamente.

## Página de Respuesta (`response` )

La página de respuesta es la URL a la que se redirige al usuario **después de completar el proceso de pago** en **ePayco Smart Checkout**. Esta redirección ocurre en el navegador del cliente y contiene información básica sobre la transacción en los parámetros de la URL.

#### **Características:**

- ✅ Redirección visible para el usuario

- ✅ Permite mostrar una página de respuesta personalizada

- ✅ Incluye el parámetro `ref_payco` en la URL para consultar datos de la transacción

- ⚠️ **NO es confiable** para validar el estado final de la transacción (el usuario puede cerrar el navegador o perder conexión)

- ⚠️ Los parámetros pueden ser manipulados por el usuario

### Comportamiento de redirección:

1. **Con URL personalizada**: Si se configura una URL de respuesta personalizada, el usuario será redirigido a esa URL con el parámetro `ref_payco` que permite consultar los datos de la transacción.

2. **Sin URL personalizada**: Si no se configura una URL de respuesta, **ePayco** redirige a una página predeterminada que permite al usuario imprimir y reenviar el comprobante de la transacción.

**Ejemplo de URL de redirección:**

```plaintext
https://mitienda.com/resultado-pago?ref_payco=68fb83729d094878e015be00
```

**Para obtener los atributos que se envían en la página de respuesta dinámica deberás hacer un llamado mediante el siguiente endpoint:**

```bash
curl --location --request GET 'https://secure.epayco.co/validation/v1/reference/68fb83729d094878e015be00' \
--header 'Content-Type: application/json'
```

## URL de Confirmación (`confirmation` ) - Webhook

La URL de confirmación es un **webhook** que ePayco invoca en tu servidor backend cuando el estado de una transacción cambia. Esta es la forma **confiable y segura** de validar el resultado final de una transacción.

**Características:**

- ✅ **Confiable**: Comunicación servidor a servidor

- ✅ Invocado automáticamente por ePayco

- ✅ Puede reintentar en caso de fallo

- ✅ Incluye firma de seguridad para validar autenticidad

- ⚠️ Debe responder con código HTTP 200 para confirmar recepción

#### Parámetros recibidos:

#### **Parámetros recibidos (método GET o POST):**

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| ref_payco | string | Referencia única de la transacción en ePayco |
| x_cust_id_cliente | string | ID del cliente |
| x_ref_payco | string | Referencia de pago de ePayco |
| x_id_invoice | string | ID de la factura o invoice |
| x_description | string | Descripción del producto o servicio |
| x_amount | string | Monto de la transacción |
| x_amount_country | string | Monto en moneda del país |
| x_amount_ok | string | Monto aprobado |
| x_tax | string | Valor del impuesto |
| x_amount_base | string | Base del impuesto |
| x_currency_code | string | Código de la moneda |
| x_transaction_id | string | ID de la transacción |
| x_response | string | Código de respuesta `Aceptada`, `Rechazada`, `Pendiente`, `Fallida`) |
| x_approval_code | string | Código de aprobación de la transacción |
| x_response_reason_text | string | Texto descriptivo de la respuesta |
| x_transaction_date | string | Fecha de la transacción |
| x_transaction_state | string | Estado de la transacción |
| x_franchise | string | Franquicia o método de pago utilizado |
| x_business | string | Nombre del comercio |
| x_customer_doctype | string | Tipo de documento del cliente |
| x_customer_document | string | Número de documento del cliente |
| x_customer_name | string | Nombre del cliente |
| x_customer_lastname | string | Apellido del cliente |
| x_customer_email | string | Email del cliente |
| x_customer_phone | string | Teléfono del cliente |
| x_customer_country | string | País del cliente |
| x_customer_city | string | Ciudad del cliente |
| x_customer_address | string | Dirección del cliente |
| x_customer_ip | string | IP del cliente |
| x_signature | string | Firma de seguridad para validar la autenticidad |
| x_test_request | string | Indica si es transacción de prueba `true` o `false`) |
| `x_extra1` - `x_extra10` | string | Campos personalizados enviados en la petición inicial |

#### Ejemplo de implementación:

POSTGET

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post('api/webhook/epayco/confirmation', async (req, res) => {
  try {
    const {
      ref_payco,
      x_ref_payco,
      x_transaction_id,
      x_response,
      x_response_reason_text,
      x_amount,
      x_currency_code,
      x_franchise,
      x_signature,
      x_test_request,
      x_approval_code,
      x_transaction_date,
      x_transaction_state,
      x_customer_email,
      x_customer_name,
      x_extra1,
      x_extra2
    } = req.body;
    // 1. Validar firma de seguridad
    const p_cust_id_cliente = process.env.EPAYCO_CUSTOMER_ID;
    const p_key = process.env.EPAYCO_P_KEY;
    const signature = crypto
      .createHash('sha256')
      .update(`${p_cust_id_cliente}^${p_key}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`)
      .digest('hex');
    if (signature !== x_signature) {
      console.error('Firma inválida - posible intento de fraude');
      return res.status(400).send('Invalid signature');
    }
    // 2. Validar que no sea transacción duplicada
    const existingTransaction = await checkTransactionExists(x_transaction_id);
    if (existingTransaction) {
      console.log('Transacción ya procesada:', x_transaction_id);
      return res.status(200).send('OK');
    }
    // 3. Procesar según el estado de la transacción
    switch (x_response) {
      case 'Aceptada':
        await processApprovedTransaction({
          refPayco: ref_payco,
          transactionId: x_transaction_id,
          amount: x_amount,
          currency: x_currency_code,
          customerEmail: x_customer_email,
          customerName: x_customer_name,
          franchise: x_franchise,
          approvalCode: x_approval_code,
          transactionDate: x_transaction_date
        });
        break;
      case 'Rechazada':
        await processRejectedTransaction({
          refPayco: ref_payco,
          transactionId: x_transaction_id,
          reason: x_response_reason_text
        });
        break;
      case 'Pendiente':
        await processPendingTransaction({
          refPayco: ref_payco,
          transactionId: x_transaction_id
        });
        break;
      case 'Fallida':
        await processFailedTransaction({
          refPayco: ref_payco,
          transactionId: x_transaction_id,
          reason: x_response_reason_text
        });
        break;
    }
    // 4. Responder con 200 OK para confirmar recepción
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error procesando webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Funciones auxiliares
async function checkTransactionExists(transactionId) {
  // Implementar consulta a tu base de datos
  return false;
}
async function processApprovedTransaction(data) {
  // Actualizar orden como pagada
  // Enviar email de confirmación
  // Activar servicios/productos
  console.log('Transacción aprobada:', data);
}
async function processRejectedTransaction(data) {
  // Actualizar orden como rechazada
  // Notificar al usuario
  console.log('Transacción rechazada:', data);
}
async function processPendingTransaction(data) {
  // Marcar orden como pendiente
  // Programar verificación posterior
  console.log('Transacción pendiente:', data);
}
async function processFailedTransaction(data) {
  // Manejar transacción fallida
  console.log('Transacción fallida:', data);
}
app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

```javascript
// Página de respuesta (response.html)
const urlParams = new URLSearchParams(window.location.search);
const transactionData = {
  refPayco: urlParams.get('ref_payco'),
  response: urlParams.get('x_response'),
  transactionId: urlParams.get('x_transaction_id'),
  amount: urlParams.get('x_amount'),
  currency: urlParams.get('x_currency_code'),
  franchise: urlParams.get('x_franchise'),
  approvalCode: urlParams.get('x_approval_code'),
  responseReason: urlParams.get('x_response_reason_text')
};
// Mostrar resultado al usuario
if (transactionData.response === 'Aceptada') {
  showSuccessMessage(transactionData);
} else if (transactionData.response === 'Rechazada') {
  showErrorMessage(transactionData);
} else if (transactionData.response === 'Pendiente') {
  showPendingMessage(transactionData);
}
// ⚠️ IMPORTANTE: NO confíes solo en esta respuesta
// Siempre valida el estado final en tu backend usando el webhook
```

### Validación de Firma de Seguridad

La firma de seguridad `x_signature` permite verificar que la petición proviene realmente de ePayco y no ha sido manipulada.

#### Fórmula para calcular la firma:

**Parámetros necesarios:**

- `p_cust_id_cliente`: Tu Customer ID de ePayco (obtenido del dashboard)

- `p_key`: Tu P_KEY de ePayco (obtenido del dashboard)

- `^`: Carácter separador literal

```bash
SHA256(p_cust_id_cliente^p_key^x_ref_payco^x_transaction_id^x_amount^x_currency_code)
```

#### Ejemplo en diferentes lenguajes:

JavaScript/Node.jsPHPPython

```javascript
const crypto = require('crypto');
function validateSignature(data, customerID, pKey) {
  const signature = crypto
    .createHash('sha256')
    .update(`${customerID}^${pKey}^${data.x_ref_payco}^${data.x_transaction_id}^${data.x_amount}^${data.x_currency_code}`)
    .digest('hex');
  return signature === data.x_signature;
}
```

```php
function validateSignature($data, $customerID, $pKey) {
    $signature = hash('sha256', 
        $customerID . '^' . 
        $pKey . '^' . 
        $data['x_ref_payco'] . '^' . 
        $data['x_transaction_id'] . '^' . 
        $data['x_amount'] . '^' . 
        $data['x_currency_code']
    );
    return $signature === $data['x_signature'];
}
```

```python
import hashlib
def validate_signature(data, customer_id, p_key):
    signature_string = f"{customer_id}^{p_key}^{data['x_ref_payco']}^{data['x_transaction_id']}^{data['x_amount']}^{data['x_currency_code']}"
    signature = hashlib.sha256(signature_string.encode()).hexdigest()
    return signature == data['x_signature']
```

#### Mejores Prácticas

1. **Siempre valida en el webhook**: Nunca confíes únicamente en la página de respuesta para confirmar pagos.

2. **Implementa idempotencia**: ePayco puede reintentar el webhook múltiples veces. Verifica que no proceses la misma transacción dos veces.

3. **Responde rápidamente**: El webhook debe responder con HTTP 200 en menos de 30 segundos. Para procesos largos, usa colas de trabajos.

4. **Valida la firma**: Siempre verifica la firma de seguridad `x_signature` para prevenir fraudes.

5. **Registra todo**: Guarda todos los webhooks recibidos para auditoría y debugging.

6. **Maneja reintentos**: Si tu servidor está caído, ePayco reintentará enviar el webhook. Asegúrate de manejar esto correctamente.

7. **Usa HTTPS**: La URL de confirmación debe usar HTTPS para seguridad.

8. **No redirijas**: El endpoint del webhook no debe hacer redirecciones (301/302).

### Ejemplo de Configuración

Al crear la sesión de checkout, configura ambas URLs:

```javascript
const sessionData = {
  checkout_version: "2",
  name: "Mi Tienda",
  description: "Producto ejemplo",
  currency: "COP",
  amount: 50000,
  lang: "ES",
  // URL donde se redirige al usuario (visible)
  response: "https://mitienda.com/resultado-pago",
  // URL del webhook (servidor a servidor)
  confirmation: "https://mitienda.com/api/webhook/epayco/confirmation"
};
```

> [!NOTE]
> **Importante**: Ambas URLs deben ser accesibles públicamente. Para desarrollo local, puedes usar herramientas como [ngrok](https://ngrok.com/) o [localtunnel](https://localtunnel.github.io/www/) para exponer tu servidor local.
