import { useEffect, useState } from 'react';
import { moderatorsService } from '../services/moderators.service';
import { useSession } from '../hooks/useSession';
import { useDbClient } from '../hooks/useDbClient';

type TabKey = 'world' | 'characters' | 'coteries' | 'admin';

export default function WorldDashboard() {
  const { session } = useSession();
  const client = useDbClient();

  const [isModerator, setIsModerator] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [tab, setTab] = useState<TabKey>('world');

  const isStOrAdmin =
    session.role === 'st' || session.role === 'admin';

  useEffect(() => {
    let mounted = true;

    async function checkModerator() {
      if (!client || !session) {
        if (mounted) {
          setIsModerator(false);
          setLoadingAdmin(false);
        }
        return;
      }

      if (isStOrAdmin) {
        if (mounted) {
          setIsModerator(true);
          setLoadingAdmin(false);
        }
        return;
      }

      try {
        const result = await moderatorsService.isModerator(
          client,
          session.engine_id,
          session.user_id,
        );

        if (mounted) {
          setIsModerator(Boolean(result));
        }
      } catch {
        if (mounted) {
          setIsModerator(false);
        }
      } finally {
        if (mounted) {
          setLoadingAdmin(false);
        }
      }
    }

    checkModerator();

    return () => {
      mounted = false;
    };
  }, [client, session, isStOrAdmin]);

  const showAdmin = !loading