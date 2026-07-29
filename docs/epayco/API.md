---
title: "API"
slug: "api"
updated: 2021-11-22T15:15:52Z
published: 2021-11-22T15:15:52Z
canonical: "docs.epayco.com/api"
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.epayco.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API

El proceso de pagos a través de API se emplea por medio de la APIFY de ePayco, la cual dispone todos los servicios para realizar el proceso de pagos electrónicos.

## Descripción del proceso de pagos

Para ejecutar un pago en línea de forma satisfactoria a través de Apify es necesario seguir los siguientes pasos:

**1. Login (generar token)**

Para comenzar a emplear los servicios de APIFY se debe realizar el proceso de login, para ello se debe contar con las variables PUBLIC_KEY y PRIVATE_KEY, Estas variables podrá obtenerlas accediendo al [dashboard](https://dashboard.epayco.co/) en la sección de integraciones llaves api), existen varias formas habilitadas para loguearse en Apify y obtener el token que se empleará como autenticación (Authorization: bearer token) en cada uno de los servicios:

- [Login](https://api.epayco.co/#dcbd790b-d198-49ba-9e67-6954401f5c8a)
- [Login con credenciales del cliente registrador](https://api.epayco.co/#7bb6f4e2-bdaa-4c00-ab7c-8ef4feca4ce1)
- [Login email](https://api.epayco.co/#7bb6f4e2-bdaa-4c00-ab7c-8ef4feca4ce1)

**2. Obtener métodos de pagos disponibles**

Como siguiente paso, se debe listar o obtener todos los medios de pagos disponibles de la plataforma, esta información se obtiene por medio del servicio [métodos de pagos para transacciones](https://api.epayco.co/#dd4fd20b-8942-4f43-88a6-05c8c60bb467).

**3. Crear transacción**

Una vez seleccionado el medio de pago para la transacción, dependiendo del medio de pago seleccionado se ejecuta el servicio que aplique al mismo por medio del envío de todos los parámetros requeridos y opcionales que se envían a través del servicio empleado, los servicios para este proceso son:

- [Pagos en efectivo.](https://api.epayco.co/#318327ce-bab7-4e24-8a18-13d9cf464525)
- [Pagos por PSE.](https://api.epayco.co/#f56f8f93-4b2b-4756-ab89-bd54114afdfc)
- [Pagos con tarjeta de crédito.](https://api.epayco.co/#d2d7629d-264d-4ef7-b877-8a4f698030f6)
- [Daviplata.](https://api.epayco.co/#4a32fc6f-4215-4707-a4c6-0bbbab4b18b6)
- [SafetyPay](https://api.epayco.co/#3c99b093-948a-4555-b510-d8c9b4496f4e)

**4. Confirmación de la transacción**

Cuando la transacción ya ha sido procesada por la red se debe pasar por el proceso de confirmación el cual se realiza a través del servicio [confirmar transacción](https://api.epayco.co/#575d11b0-b792-463b-8eb0-b827d4f5f364) donde el parámetro esencial requerido seria la ref_epayco el cual se obtiene al crear la transacción en los campos de respuesta de los servicios indicados en el punto anterior.

**5. Procesos adicionales**

Entre uno de los procesos adicionales que se tienen en la ejecución de pagos en línea está la opción de reversar la transacción realizada, esto se ejecuta consumiendo el servicio de [reversar transacción](https://api.epayco.co/#b854c1ff-6ce4-479c-abab-2c56800ba88d)

[❮ Atrás](https://docs.epayco.com/docs/proceso-de-pagos)[Siguiente ❯](https://docs.epayco.com/docs/email-de-cobro)


qué debe tener el **backend** y qué va al **frontend**

### 1. Lo que debe tener tu Backend (Servidor)
Tu backend es el único lugar donde deben residir las credenciales secretas. Es el responsable de comunicarse directamente con la API de **Apify**.

*   **`PUBLIC_KEY` y `PRIVATE_KEY`**: Estas son tus **Llaves Secretas API Rest**. Debes guardarlas en las variables de entorno de tu servidor. **Nunca** se envían al frontend ni se exponen en el código del navegador.
*   **Lógica para obtener el Token Bearer**: Tu backend debe ejecutar la petición de `login` contra `https://apify.epayco.co/login` usando las llaves anteriores.
    *   El token resultante (que técnicamente es un **JWT** firmado por ePayco) se genera y se usa **exclusivamente en el backend** para crear la sesión de pago (`/payment/session/create`).
*   **Generación del `sessionId`**: El backend usa el Token Bearer para pedirle a ePayco que cree una sesión de compra. La respuesta de ePayco contendrá un `sessionId`.

### 2. Lo que debe tener tu Frontend (Navegador/App)
El frontend **NO** debe tener acceso a las llaves privadas ni al proceso de autenticación con las llaves API.

*   **`sessionId`**: Es el único dato crítico que tu backend debe enviar al frontend. Este ID representa la transacción segura que ya fue preparada en el servidor.
*   **Librería/Script de ePayco**: El frontend usa este `sessionId` para inicializar el componente visual del checkout (Smart Checkout, Onpage, etc.).
*   **¿El JWT es para el frontend?**: **No**. El JWT (Token Bearer) que obtienes del login de Apify es para que tu backend hable con la API de ePayco. El frontend no lo necesita ni lo debe manejar.

### Flujo Resumido de Seguridad

1.  **Backend**: Usa `PUBLIC_KEY` + `PRIVATE_KEY` $\rightarrow$ Obtiene **Token Bearer (JWT)**.
2.  **Backend**: Usa **Token Bearer** $\rightarrow> Crea Sesión $\rightarrow$ Recibe **`sessionId`**.
3.  **Backend** envía solo el **`sessionId`** al **Frontend**.
4.  **Frontend**: Usa el **`sessionId`** para mostrar la pasarela de pago al usuario.

Esta separación garantiza que tus llaves secretas nunca sean expuestas en el navegador del cliente, previniendo fraudes o robos de credenciales.
