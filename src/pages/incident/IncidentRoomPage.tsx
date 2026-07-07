import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RequireAuth } from '../../components/auth/RequireAuth';
import { IncidentDialoguePanel } from '../../components/incident/IncidentDialoguePanel';
import { IncidentItemForm } from '../../components/incident/IncidentItemForm';
import { IncidentLedgerPanel } from '../../components/incident/IncidentLedgerPanel';
import { IncidentModerationControls } from '../../components/incident/IncidentModerationControls';
import { IncidentRoomSkeleton } from '../../components/incident/IncidentRoomSkeleton';
import { IncidentSeverityBadge } from '../../components/incident/IncidentSeverityBadge';
import { IncidentStatusCards } from '../../components/incident/IncidentStatusCards';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useIncidentRoom } from '../../hooks/useIncidentRoom';
import { INCIDENT_ROOM_STATUS_LABELS, type IncidentLane } from '../../lib/incident/types';

function IncidentRoomPageContent() {
  const { slug } = useParams<{ slug: string }>();
  const roomQ = useIncidentRoom(slug);
  const [laneFilter, setLaneFilter] = useState<IncidentLane | 'all'>('all');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const visibleItems = useMemo(
    () =>
      (roomQ.data?.items ?? []).filter((item) =>
        roomQ.isModerator ? true : item.moderation_state !== 'removed',
      ),
    [roomQ.data?.items, roomQ.isModerator],
  );

  const selectedItem = visibleItems.find((item) => item.id === selectedItemId) ?? null;

  if (roomQ.isPending) {
    return (
      <main className="mx-auto max-w-[90rem] px-gutter py-8">
        <IncidentRoomSkeleton />
      </main>
    );
  }

  if (roomQ.isError || !roomQ.data) {
    return (
      <main className="mx-auto max-w-3xl px-gutter py-16">
        <EmptyState
          heading="Room unavailable"
          body="This incident room may be archived or you may not have access yet."
          action={
            <Link
              to="/incident"
              className="focus-ring inline-flex min-h-[44px] items-center text-brand underline-offset-4 hover:underline"
            >
              Return to incident rooms
            </Link>
          }
        />
      </main>
    );
  }

  const { room, threads, messages } = roomQ.data;
  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0] ?? null;

  return (
    <main className="mx-auto max-w-[90rem] px-gutter py-8">
      <header className="mb-8 space-y-4 border-b border-line pb-6">
        <Link
          to="/incident"
          className="focus-ring inline-flex min-h-[44px] items-center text-app-meta text-brand underline-offset-4 hover:underline"
        >
          ← All incident rooms
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="font-mono text-app-meta uppercase tracking-[0.14em] text-brand">
              Incident dialogue room
            </p>
            <h1 className="font-display text-page-title font-semibold text-ink md:text-h3">
              {room.title}
            </h1>
            <p className="mt-3 text-app-body leading-relaxed text-ink-secondary">
              {room.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant={room.status === 'active' ? 'live' : 'archived'}>
              {INCIDENT_ROOM_STATUS_LABELS[room.status]}
            </StatusBadge>
            <IncidentSeverityBadge tier={room.severity_tier} />
          </div>
        </div>
        <p className="max-w-3xl text-app-body text-ink-secondary">
          Post responsibly: avoid graphic detail in summaries, attach sources for factual claims,
          and never share personal contact information in dialogue.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,18rem)]">
        <IncidentLedgerPanel
          items={visibleItems}
          laneFilter={laneFilter}
          onLaneFilterChange={setLaneFilter}
          selectedItemId={selectedItemId}
          onSelectItem={(item) => {
            setSelectedItemId(item.id);
            const linkedThread = threads.find((thread) => thread.item_id === item.id);
            if (linkedThread) setActiveThreadId(linkedThread.id);
          }}
        />

        <div className="space-y-6">
          <IncidentDialoguePanel
            threads={threads}
            messages={messages}
            items={visibleItems}
            activeThreadId={activeThread?.id ?? null}
            onSelectThread={setActiveThreadId}
            onOpenThread={async (input) => {
              const thread = await roomQ.openThread.mutateAsync(input);
              setActiveThreadId(thread.id);
            }}
            onSendMessage={async (input) => {
              await roomQ.sendMessage.mutateAsync({
                ...input,
                isFacilitator: roomQ.isStaff,
              });
            }}
            onPauseThread={async (threadId) => {
              await roomQ.setThreadStatus.mutateAsync({ threadId, status: 'paused' });
              toast.success('Thread paused.');
            }}
            onResolveThread={async (threadId) => {
              await roomQ.setThreadStatus.mutateAsync({ threadId, status: 'resolved' });
              toast.success('Thread resolved.');
            }}
            canModerate={roomQ.isStaff}
            canPost={roomQ.isStaff || roomQ.data.participantRole === 'participant'}
          />

          {roomQ.isStaff ? (
            <IncidentItemForm
              disabled={roomQ.addItem.isPending}
              onSubmit={async (input) => {
                await roomQ.addItem.mutateAsync(input);
              }}
            />
          ) : null}

          {roomQ.isModerator && selectedItem ? (
            <IncidentModerationControls
              item={selectedItem}
              disabled={roomQ.moderateItem.isPending}
              onSave={async (patch) => {
                await roomQ.moderateItem.mutateAsync({
                  itemId: selectedItem.id,
                  patch,
                });
              }}
            />
          ) : null}
        </div>

        <IncidentStatusCards room={room} items={visibleItems} />
      </div>
    </main>
  );
}

export function IncidentRoomPage() {
  return (
    <RequireAuth>
      <IncidentRoomPageContent />
    </RequireAuth>
  );
}
