import { useEffect } from 'react';
import type { RolNombre } from '@/types';
import { subscribeToDataChanges } from '@/lib/dataSync';
import { useAdminStore } from '@/stores/adminStore';
import { useAlmacenStore } from '@/stores/almacenStore';
import { useComprobanteStore } from '@/stores/comprobanteStore';
import { usePedidoStore } from '@/stores/pedidoStore';
import { useReservaStore } from '@/stores/reservaStore';

const AUTO_REFRESH_INTERVAL_MS = 3000;
const EVENT_REFRESH_RETRY_MS = 1200;

const refreshByRole = async (role?: RolNombre) => {
  switch (role) {
    case 'ADMINISTRADOR': {
      const admin = useAdminStore.getState();
      await Promise.allSettled([
        admin.fetchDashboardStats(),
        admin.fetchProductos(),
        admin.fetchInsumos(),
        admin.fetchCategorias(),
        admin.fetchMesas(),
      ]);
      break;
    }
    case 'ALMACENERO': {
      const almacen = useAlmacenStore.getState();
      await Promise.allSettled([
        almacen.fetchEntradas(),
        almacen.fetchInsumos(),
        almacen.fetchProductos(),
      ]);
      break;
    }
    case 'MOZO': {
      const pedidos = usePedidoStore.getState();
      const comprobantes = useComprobanteStore.getState();
      await Promise.allSettled([
        pedidos.fetchPedidos(),
        comprobantes.fetchComprobantes(),
        comprobantes.fetchMesasOcupadas(),
      ]);
      break;
    }
    case 'COCINERO':
    case 'BARTENDER': {
      const pedidos = usePedidoStore.getState();
      await pedidos.fetchPedidos();
      break;
    }
    case 'CAJERO': {
      const comprobantes = useComprobanteStore.getState();
      await Promise.allSettled([comprobantes.fetchComprobantes(), comprobantes.fetchMesasOcupadas()]);
      break;
    }
    case 'RECEPCIONISTA': {
      const reservas = useReservaStore.getState();
      await Promise.allSettled([reservas.fetchReservas(), reservas.fetchTransacciones()]);
      break;
    }
    case 'CLIENTE': {
      const reservas = useReservaStore.getState();
      await reservas.fetchReservasByUsuario();
      break;
    }
    default:
      break;
  }
};

export const useDataAutoRefresh = (role?: RolNombre, enabled = false) => {
  useEffect(() => {
    if (!enabled || !role) return;

    let retryTimer: number | null = null;

    const refresh = () => {
      void refreshByRole(role);
    };

    const refreshFromEvent = () => {
      refresh();

      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }

      retryTimer = window.setTimeout(() => {
        refresh();
      }, EVENT_REFRESH_RETRY_MS);
    };

    refresh();

    const timer = window.setInterval(refresh, AUTO_REFRESH_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    const unsubscribe = subscribeToDataChanges(refreshFromEvent);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      unsubscribe();
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [enabled, role]);
};