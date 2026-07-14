> SERVER_SIDE
>
> h1
>
> Crear y configurar una preferencia de pago

Una **preferencia de pago** es un objeto o conjunto de información que representa el producto o servicio por el que deseas cobrar. Dentro del ecosistema de Mercado Pago, este objeto se conoce como `preference`. Al crear una preferencia de pago, puedes definir detalles esenciales como el precio, la cantidad y los medios de pago, así como otras configuraciones relacionadas para el flujo de pago.

Durante esta etapa, también agregarás los **medios de pago** que deseas ofrecer con Checkout Pro, que por defecto incluye todos los medios de pago disponibles en Mercado Pago.

Para crear una preferencia de pago, utiliza el método asociado a `preference` en el SDK de backend. Es necesario que **crees una preferencia de pago para cada pedido o flujo de pago** que quieras iniciar.

A continuación, encontrarás ejemplos de cómo implementar esto en tu backend utilizando el SDK, que está disponible en diferentes lenguajes de programación. Completa los atributos con la información adecuada para reflejar los detalles de cada transacción y garantizar un flujo de pago preciso.

> NOTE
>
> Puedes adaptar la integración de Checkout Pro a tu modelo de negocio configurando los atributos de la preferencia de pago. Estos te permitirán definir cuotas, excluir un medio de pago, cambiar la fecha de vencimiento de un determinado pago, entre otras opciones. Para personalizar tu preferencia de pago, accede a la documentación en la sección de **Configuraciones adicionales**.

[[[
```php
<?php
$client = new PreferenceClient();
$preference = $client->create([
  "items"=> array(
  array(
  "title" => "Mi producto",
  "quantity" => 1,
  "unit_price" => 2000
  )
  )
]);

echo $preference
?>
```
```node
const preference = new Preference(client);

preference.create({
  body: {
  items: [
  {
  title: 'Mi producto',
  quantity: 1,
  unit_price: 2000
  }
  ],
  }
})
.then(console.log)
.catch(console.log);
```
```java
PreferenceItemRequest itemRequest =
  PreferenceItemRequest.builder()
  .id("1234")
  .title("Games")
  .description("PS5")
  .pictureUrl("http://picture.com/PS5")
  .categoryId("games")
  .quantity(2)
  .currencyId("BRL")
  .unitPrice(new BigDecimal("4000"))
  .build();
  List<PreferenceItemRequest> items = new ArrayList<>();
  items.add(itemRequest);
PreferenceRequest preferenceRequest = PreferenceRequest.builder()
.items(items).build();
PreferenceClient client = new PreferenceClient();
Preference preference = client.create(preferenceRequest);
```
```ruby
# Crea un objeto de preferencia
preference_data = {
  items: [
  {
  title: 'Mi producto',
  unit_price: 75.56,
  quantity: 1
  }
  ]
}
preference_response = sdk.preference.create(preference_data)
preference = preference_response[:response]

# Este valor reemplazará el string "<%= @preference_id %>" en tu HTML
@preference_id = preference['id']
```
```csharp
// Crea el objeto de request de la preference
var request = new PreferenceRequest
{
  Items = new List<PreferenceItemRequest>
  {
  new PreferenceItemRequest
  {
  Title = "Mi producto",
  Quantity = 1,
  CurrencyId = "ARS",
  UnitPrice = 75.56m,
  },
  },
};

// Crea la preferencia usando el client
var client = new PreferenceClient();
Preference preference = await client.CreateAsync(request);
```
```python
# Crea un ítem en la preferencia
preference_data = {
  "items": [
  {
  "title": "Mi producto",
  "quantity": 1,
  "unit_price": 75.76,
  }
  ]
}

preference_response = sdk.preference().create(preference_data)
preference = preference_response["response"]
```
```go
import (
  "github.com/mercadopago/sdk-go/pkg/preference"
)

client := preference.NewClient(cfg)

request := preference.Request{
	Items: []preference.ItemRequest{
		{
			Title: "My product",
			Quantity: 1,
			UnitPrice: 75.76,
		},
	},
}

resource, err := client.Create(context.Background(), request)
if err != nil {
	fmt.Println(err)
	return
}

fmt.Println(resource)
```
]]]

## Obtener el identificador de la preferencia

El identificador de la preferencia es un identificador de transacción único para una solicitud de pago específica. Para obtenerlo, deberas ejecutar tu aplicación. 

En la respuesta, obtendrás el **identificador de la preferencia** en la propiedad `ID`. **Guarda este valor, ya que lo necesitarás en el próximo paso para tu integración** en un sitio web o en una aplicación mobile. 

A continuación, te mostramos un ejemplo de cómo se ve el atributo `ID` con el identificador de preferencia en una respuesta.

```
"id": "787997534-6dad21a1-6145-4f0d-ac21-66bf7a5e7a58"
```

### Elegir el tipo de integración

Una vez que hayas obtenido tu ID de la preferencia, deberás avanzar a las configuraciones del frontend. Para eso, es necesario que elijas el tipo de integración que mejor se adapte a tus necesidades, ya sea para integrar un **sitio web** o para una **aplicación móvil**. 

Selecciona el tipo de integración que quieres hacer y sigue los pasos detallados para completar la integración de Checkout Pro.

---
future_product_avaible: 
 - card_avaible: true
 - card_icon: Laptop
 - card_title: Continuar integración para sitios web
 - card_description: Ofrece cobros con redirección a Mercado Pago en tu sitio web o tienda online.
 - card_button: /developers/es/docs/checkout-pro/configure-back-urls
 - card_buttonDescription: Integración web
 - card_pillText: DISPONIBLE
 - card_linkAvailable: false
 - card_linkProof:
 - card_linkProofDescription:
 - card_avaible: true
 - card_icon: Smartphone
 - card_title: Continuar integración para aplicaciones móviles
 - card_description: Ofrece cobros con redirección Mercado Pago en tu aplicación para dispositivos móviles.
 - card_button: /developers/es/docs/checkout-pro/mobile-integration
 - card_buttonDescription: Integración mobile
 - card_pillText: DISPONIBLE
 - card_linkAvailable: false
 - card_linkProof:
 - card_linkProofDescription:
---
