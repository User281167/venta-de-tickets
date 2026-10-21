-- Run once in the Supabase SQL editor. Broadcast only the public counter fields.
CREATE OR REPLACE FUNCTION public.broadcast_donation_counter_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object(
      'currentValue', NEW.current_value,
      'metaValue', NEW.meta_value,
      'updatedAt', NEW.updated_at
    ),
    'UPDATE',
    'donation-counter:public',
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER donation_counter_realtime_trigger
AFTER INSERT OR UPDATE ON public.donation_counter
FOR EACH ROW
EXECUTE FUNCTION public.broadcast_donation_counter_update();

CREATE POLICY "anon_can_receive_donation_counter_broadcast"
ON realtime.messages
FOR SELECT
TO anon
USING (realtime.topic() = 'donation-counter:public');
