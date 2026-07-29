---
title: "Implementación"
slug: "checkout-implementacion"
updated: 2026-07-15T16:13:35Z
published: 2026-07-15T16:13:35Z
canonical: "docs.epayco.com/checkout-implementacion"
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.epayco.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Implementación

La implementación de **ePayco Smart Checkout** se realiza mediante una integración JavaScript simple y directa que te permite desplegar el checkout con cualquier evento en tu aplicación web.

## Uso

### **Creación de la sesión desde el backend**

El primer paso para implementar **ePayco Smart Checkout** es crear una sesión de checkout cuando el cliente esté listo para realizar la compra. Esta sesión debe ser creada desde tu backend favorito mediante una petición a nuestras APIs, la cual generará un ID de sesión único que posteriormente utilizarás para inicializar el componente de **ePayco Smart Checkout** en el frontend y garantizar que la sesión esté correctamente vinculada con tu sistema de gestión de órdenes.

#### Autenticación con Apify

Antes de crear la sesión de **ePayco Smart Checkout**, debes autenticarte con los servicios de [Apify](https://api.epayco.co/) de ePayco para obtener un token de acceso. Este proceso requiere que seas un usuario registrado en ePayco y utiliza autenticación Basic enviando tu `PUBLIC_KEY` y `PRIVATE_KEY` (las cuales puedes obtener en tu [dashboard de ePayco](https://dashboard.epayco.com/configuration) en la sección de Configuración → Personalizaciones → Llaves secretas. en los headers de la petición. El token que obtendrás de este endpoint te permitirá firmar las solicitudes posteriores necesarias para crear la sesión de **ePayco Smart Checkout** de forma segura.

#### Solicitud

```bash
curl --location --request POST 'https://apify.epayco.co/login' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic <PUBLIC_KEY:PRIVATE_KEY en base64>'
```

#### Respuesta exitosa

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGlmeWVQYXljb0pXVCIsInN1YiI6MTU1NTk3MywiaWF0IjoxNzYwNDkyNzMyLCJleHAiOjE3NjA0OTM5MzIsInJhbmQiOiI5YzU1NjhlYTEyZjI3MWM0OWUzMTIzYWRhMmE3M2VmODcwMTciLCJyZXMiOmZhbHNlLCJpbmEiOmZhbHNlLCJndWkiOjExNTI2NDYsInV1aWQiOiIzZjYwOGY0ZS00YWM4LTQ4NDYtYmRjZS0xMmViZjJmZTkyZDMiLCJzY29wZSI6Im1hc3RlciJ9.SSI-6nPQDwN2bS0yK-K2-U-1gOgC7pZB0BFN3_amqh8"
}
```

#### Autenticación con Apify

Una vez obtenido el token de autenticación, el siguiente paso es crear la sesión de **Smart Checkout** que generará el `sessionId` necesario para inicializar el componente en el frontend. Esta petición debe incluir la información de la transacción como el nombre del producto, descripción, monto, moneda, etc. El `sessionId` retornado será utilizado para abrir el **Smart Checkout** de pago en tu sitio web.

#### Solicitud

```bash
curl --location 'https://apify.epayco.co/payment/session/create' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {{APIFY_TOKEN}}' \
--data '{
    "checkout_version": "2",
    "name": "Shops Online S.A.S",
    "currency": "COP",
    "amount": 200000
}'
```

> Todas las propiedades disponibles que describen más abajo.

#### Respuesta exitosa

```json
{
    "success": true,
    "titleResponse": "Session created successfully",
    "textResponse": "Session created successfully",
    "lastAction": "create session",
    "data": {
        "sessionId": "68eefce71d65f1d39c0f6dad",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWVmY2U3MWQ2NWYxZDM5YzBmNmRhZCIsImNyZWF0ZWRfYXQiOiIyMDI1LTEwLTE1VDAxOjQ2OjE1LjU1NFoiLCJpYXQiOjE3NjA0OTI3NzUsImV4cCI6MTc2MDU3OTE3NX0.BYGWqDyUxe1JDfYc2F_EhwHET0Uv-umvAJdQtf6wd9k"
    }
}
```

### Propiedades

A continuación se describen todas las propiedades que puedes utilizar al crear una sesión de **ePayco Smart Checkout**. Las propiedades están organizadas en requeridas y opcionales, incluyendo objetos anidados para configuraciones avanzadas como división de pagos, campos personalizados y datos de facturación.

**PSE Multicrédito (opcional)**

Permite a los comercios dispersar un pago PSE única transacción hacia múltiples empresas receptoras mediante líneas de crédito independientes, garantizando que la suma de montos sea exacta al monto total pagado.

[Documentación PSE Multicredito](https://docs.epayco.com/docs/pse-multicr%C3%A9dito)

| Propiedad | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| serviceCode | string | ✅ Sí | No vacío, no espacios en blanco |
| credits | array | ✅ Sí | Array no vacío (mín. 1 elemento) |
| `credits[].code` | string | ✅ Sí | No vacío, no espacios en blanco |
| `credits[].amount` | number | ✅ Sí | ≥ 0 (positivo o cero) |
| `rcredits[].companyIdentification` | string | ✅ Sí | No vacío, no espacios en blanco |
| **Suma total de amounts** | - | ✅ Sí | DEBE ser igual a `amount` |

**Sub-Agregado (opcional)**

Permite reportar la información de un **sub-agregado** (sub-comercio) asociado a la transacción, por ejemplo en transacciones PSE. Es un objeto **opcional**; si se incluye, todos sus campos son obligatorios.

| Propiedad | Tipo | Requerido | Validación |
| --- | --- | --- | --- |
| PSESubMerchant | object | No | Objeto opcional. Si se envía, todos sus campos internos son requeridos |
| `PSESubMerchant.type` | string | ✅ Sí | Tipo de documento. Uno de: `NIT`, `CC`, `CE`, `PPN`, `DNI`, `RFC` |
| `PSESubMerchant.document` | string | ✅ Sí | Número de documento. Longitud entre 1 y 15 caracteres |
| `PSESubMerchant.name` | string | ✅ Sí | Nombre / razón social del sub-agregado. Longitud entre 1 y 64 caracteres |
| `PSESubMerchant.ciiu` | string | ✅ Sí | Código de actividad económica CIIU. Longitud entre 1 y 6 caracteres, **solo números** |

#### Ejemplo Completo

A continuación se muestra un objeto JSON completo con todas las propiedades disponibles para crear una sesión de **ePayco Smart Checkout**:

```json
{
  // ==================== REQUERIDOS ====================
  "checkout_version": "2",
  "name": "Shops Online S.A. S",
  "currency": "COP",
  "amount": 20000.00, // Total a pagar

  // ==================== OPCIONALES ====================
  "description": "Buzo con capucha color negro unisex",
  "lang": "ES", // ES | EN
  "invoice": "2341233", // numero de factura
  "country": "CO", // Código alpha-2
  "taxBase": 16806.72,
  "tax": 3193.28,
  "taxIco": 0,
  "response": "https://mysite.com",
  "confirmation": "https://webhook.site/8b4bb363-099e-42e8-afe7-0bf11c59eeb1",

  // ==================== CONFIGURACIÓN (OPCIONAL) ====================
  "methodsDisable": [],
  "method": "POST", // GET | POST
  "dues": 1,

  // ==================== SPLIT PAYMENT (OPCIONAL) ====================
  "splitPayment": {
    "type": "percentage",
    "receivers": [
      {
        "merchantId": 9898,
        "amount": 15000.00,
        "taxBase": 12605.04,
        "tax": 2394.96,
        "fee": 1
      },
      {
        "merchantId": 1485968,
        "amount": 5000,
        "taxBase": 4201.68,
        "tax": 798.32,
        "fee":  1
      }
    ]
  },

  // ==================== PSE MULTICREDITO (OPCIONAL) ====================
  "PSEMultiCredit": {
    "serviceCode": "SERV-01",
    "credits": [
      {
        "code": "77700102",
        "amount": 12000.00,
        "companyIdentification": "8001234567"
      },
      {
        "code": "77700103",
        "amount": 8000.00,
        "companyIdentification": "8009876543"
      }
    ]
  },

  // ==================== SUB-AGREGADO (OPCIONAL) ====================
  "PSESubMerchant": {
    "type": "NIT",
    "document": "900123123",
    "name": "Tienda XYZ",
    "ciiu": "6201"
  },

  // ==================== EXTRAS (OPCIONAL) ====================
  "extras": {
    "extra1": "extra1",
    "extra2": "extra2",
    "extra3": "extra3",
    "extra4": "extra4",
    "extra5": "extra5",
    "extra6": "extra6",
    "extra7":  "extra7",
    "extra8": "extra8",
    "extra9": "extra9",
    "extra10": "extra10",
    "extra11": "extra11"
  },

  // ==================== BILLING (OPCIONAL) ====================
  "billing": {
    "email": "cliente@gmail.com",
    "name":  "CLiente Martinez",
    "address": "AV 18 # 18 - 17",
    "typeDoc": "CC",
    "numberDoc": "103242123",
    "callingCode": "+57",
    "mobilePhone": "312456654"
  }
}
```

> Nota: Este ejemplo incluye todas las propiedades disponibles. Solo las propiedades requeridas `checkout_version`, `name`, `currency`, `amount`) son obligatorias. El resto son opcionales y puedes incluirlas según las necesidades de tu implementación.

### **Implementación en el frontend**

Una vez que hayas obtenido el `sessionId` desde tu backend, el último paso es inicializar y mostrar el componente de **ePayco Smart Checkout** en tu sitio web. Primero debes incluir la librería JavaScript de ePayco en tu página, luego configurar el **Smart Checkout** con el `sessionId` obtenido y finalmente abrirlo con el evento de tu preferencia.

#### 1. Incluir la librería de ePayco

Agrega el siguiente script en tu página HTML:

```xml
<script src="https://checkout.epayco.co/checkout-v2.js"></script>
```

#### 2. Configurar y abrir el checkout

```javascript
const checkout = ePayco.checkout.configure({
      sessionId: sessionId,
      type: "onpage", // "onpage" | "standard"
      test: true // Test: true | false
});

