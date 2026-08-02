export const EVENT_ID = 'la-convencion-egresados-utp-2026';

export const AUDIT_ACTIONS = {
  TICKET_TYPE_CREADO: 'Tipo de entrada creado',
  TICKET_TYPE_PRECIO_ACTUALIZADO: 'Tipo de entrada precio actualizado',
  TICKET_TYPE_ESTADO_ACTUALIZADO: 'Tipo de entrada estado actualizado',
  TICKET_TYPE_NOMBRE_ACTUALIZADO: 'Tipo de entrada nombre actualizado',
  TICKET_TYPE_DESCRIPCION_ACTUALIZADA: 'Tipo de entrada descripción actualizada',
  TICKET_TYPE_CANTIDAD_TOTAL_ACTUALIZADA: 'Tipo de entrada cantidad total actualizada',
  TICKET_TYPE_MAXIMO_POR_USUARIO_ACTUALIZADO: 'Tipo de entrada máximo por usuario actualizado',
  TICKET_TYPE_VENTANA_VENTA_ACTUALIZADA: 'Tipo de entrada ventana de venta actualizada',
  TICKET_TYPE_FLAG_EGRESADO_ACTUALIZADO: 'Tipo de entrada flag egresado actualizado',
  TICKET_TYPE_ZONA_ACTUALIZADA: 'Tipo de entrada zona actualizada',
  ENTRADA_CHECK_IN_REALIZADO: 'Entrada check-in realizado',
  ENTRADA_CONFIRMACION_SOLICITADA: 'Entrada confirmación solicitada',
  ENTRADA_CANCELADA: 'Entrada cancelada',
  PAGO_ESTADO_CAMBIADO: 'Pago estado cambiado',
  ADMIN_CREO_PAGO_MANUAL: 'Admin creó pago manual',
  USUARIO_CREADO: 'Usuario creado',
  USUARIO_ACTUALIZADO: 'Usuario actualizado',
  USUARIO_ESTADO_CAMBIADO: 'Usuario estado cambiado',
  USUARIO_ROL_CAMBIADO: 'Usuario rol cambiado',
} as const;

export const AUDIT_ENTITY_TYPES = {
  TIPO_ENTRADA: 'Tipo de entrada',
  ENTRADA: 'Entrada',
  PAGOS: 'Pagos',
  USUARIOS: 'Usuarios',
} as const;

export const AUDIT_FIELD_BEFORE = 'valorAnterior';
export const AUDIT_FIELD_AFTER = 'valorNuevo';
