> CLIENT_SIDE
>
> h1
>
> Agregar el SDK al frontend e inicializar el checkout 

Una vez que hayas configurado tu backend, es necesario que configures el frontend para completar la experiencia de cobro del lado del cliente. Para esto, puedes utilizar el SDK MercadoPago.js, que permite capturar pagos directamente en el frontend de manera segura. 

En esta sección, verás cómo incluirlo e inicializarlo correctamente, para finalmente renderizar el botón de pago de Mercado Pago.

> Si lo prefieres, puedes descargar el SDKs MercadoPago.js en nuestras [bibliotecas oficiales](/developers/es/docs/sdks-library/client-side/mp-js-v2).

:::::TabsComponent

::::TabComponent{title="Incluir el SDK con HTML/js"}
## Incluir el SDK con HTML/js

Para incluir el SDK MercadoPago.js en tu página HTML desde un **CDN (Content Delivery Network)**, primero deberás agregar la etiqueta `<script>` justo antes de la etiqueta `</body>` en tu archivo HTML principal, tal como te mostramos en el siguiente ejemplo.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Integración con Checkout Pro</title>
</head>
<body>

  <!-- Contenido de tu página -->

  <script src="https://sdk.mercadopago.com/js/v2"></script>

  <script>
  // Tu código JavaScript irá aquí
  </script>

</body>
</html>
```

## Inicializar el checkout desde la preferencia de pago

Después de incluir el SDK en tu frontend, es momento de inicializarlo y luego iniciar el checkout.

Para continuar, utiliza tu credencial :toolTipComponent[Public Key de pruebas]{content="Clave pública de pruebas, que es utilizada en el frontend para acceder a información y cifrar datos, sea en la etapa de desarrollo o en la de pruebas. Puedes acceder a ella a través de **Tus integraciones > Datos de integración > Pruebas > Credenciales de prueba**."}.

> NOTE
>
> Si estás desarrollando para otra persona, podrás acceder a las credenciales de las aplicaciones que no administras. Consulta [Compartir credenciales](/developers/es/docs/checkout-pro/resources/credentials) para más información.

También necesitarás utilizar el identificador de la preferencia de pago que obtuviste como respuesta en [Crear y configurar una preferencia de pago](/developers/es/docs/checkout-pro/create-payment-preference).

A continuación, para inicializar el SDK utilizando un CDN, deberás ejecutar este código dentro de la etiqueta `<script>`, reemplazando el valor `YOUR_PUBLIC_KEY`por tu clave y `YOUR_PREFERENCE_ID` por el **identificador de la preferencia de pago**.

```Javascript
<script src="https://sdk.mercadopago.com/js/v2"></script>
<script>
  // Configure sua chave pública do Mercado Pago
  const publicKey = "YOUR_PUBLIC_KEY";
  // Configure o ID de preferência que você deve receber do seu backend
  const preferenceId = "YOUR_PREFERENCE_ID";

  // Inicializa o SDK do Mercado Pago
  const mp = new MercadoPago(publicKey);

  // Cria o botão de pagamento
  const bricksBuilder = mp.bricks();
  const renderWalletBrick = async (bricksBuilder) => {
  await bricksBuilder.create("wallet", "walletBrick_container", {
  initialization: {
  preferenceId: "<PREFERENCE_ID>",
  }
});
  };

  renderWalletBrick(bricksBuilder);
</script>
```

> CLIENT_SIDE
>
> h2
>
> Crear un contenedor HTML para el botón de pago

Por último, necesitarás crear un contenedor en tu HTML para definir la ubicación en la cual se mostrará el botón de pago de MercadoPago. La creación del contenedor se realiza insertando un elemento en el código HTML de la página en la que se representará el componente. 

```html
<!-- Container para o botão de pagamento -->
<div id="walletBrick_container"></div>
```

## Renderizar el botón de pago

El SDK de Mercado Pago renderizará automáticamente un botón dentro de este elemento, que será responsable de redirigir al comprador hacia un formulario de compra en el ambiente de Mercado Pago, tal como se muestra en la siguiente imagen.

![Button](/images/cow/wallet-render-es-v1.png)
::::

::::TabComponent{title="Instalar el SDK utilizando React"}
## Instalar el SDK utilizando react

Para incluir el SDK MercadoPago.js en el frontend de tu proyecto React, primero deberás configurar tu entorno de React. Para eso, asegúrate de tener **Node.js** y **npm** instalados en tu sistema. Si no los tienen, descárgalos desde el [sitio oficial de Node.js](http://Node.js).

En tu terminal o línea de comandos, ejecuta el siguiente comando para crear una nueva aplicación de React:

```
npx create-react-app my-mercadopago-app
```

Esto creará un nuevo directorio llamado `my-mercadopago-app` con una estructura básica de aplicación React.

### Instalar SDK MercadoPago.js

Instala la biblioteca SDK MercadoPago.js en el directorio `my-mercadopago-app`. Puedes hacerlo ejecutando el siguiente comando:

```
npm install @mercadopago/sdk-react
```

## Crear un componente para el botón de pago

Abre el archivo `src/App.js` de tu aplicación React. Una vez allí, modifica el contenido del archivo para integrar el componente `wallet` de Mercado Pago, que es el encargado de mostrar el botón de pago de Mercado Pago.

Para continuar, utiliza tu credencial :toolTipComponent[Public Key de pruebas]{content="Clave pública de pruebas, que es utilizada en el frontend para acceder a información y cifrar datos, sea en la etapa de desarrollo o en la de pruebas. Puedes acceder a ella a través de **Tus integraciones > Datos de integración > Pruebas > Credenciales de prueba**."}.

> NOTE
>
> Si estás desarrollando para otra persona, podrás acceder a las credenciales de las aplicaciones que no administras. Consulta [Compartir credenciales](/developers/es/docs/checkout-pro/resources/credentials) para más información.

También necesitarás utilizar el identificador de la preferencia de pago que obtuviste como respuesta en [Crear y configurar una preferencia de pago](/developers/es/docs/checkout-pro/create-payment-preference).

A continuación, sustituye el valor `YOUR_PUBLIC_KEY`por tu clave y `YOUR_PREFERENCE_ID` por el **identificador de la preferencia de pago** en el archivo `src/App.js`. Observa el siguiente ejemplo.

```JavaScript
import React from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializa Mercado Pago con tu Public Key
initMercadoPago('YOUR_PUBLIC_KEY');

const App = () => {
  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
  <h1>Botón de Pago</h1>
  <p>Haz clic en el botón para realizar el pago.</p>
  {/* Renderiza el botón de pago */}
  <div style={{ width: '300px' }}>
  <Wallet initialization={{ preferenceId: 'YOUR_PREFERENCE_ID' }} />
  </div>
  </div>
  );
};

export default App;
```

## Renderizar el botón de pago

Al ejecutar tu aplicación en React, el SDK de Mercado Pago renderizará el botón de pago que será responsable de redirigir al comprador hacia un formulario de compra en el ambiente de Mercado Pago, tal como se muestra en la siguiente imagen.

![Button](/images/cow/wallet-render-es-v1.png)
::::

:::::

<br>

Una vez que hayas finalizado la configuración de tu frontend, deberás configurar las [Notificaciones](/developers/es/docs/checkout-pro/payment-notifications) para que tu integración reciba información en tiempo real sobre los eventos que ocurren en tu integración.
