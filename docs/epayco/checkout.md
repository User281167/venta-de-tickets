---
title: "General"
slug: "checkout-general"
updated: 2026-02-09T14:00:49Z
published: 2026-02-09T14:00:49Z
canonical: "docs.epayco.com/checkout-general"
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.epayco.com/llms.txt
> Use this file to discover all available pages before exploring further.

# General

## ¿Qué es ePayco Smart Checkout?

**ePayco Smart Checkout** es una herramienta diseñada para integrar fácilmente la experiencia de pago de ePayco, una solución integral que incluye **la más completa variedad de herramientas** para recibir pagos electrónicos. La información sensible se procesa de forma segura en nuestros servidores certificados **PCI DSS Nivel 1**, evitando que tu aplicación interactúe directamente con datos sensibles. **Smart Checkout** te permite **personalizar completamente** el diseño según las necesidades de tu comercio, incorporando tu logo y marca para que los clientes perciban una experiencia de pago uniforme, ya sea en tu propio sitio web o en nuestro entorno seguro.

![](https://cdn.document360.io/88b1b912-ebe6-4677-9cf4-27af4e66c459/Images/Documentation/image(12).png)

### Métodos de pago soportados

**ePayco Smart Checkout** soporta más de **22 métodos de pago** completamente configurables para diferentes países y regiones.

![](https://cdn.document360.io/88b1b912-ebe6-4677-9cf4-27af4e66c459/Images/Documentation/medios%20(2).png)

## Tipos de checkout

**ePayco Smart Checkout** ofrece múltiples opciones de integración para adaptarse a las necesidades específicas de tu negocio. Puedes elegir entre diferentes experiencias de **Smart Checkout** que se ajusten perfectamente a tu sitio web y proporcionen la mejor experiencia de usuario.

- **Componente embebido (onpage)**: Integra el **Smart Checkout** directamente en tu sitio web manteniendo a los usuarios en tu dominio
- **Checkout en entorno seguro (standard)**: Redirige a los usuarios a nuestra plataforma segura y optimizada para completar el pago
- **Checkout optimizado para móviles**: Experiencia de pago específicamente diseñada para dispositivos móviles con interfaz responsiva

## Cómo funciona

**ePayco Smart Checkout** simplifica el proceso de integración de pagos mediante un flujo optimizado que garantiza seguridad y facilidad de uso. El sistema maneja automáticamente la validación de datos sensibles y el procesamiento seguro de transacciones.

### Ciclo de vida del checkout

1. **Inicialización**: Tu aplicación crea una nueva sesión de **Smart Checkout** cuando el cliente está listo para realizar la compra

2. **Renderizado**: El componente de **Smart Checkout** se monta en tu sitio web mostrando **ePayco Smart Checkout**

3. **Procesamiento**: El cliente ingresa sus datos de pago y completa la transacción de forma segura

4. **Confirmación**: Después de la transacción, se activa el webhook correspondiente para procesar la orden y completar el flujo y el usuario es re dirigido al resultado de la transacción

![](https://cdn.document360.io/88b1b912-ebe6-4677-9cf4-27af4e66c459/Images/Documentation/image(13).png)

client -> [info pedido, monoto, moneda, factura, etc] server
server -> epayco crea session smart checkout
epayco -> server retorna sessionID
server -> client retorna sessionID para render de smart checkout
client -> smart checkout monta component chcekout o redirige entorno seguro
client -> smart checkout renderiza componente y form personalizado
client -> smart checkout ingresa datos
smart checkout -> epay envia datos de procesamiento
epay -> smart checkout retorna resultado aprobado, pendiente rechazado
epay -> server envia notificacion por webhook
server -> server confirmar actualiza inventario bd
