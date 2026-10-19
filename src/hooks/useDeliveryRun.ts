import { useState, useEffect, useCallback } from 'react';
import { showAlert } from '@daloa/ui';
import { deliveryService, supabase, PUBLIC_USER_COLUMNS, attachContactPhones } from '@daloa/api';
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
        .select('*')
        .eq('id', assignmentId)
        .maybeSingle();

      if (byId) {
        assignData = byId;
      } else {
        const { data: byOrder } = await supabase
          .from('delivery_assignments')
          .select('*')
          .eq('order_id', assignmentId)
          .maybeSingle();
        assignData = byOrder;
      }

      if (!assignData) throw new Error('Course introuvable');

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .select(
          `*, seller:seller_id(${PUBLIC_USER_COLUMNS}), buyer:buyer_id(${PUBLIC_USER_COLUMNS}), listings:listing_id(*)`
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
