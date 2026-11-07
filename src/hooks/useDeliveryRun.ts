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

interface UseDeliveryRunResult {
  assignment: any;
  order: any;
  loading: boolean;
  fetchRunData: () => Promise<void>;
  reportIncident: (reason: string) => Promise<void>;
  isSubmittingIncident: boolean;
  releaseRun: () => Promise<boolean>;
  isReleasingRun: boolean;
}

export function useDeliveryRun(assignmentId?: string): UseDeliveryRunResult {
  const [assignment, setAssignment] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);
  const [isReleasingRun, setIsReleasingRun] = useState(false);

  const fetchRunData = useCallback(async () => {
    if (!assignmentId) return;

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
  }, [assignmentId]);

  useEffect(() => {
    fetchRunData();
  }, [fetchRunData]);

  useEffect(() => {
    if (!assignment?.id) return;
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
          } else if (next.status === 'awaiting_pickup' && !next.delivery_person_id) {
            Haptics.warning();
            showAlert(
              'Course remise en ligne',
              'Le délai de retrait chez le vendeur (3h30) est dépassé ou la course a été libérée.'
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assignment?.id]);

  const reportIncident = useCallback(
    async (reason: string): Promise<void> => {
      if (!assignment?.id) return;

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
    [assignment?.id, fetchRunData]
  );

  const releaseRun = useCallback(async (): Promise<boolean> => {
    if (!assignment?.id) return false;
    try {
      setIsReleasingRun(true);
      await deliveryService.releaseRun(assignment.id);
      Haptics.warning();
      return true;
    } catch (err: any) {
      showAlert('Impossible de libérer la course', err.message || 'Réessayez dans un instant.');
      return false;
    } finally {
      setIsReleasingRun(false);
    }
  }, [assignment?.id]);

  return {
    assignment,
    order,
    loading,
    fetchRunData,
    reportIncident,
    isSubmittingIncident,
    releaseRun,
    isReleasingRun,
  };
}
