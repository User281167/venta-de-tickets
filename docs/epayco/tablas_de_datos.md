---
title: "Tablas de datos"
slug: "checkout-tablas-de-datos"
updated: 2025-12-19T19:08:49Z
published: 2025-12-19T19:08:49Z
canonical: "docs.epayco.com/checkout-tablas-de-datos"
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.epayco.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tablas de datos

## Medios de pago y franquicias

A continuación se muestran los códigos de medios de pagos y franquicias en ePayco.

| **Categoría** | **Medio de pago** | Franquicia |
| --- | --- | --- |
| Tarjeta de crédito y/o débito (TDC) | - Tarjeta de crédito (TDCN) - Tarjeta de crédito 3Ds (3DS) - One click payment (OCP) | - Visa (VS) - Mastercard (MC) - Diners Club (DC) - American Express (AM) - Codensa (COD) - EPM (EPM) - Tuya (TY) |
| Cuentas de ahorro y/o corriente (ACH) | - PSE (PSE) |  |
| Cuentas de ahorro (CAH) | - Botón Bancolombia (BBC) |  |
| Efectivo (CASH) | - Efectivo (CASH) | - Efecty (EF) - Gana (GA) - Punto Red (PR) - Red Servi (RS) - Sured (SR) |
| Billeteras Digitales (WLL) | - Daviplata (DP) |  |
| Puntos / Bonos redimibles (PBR) | - Davipuntos (MPD) - Puntos Colombia (PCO) |  |
| Métodos internacionales (MI) | - PayPal (PP) - SafetyPay (SP) |  |
| Productos Davivienda (PDD) | - Davipuntos (MPD) - Daviplata (DP) |  |

## **Estados**

Estados de transacciones en ePayco

| **Estado** | **Respuesta** |
| --- | --- |
| Aceptada | La transacción fue aprobada |
| Rechazada | Con el detalle del motivo, para PSE están las opciones el usuario no aceptó o rechazó la transacción en el banco o el usuario cerró el navegador, en Tarjeta de crédito las opciones son: fondos insuficientes, tarjeta no válida, rechazada por la red de procesamiento. |
| Pendiente | La transacción se encuentra pendiente por aprobación, para PSE las transacciones quedan pendientes y pueden tardar hasta 20 minutos en que retornen el final de la transacción ya sea con estado aprobado o rechazado, para pagos en efectivo las transacciones quedan inicialmente como pendientes hasta que el usuario no realice el pago en un punto físico. |
| Fallida | No se culmina el flujo de creación de la transacción de manera exitosa |
| Reversada | Reintegro del dinero al cliente pagador, es de aclarar que solo se pueden revertir transacciones por tarjeta de crédito, esta acción se puede gestionar directamente desde el Dashboard si la transacción fue realizada el mismo día hasta las 9 pm, pasado este tiempo debe solicitarse ante la red de procesamiento. |
| Iniciada | Estado interno para iniciar una transacción |
| Expirada | Transacción caducada, este estado solo se da en el medio de pago en efectivo y SafetyPay debido a que el usuario no realiza el pago en el punto físico en un tiempo determinado (este tiempo de vencimiento lo define el comercio que va desde 12 horas hasta 8 días) |
| Abandonada | El usuario por algún motivo cerró el navegador y no culminó el proceso de diligenciamiento de la información. |
| Cancelada | El usuario no culmino el proceso final pero diligencio la información |

## **Tipos de documentos**

Tipos de documento de usuario pagador dentro de ePayco

| **IDENTIFICACIÓN** | **Tipo de documento** | **Formato** | **Longitud** |
| --- | --- | --- | --- |
| NIT | Número de identificación tributaria | Numérico | mínimo 7 dígitos y máximo 10 dígitos |
| C.C. | Cédula de ciudadanía | Numérico | mínimo 5 y máximo 15 dígitos |
| CE | Cédula de extranjería | Numérico | mínimo 4 dígitos y máximo 8 dígitos |
| TI | Tarjeta de identidad | Numérico | mínimo 4 dígitos y máximo 20 dígitos |
| PPN | Pasaporte | Alfanumérico | mínimo 4 dígitos y máximo 12 dígitos |
| SSN | Número de seguridad social | Numérico | mínimo 9 dígitos y máximo 9 dígitos |
| LIC | Licencia de conducción | Numérico | mínimo 1 dígitos y máximo 20 dígitos |
| DNI | documento nacional de identificación | Alfanumérico | mínimo 1 dígito y máximo 20 dígitos |
| RFC | Registro Federal de Contribuyentes | Alfanumérico | mínimo 12 dígitos y máximo 13 dígitos |
| PEP | Permiso Especial de Permanencia | Numérico | mínimo 7 dígitos y máximo 15 dígitos |
| PPT | Permiso por Protección Temporal | Numérico | mínimo 7 dígitos y máximo 15 dígitos |