// Abrir el checkout
checkout.open();
```

#### 3. Registrar hooks con `setHooks()`

**ePayco Smart Checkout** proporciona un sistema de hooks que permite responder a diferentes etapas del flujo de pago. Todos los hooks se registran en una sola llamada mediante `setHooks({ onCreated, onResponse, onClosed, onErrors })` sobre el `checkout` retornado por `configure()`. Estos hooks están disponibles para los tipos de implementación `onpage`.

```javascript
checkout.setHooks({
    onCreated: (data) => {
        console.log("Checkout creado:", data);
        // Guardar marcación de apertura, analytics, etc.
    },
    onResponse: (response) => {
        console.log("Respuesta del pago:", response);
        // Procesar la respuesta de la transacción.
    },
    onErrors: (error) => {
        console.error("Error al procesar el pago:", error);
        // Mostrar mensaje de error personalizado al usuario.
    },
    onClosed: (errors) => {
        console.log("Checkout cerrado.", errors);
        // Limpiar estado, verificar estado de transacción, redirigir custom.
    }
});
```

#### Descripción de cada hook:

- `onCreated(data)` Se dispara cuando se abre exitosamente el **Smart Checkout**. Recibe como argumento la información de la transacción creada.

- `onResponse(response)` Se dispara cuando el pago ha sido procesado y se obtiene la respuesta del **Smart Checkout**. Recibe como argumento el objeto con el resultado de la transacción (estado, referencia, monto, etc.). Ideal para confirmar el pago en el frontend o actualizar la UI.

- `onErrors(error)` Se activa cuando ocurre un error durante el proceso de obtener la transacción en el **Smart Checkout**. Recibe como argumento el detalle del error. Permite manejar errores de forma personalizada y mostrar mensajes apropiados al usuario.

- `onClosed(errors)` Se dispara cuando el usuario cierra el **Smart Checkout**, ya sea después de completar el pago o cancelar el proceso. Recibe como argumento eventuales errores ocurridos al cerrar. Ideal para limpiar el estado de la aplicación o redirigir al usuario.

#### Ejemplo de implementación completa con eventos:

Selecciona la pestaña del lenguaje o framework que estés utilizando. **Vanilla JS** es la implementación por defecto. Todos los ejemplos asumen que: (1) ya incluiste el `&lt;script&gt;` de ePayco en tu `index.html` (paso 1 más arriba) y (2) ya tienes un `sessionId` obtenido previamente desde tu backend (ver sección *Creación de la sesión desde el backend*). Cada ejemplo se enfoca únicamente en cómo integrar el **Smart Checkout** en el frontend usando `configure()` + `setHooks({...})` + `open()`.

Vanilla JSReactAngularVue

```xml
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Smart Checkout ePayco</title>
    <script src="https://checkout.epayco.co/checkout-v2.js"></script>
