# Configurar ambiente de desarrollo

Para comenzar a integrar las soluciones de cobro de Mercado Pago, es necesario preparar tu ambiente de desarrollo con una serie de configuraciones que te permitirán acceder a las funcionalidades de Mercado Pago desde el backend.
 
A continuación, deberás instalar y configurar el SDK oficial de Mercado Pago:
 
> SERVER_SIDE
>
> h2
>
> Instalar el SDK de Mercado Pago

El **SDK de backend** está diseñado para manejar las operaciones del lado del servidor, permitiéndote crear y gestionar :toolTipComponent[preferencias de pago]{content="Una preferencia de pago es un objeto o conjunto de información que representa el producto o servicio por el que deseas cobrar. Dentro del ecosistema de Mercado Pago, este objeto se conoce como `preference`."}, procesar transacciones y llevar a cabo otras operaciones críticas de manera segura. 

> NOTE
>
> Si lo prefieres, puedes descargar los SDKs de Mercado Pago en nuestras [bibliotecas oficiales](/developers/es/docs/sdks-library/server-side).

Instala el SDK de Mercado Pago en el lenguaje que mejor se ajuste a tu integración utilizando un gestor de dependencias, tal como mostramos a continuación. 

[[[
```php
===
Para instalar el SDK debes ejecutar el siguiente código en la línea de comandos de tu terminal usando [Composer](https://getcomposer.org/download):
===
php composer.phar require "mercadopago/dx-php"
```
```node
===
Para instalar el SDK debes ejecutar el siguiente código en la línea de comandos de tu terminal usando [npm](https://www.npmjs.com/get-npm):
===
npm install mercadopago
```
```java
===
Para instalar el SDK en tu proyecto [Maven](http://maven.apache.org/install.html), debes agregar la siguiente dependencia en tu archivo <code>pom.xml</code> y ejecutar <code>maven install</code> en la línea de comandos de tu terminal:
===
<dependency>
  <groupId>com.mercadopago</groupId>
  <artifactId>sdk-java</artifactId>
  <version>2.1.7</version>
</dependency>
```
```ruby
===
Para instalar la SDK, debes ejecutar el siguiente código en la línea de comandos de tu terminal usando [Gem](https://rubygems.org/gems/mercadopago-sdk):
===
gem install mercadopago-sdk
```
```csharp
===

Para instalar la SDK debes ejecutar el siguiente código en la línea de comandos de tu terminal usando [NuGet](https://docs.microsoft.com/es-es/nuget/reference/nuget-exe-cli-reference):

===
nuget install mercadopago-sdk
```
```python
===
Para instalar el SDK debes ejecutar el siguiente código en la línea de comandos de tu terminal usando [Pip](https://pypi.org/project/mercadopago/):
===
pip3 install mercadopago
```
```go
go get -u github.com/mercadopago/sdk-go
```
]]]

> SERVER_SIDE
>
> h2
>
> Inicializar biblioteca de Mercado Pago

A continuación, crea un archivo principal (_main_) en el _backend_ de tu proyecto con el lenguaje de programación que estés utilizando. Allí, coloca el siguiente código reemplazando el valor `TEST_ACCESS_TOKEN` con el :toolTipComponent[Access Token de pruebas]{content="Clave privada de pruebas de la aplicación creada en Mercado Pago, que es utilizada en el backend. Puedes acceder a ella a través de *Tus integraciones* en la sección *Datos de integración*, dirigiéndote a la sección *Credenciales* ubicada a la derecha de la pantalla y haciendo clic en *Prueba*. Alternativamente, puedes ingresar a través de *Tus integraciones > Datos de integración > Pruebas > Credenciales de prueba*. El _Access Token_ de prueba comienza con el prefijo `APP_USR`."}.

[[[
```php
<?php
// SDK de Mercado Pago
use MercadoPago\MercadoPagoConfig;
// Agrega credenciales
MercadoPagoConfig::setAccessToken("TEST_ACCESS_TOKEN");
?>
```
```node
// SDK de Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';
// Agrega credenciales
const client = new MercadoPagoConfig({ accessToken: 'YOUR_ACCESS_TOKEN' });
```
```java
// SDK de Mercado Pago
import com.mercadopago.MercadoPagoConfig;
// Agrega credenciales
MercadoPagoConfig.setAccessToken("TEST_ACCESS_TOKEN");
```
```ruby
# SDK de Mercado Pago
require 'mercadopago'
# Agrega credenciales
sdk = Mercadopago::SDK.new('TEST_ACCESS_TOKEN')
```
```csharp
// SDK de Mercado Pago
 using MercadoPago.Config;
 // Agrega credenciales
MercadoPagoConfig.AccessToken = "TEST_ACCESS_TOKEN";
```
```python
# SDK de Mercado Pago
import mercadopago
# Agrega credenciales
sdk = mercadopago.SDK("TEST_ACCESS_TOKEN")
```
```go
import (
	"github.com/mercadopago/sdk-go/pkg/config"
)

cfg, err := config.New("{{ACCESS_TOKEN}}")
if err != nil {
	fmt.Println(err)
}
```
]]]

Después de estas configuraciones, tu ambiente de desarrollo ya está listo para avanzar con la configuración de una preferencia de pago.
