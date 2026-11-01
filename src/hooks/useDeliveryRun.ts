import { useState, useEffect, useCallback } from 'react';
import { showAlert } from '@daloa/ui';
import { Haptics } from '@daloa/utils';
import {
  deliveryService,
  supabase,
  PUBLIC_USER_COLUMNS,
  SAFE_DELIVERY_ASSIGNMENT_COLUMNS,
  attachContactPhones,
} from '@daloa/api';
import { isDemoRun, createDemoRunDetails } from '../services/demoRunService';

interface UseDeliveryRunResult {
  assignment: any;
  order: any;
  loading: boolean;
  isDemo: boolean;
  demoStatus: string;
  setDemoStatus: (status: string) => void;
  fetchRunData: () => Promise<void>;
  reportIncident: (reason: string) => Promise<void>;
  isSubmittingIncident: boolean;
}

export function useDeliveryRun(assignmentId?: string): UseDeliveryRunResult {
  const isDemo = isDemoRun(assignmentId);
  const [demoStatus, setDemoStatus] = useState<string>('accepted');
  const [assignment, setAssignment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const fetchRunData = useCallback(async () => {
    if (!assignmentId) return;

    if (isDemo) {
      const demo = createDemoRunDetails(demoStatus);
      setAssignment(demo.assignment);
      setOrder(demo.order);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let assignData: any = null;

      const { data: byId } = await supabase
        .from('delivery_assignments')
        .select(SAFE_DELIVERY_ASSIGNMENT_COLUMNS)
        .eq('id', assignmentId)
        .maybeSingle();

      if (byId) {
        assignData = byId;
      } else {
        const { data: byOrder } = await supabase
          .from('delivery_assignments')
          .select(SAFE_DELIVERY_ASSIGNMENT_COLUMNS)
          .eq('order_id', assignmentId)
          .maybeSingle();
        assignData = byOrder;
      }

      if (!assignData) throw new Error('Course introuvable');

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select(
          `*, seller:seller_id(${PUBLIC_USER_COLUMNS}), buyer:buyer_id(${PUBLIC_USER_COLUMNS}), listings:listing_id(*), order_items(id, quantity, unit_price, product_amount, selected_variants, listings:listing_id(title, photos))`
        )
        .eq('id', assignData.order_id)
        .single();

      if (orderErr) throw orderErr;

      await attachContactPhones([
        (orderData as any).seller,
        (orderData as any).buyer,
      ]);

      setAssignment(assignData);
      setOrder(orderData);
    } catch (err: any) {
      showAlert('Erreur', err.message || 'Impossible de charger les détails de la course.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, isDemo, demoStatus]);

  useEffect(() => {
    fetchRunData();
  }, [fetchRunData]);

  useEffect(() => {
    if (isDemo || !assignment?.id) return;
    const channel = supabase
      .channel(`driver-run-v2-${assignment.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'delivery_assignments', filter: `id=eq.${assignment.id}` },
        (payload) => {
          const next = payload.new as any;
          setAssignment((prev: any) => (prev ? { ...prev, ...next } : next));
          if (next.status === 'cancelled') {
            Haptics.warning();
            showAlert('Course annulée', 'La commande associée a été annulée. Ne vous déplacez plus.');
          } else if (next.status === 'disputed') {
            Haptics.warning();
            showAlert('Litige ouvert', 'Un litige a été ouvert sur cette course.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isDemo, assignment?.id]);

  const reportIncident = useCallback(
    async (reason: string): Promise<void> => {
      if (!assignment?.id) return;

      if (isDemo) {
        showAlert(
          'Incident démo signalé',
          'En conditions réelles, le support logistique DaloaDelivery est immédiatement alerté.'
        );
        return;
      }

      try {
        setIsSubmittingIncident(true);
        await deliveryService.reportIncident(assignment.id, reason);
        await fetchRunData();
        showAlert('Incident signalé', 'Le support logistique DaloaDelivery a été alerté.');
      } catch (err: any) {
        showAlert('Erreur', err.message || 'Impossible de signaler l’incident.');
      } finally {
        setIsSubmittingIncident(false);
      }
    },
    [assignment?.id, isDemo, fetchRunData]
  );

  return {
    assignment,
    order,
    loading,
    isDemo,
    demoStatus,
    setDemoStatus,
    fetchRunData,
    reportIncident,
    isSubmittingIncident,
  };
}