</head>
<body>
    <button id="payBtn">Pagar</button>
    <p id="status" role="status" aria-live="polite"></p>

    <script>
        // sessionId obtenido previamente desde tu backend
        // (ver sección "Creación de la sesión desde el backend").
        const sessionId = "TU_SESSION_ID";

        const payBtn = document.getElementById("payBtn");
        const statusEl = document.getElementById("status");

        payBtn.addEventListener("click", () => {
            payBtn.disabled = true;

            // 1. Configurar el checkout
            const checkout = ePayco.checkout.configure({
                sessionId,
                type: "onpage", // "onpage" | "standard"
                test: true
            });

            // 2. Registrar hooks (reciben argumentos con la info del evento)
            checkout.setHooks({
                onCreated: (data) => {
                    console.log("Checkout creado:", data);
                    statusEl.textContent = "Checkout creado.";
                },
                onResponse: (response) => {
                    console.log("Respuesta del pago:", response);
                    statusEl.textContent = "Pago procesado correctamente.";
                },
                onErrors: (error) => {
                    console.error("Error en el pago:", error);
                    statusEl.textContent = "Error al procesar el pago.";
                },
                onClosed: (errors) => {
                    console.log("Checkout cerrado.", errors);
                    statusEl.textContent = "Checkout cerrado.";
                    payBtn.disabled = false;
                }
            });

            // 3. Abrir el checkout
            checkout.open();
        });
    </script>
