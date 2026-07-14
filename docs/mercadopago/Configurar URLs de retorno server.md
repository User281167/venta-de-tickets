# Configurar URLs de retorno

La URL de retorno es la dirección a la que se redirige al usuario después de completar el pago, ya sea exitoso, fallido o pendiente. Esta URL debe ser una página web que controles, como un servidor con dominio nombrado (DNS). 

Este proceso se configura a través del atributo `back_urls` en el backend, en la preferencia de pago asociada a tu integración. Con este atributo podrás definir que el comprador sea redirigido al sitio web que configuraste, ya sea automáticamente o a través del botón "Volver al sitio", según el estado del pago. 

Puedes configurar hasta tres URL de retorno diferentes, que corresponderán a los escenarios de pago pendiente, éxito o error. 

> NOTE
>
> En integraciones mobile, recomendamos que las URLs de retorno sean deep links. Para conocer más, ve a la documentación [Integración para aplicaciones móviles](/developers/es/docs/checkout-pro/mobile-integration).

## Definir URL de retorno

En tu código backend, deberás configurar la URL a la que quieres que Mercado Pago redirija al usuario una vez que haya completado el proceso de pago. 

> NEUTRAL_MESSAGE
>
> Si lo prefieres, también es posible configurar las URLs de retorno a través del envío POST a la API [Crear preferencia](/developers/es/reference/online-payments/checkout-pro/preferences/create-preference/post) con el atributo `back_urls` informando las URLs a las que se debe dirigir al comprador al finalizar el pago.

A continuación, te compartimos ejemplos de cómo incluir el atributo `back_urls` según el lenguaje de programación que estés utilizando, además del detalle de cada uno de los posibles parámetros.

[[[
```php
<?php
$preference = new MercadoPago\Preference();
//...
$preference->back_urls = array(
  "success" => "https://www.tu-sitio/success",
  "failure" => "https://www.tu-sitio/failure",
  "pending" => "https://www.tu-sitio/pending"
);
$preference->auto_return = "approved";
// ...
?>
```
```node
const preference = new Preference(client);
  preference.create({
  body: {
  // ...
  back_urls: {
  success: "https://www.tu-sitio/success",
  failure: "https://www.tu-sitio/failure",
  pending: "https://www.tu-sitio/pending"
  },
  auto_return: "approved",
  }
  })
  // ...
```
```java
PreferenceBackUrlsRequest backUrls =
// ...
  PreferenceBackUrlsRequest.builder()
  .success("https://www.tu-sitio/success")
  .pending("https://www.tu-sitio/pending")
  .failure("https://www.tu-sitio/failure")
  .build();

PreferenceRequest request = PreferenceRequest.builder().backUrls(backUrls).build();
// ...
```
```ruby
# ...
preference_data = {
  # ...
  back_urls: {
  success: 'https://www.tu-sitio/success',
  failure: 'https://www.tu-sitio/failure',
  pending: 'https://www.tu-sitio/pendings'
  },
  auto_return: 'approved'
  # ...
}
# ...
```
```csharp
var request = new PreferenceRequest
{
  // ...
  BackUrls = new PreferenceBackUrlsRequest
  {
  Success = "https://www.tu-sitio/success",
  Failure = "https://www.tu-sitio/failure",
  Pending = "https://www.tu-sitio/pendings",
  },
  AutoReturn = "approved",
};
```
```python
preference_data = {
  "back_urls": {
  "success": "https://www.tu-sitio/success",
  "failure": "https://www.tu-sitio/failure",
  "pending": "https://www.tu-sitio/pendings"
  },
  "auto_return": "approved"
}
```
]]]

| Atributo | Descripción |
|--------------|-----|
| `auto_return`| Los compradores son redirigidos automáticamente al site cuando se aprueba el pago. El valor predeterminado es `approved`. **El tiempo de redireccionamiento será de hasta 40 segundos y no podrá ser personalizado**. Por defecto, también se mostrará un botón de "Volver al sitio".|
| `back_urls` | URL de retorno al sitio. Los escenarios posibles son: <br>`success`: URL de retorno cuando se aprueba el pago.<br>`pending`: URL de retorno cuando el pago está pendiente.<br>`failure`: URL de retorno cuando se rechaza el pago. |

> WARNING
>
> No utilices dominios locales en el valor `back_urls`, tales como 'localhost/' o '127.0.0.1' con o sin puerto especificado. Recomendamos usar un servidor con dominio nombrado (DNS) o IPs de desarrollo para poder regresar al sitio después del pago. De lo contrario, aparecerá el mensaje de "Algo ha salido mal" al finalizar el proceso de compra.

## Respuesta de las URLs de retorno 

Las `back_urls` devolverán, a través de un llamado GET, algunos parámetros útiles. A continuación, te compartimos un ejemplo de cómo se verá una respuesta y el detalle de los parámetros que podrás encontrar en ella.

```curl
GET /test?collection_id=106400160592&collection_status=rejected&payment_id=106400160592&status=rejected&external_reference=qweqweqwe&payment_type=credit_card&merchant_order_id=29900492508&preference_id=724484980-ecb2c41d-ee0e-4cf4-9950-8ef2f07d3d82&site_id=MLC&processing_mode=aggregator&merchant_account_id=null HTTP/1.1
Host: yourwebsite.com
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: es-419,es;q=0.9
Connection: keep-alive
Referer: https://www.mercadopago.com/checkout/v1/payment/redirect/505f641c-cf04-4407-a7ad-8ca471419ee5/congrats/rejected/?preference-id=724484980-ecb2c41d-ee0e-4cf4-9950-8ef2f07d3d82&router-request-id=0edb64e3-d853-447a-bb95-4f810cbed7f7&p=f2e3a023dd16ac953e65c4ace82bb3ab
Sec-Ch-Ua: "Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "macOS"
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: cross-site
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
```

| Parámetro | Descripción |
|-----------------------|-----------------------------------------------------------------------------------------------|
| `payment_id` | ID (identificador) del pago de Mercado Pago. |
| `status` | Status del pago. Por ejemplo: `approved` para un pago aprobado o `pending` para un pago pendiente. |
| `external_reference` | Referencia que puedes sincronizar con tu sistema de pagos. |
| `merchant_order_id` | ID (identificador) de la orden de pago generada en Mercado Pago. |

### Respuesta en medios de pago offline

Los medios de pago offline son aquellos en donde el usuario comprador elige un medio de pago que requiere que utilice un punto de pago físico para completar el proceso de compra. En este flujo de pago, Mercado Pago generará un comprobante que el usuario necesita para realizar el pago en el establecimiento correspondiente, y redireccionará al usuario a la URL que especificaste en el atributo `back_urls` como `pending`. 

En este punto, el pago está en estado pendiente porque el usuario todavía tiene que ir a un establecimiento físico y pagar. 

Para brindarle mayor información al comprador, recomendamos que, para los estados de pago `pending`, redirecciones al comprador a tu sitio web y le compartas información clara sobre cómo completar el pago.

Una vez que el usuario va al establecimiento correspondiente y realiza el pago en efectivo con el comprobante generado, Mercado pago es notificado y el pago cambiará de estado. Recomendamos que [configures las notificaciones de pago](/developers/es/docs/checkout-pro/payment-notifications) para que tu servidor pueda procesar esta notificación y actualizar el estado del pedido en tu base de datos.