</body>
</html>
```

```typescript
// PayButton.tsx — React 18+ con TypeScript
// Asegúrate de incluir el script en tu index.html:
// <script src="https://checkout.epayco.co/checkout-v2.js"></script>
import { useEffect, useState } from "react";

declare const ePayco: any;

interface PayButtonProps {
    // sessionId obtenido desde tu backend (ver sección "Creación de la sesión")
    sessionId: string;
}

export default function PayButton({ sessionId }: PayButtonProps) {
    const [scriptReady, setScriptReady] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    // SSR guard + verificación de disponibilidad del script
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (typeof ePayco === "undefined") {
            setMessage("Script de ePayco no cargó correctamente.");
            return;
        }
        setScriptReady(true);
    }, []);

    const handlePayment = () => {
        if (!scriptReady) return;
        setIsLoading(true);

        // 1. Configurar el checkout
        const checkout = ePayco.checkout.configure({
            sessionId,
            type: "onpage",
            test: true
        });

        // 2. Registrar hooks (reciben argumentos con la info del evento)
        checkout.setHooks({
            onCreated: (data: any) => {
                console.log("Checkout creado:", data);
                setMessage("Checkout creado.");
            },
            onResponse: (response: any) => {
                console.log("Respuesta:", response);
                setMessage("Pago procesado.");
            },
            onErrors: (error: any) => {
                console.error("Error:", error);
                setMessage("Error en el pago.");
            },
            onClosed: (errors?: any) => {
                console.log("Cerrado.", errors);
                setMessage("Checkout cerrado.");
                setIsLoading(false);
            }
        });

        // 3. Abrir el checkout
        checkout.open();
    };

    return (
        <div>
            <button onClick={handlePayment} disabled={!scriptReady || isLoading}>
                {isLoading ? "Procesando..." : "Pagar"}
            </button>
            <p role="status" aria-live="polite">{message}</p>
        </div>
    );
}
```

```typescript
// pay-button.component.ts — Angular 16+ standalone
// Incluye el script en tu index.html:
// <script src="https://checkout.epayco.co/checkout-v2.js"></script>
import { Component, Input, OnInit, PLATFORM_ID, inject } from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";

declare const ePayco: any;

@Component({
    selector: "app-pay-button",
    standalone: true,
    imports: [CommonModule],
    template: `
        <button (click)="handlePayment()" [disabled]="!scriptReady || isLoading">
            {{ isLoading ? "Procesando..." : "Pagar" }}
        </button>
        <p role="status" aria-live="polite">{{ message }}</p>
    `
})
export class PayButtonComponent implements OnInit {
    private readonly platformId = inject(PLATFORM_ID);

    // sessionId obtenido desde tu backend (ver sección "Creación de la sesión")
    @Input({ required: true }) sessionId!: string;

    scriptReady = false;
    isLoading = false;
    message = "";

    ngOnInit(): void {
        // SSR guard
        if (!isPlatformBrowser(this.platformId)) return;
        if (typeof ePayco === "undefined") {
            this.message = "Script de ePayco no cargó correctamente.";
            return;
        }
        this.scriptReady = true;
    }

    handlePayment(): void {
        if (!this.scriptReady) return;
        this.isLoading = true;

        // 1. Configurar el checkout
        const checkout = ePayco.checkout.configure({
            sessionId: this.sessionId,
            type: "onpage",
            test: true
        });

        // 2. Registrar hooks (reciben argumentos con la info del evento)
        checkout.setHooks({
            onCreated: (data: any) => {
                console.log("Checkout creado:", data);
                this.message = "Checkout creado.";
            },
            onResponse: (response: any) => {
                console.log("Respuesta:", response);
                this.message = "Pago procesado.";
            },
            onErrors: (error: any) => {
                console.error("Error:", error);
                this.message = "Error en el pago.";
            },
            onClosed: (errors?: any) => {
                console.log("Cerrado.", errors);
                this.message = "Checkout cerrado.";
                this.isLoading = false;
            }
        });

        // 3. Abrir el checkout
        checkout.open();
    }
}
```

```xml
<!-- PayButton.vue — Vue 3 Composition API -->
<!-- Incluye el script en tu index.html:
     <script src="https://checkout.epayco.co/checkout-v2.js"></script> -->
<script setup lang="ts">
import { onMounted, ref } from "vue";

declare const ePayco: any;

// sessionId obtenido desde tu backend (ver sección "Creación de la sesión")
const props = defineProps<{ sessionId: string }>();

const scriptReady = ref(false);
const isLoading = ref(false);
const message = ref("");

onMounted(() => {
    // SSR guard
    if (typeof window === "undefined") return;
    if (typeof ePayco === "undefined") {
        message.value = "Script de ePayco no cargó correctamente.";
        return;
    }
    scriptReady.value = true;
});

function handlePayment() {
    if (!scriptReady.value) return;
    isLoading.value = true;

    // 1. Configurar el checkout
    const checkout = ePayco.checkout.configure({
        sessionId: props.sessionId,
        type: "onpage",
        test: true
    });

    // 2. Registrar hooks (reciben argumentos con la info del evento)
    checkout.setHooks({
        onCreated: (data: any) => {
            console.log("Checkout creado:", data);
            message.value = "Checkout creado.";
        },
        onResponse: (response: any) => {
            console.log("Respuesta:", response);
            message.value = "Pago procesado.";
        },
        onErrors: (error: any) => {
            console.error("Error:", error);
            message.value = "Error en el pago.";
        },
        onClosed: (errors?: any) => {
            console.log("Cerrado.", errors);
            message.value = "Checkout cerrado.";
            isLoading.value = false;
        }
    });

    // 3. Abrir el checkout
    checkout.open();
}
</script>

<template>
    <div>
        <button :disabled="!scriptReady || isLoading" @click="handlePayment">
            {{ isLoading ? "Procesando..." : "Pagar" }}
        </button>
        <p role="status" aria-live="polite">{{ message }}</p>
    </div>
</template>
```

> Nota: Todos los ejemplos usan `test: true` para entorno de pruebas; en producción debe cambiarse a `test: false`. El `sessionId` debe obtenerse previamente desde tu backend siguiendo la sección *Creación de la sesión desde el backend* arriba.

necesidad de token login
El token tiene duración (Expiración)
El token Bearer (JWT) que devuelve el endpoint /login de Apify tiene un tiempo de vida limitado (generalmente 20 minutos según la documentación estándar de JWT de ePayco, donde el campo exp indica su caducidad). Mientras ese tiempo no venza, el token es totalmente válido.

2. Estrategia Recomendada para tu Backend
En lugar de pedir un token nuevo por cada compra, sigue esta lógica en tu servidor:

Primera solicitud (o token vencido):
Tu backend verifica si tiene un token guardado en memoria (o Redis/Cache).
Si no tiene o el que tiene ya expiró, hace la petición POST /login con tus llaves PUBLIC_KEY y PRIVATE_KEY.
Guarda el nuevo token recibido y la hora de expiración en la memoria de tu aplicación. 
Solicitudes siguientes (dentro del tiempo de validez):
Tu backend recibe la petición para crear una sesión de pago.
Verifica que el token en memoria sigue vigente.
Usa ese mismo token guardado para llamar al endpoint payment/session/create.
No hace login de nuevo.
