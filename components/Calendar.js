'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { it } from 'date-fns/locale/it';
import { dateFnsLocalizer, Views } from 'react-big-calendar';
import { getEvents } from '@/lib/crottiData';

const BigCalendar = dynamic(() => import('react-big-calendar').then((mod) => mod.Calendar), {
  ssr: false,
  loading: () => (
    <div className="calendar-loading glass-card" aria-live="polite">
      Caricamento vista...
    </div>
  ),
});

const locales = {
  it,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: it, weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  date: 'Data',
  time: 'Ora',
  event: 'Evento',
  allDay: 'Tutto il giorno',
  week: 'Settimana',
  work_week: 'Settimana lavorativa',
  day: 'Giorno',
  month: 'Mese',
  previous: 'Indietro',
  next: 'Avanti',
  yesterday: 'Ieri',
  tomorrow: 'Domani',
  today: 'Oggi',
  agenda: 'Agenda',
  noEventsInRange: 'Nessun evento in questo intervallo.',
  showMore: (total) => `+${total} altri`,
};

const formats = {
  dayHeaderFormat: (date, culture, formatter) => formatter.format(date, 'EEEE d MMMM', culture),
  dayRangeHeaderFormat: ({ start, end }, culture, formatter) =>
    `${formatter.format(start, 'd MMMM', culture)} - ${formatter.format(end, 'd MMMM yyyy', culture)}`,
  monthHeaderFormat: (date, culture, formatter) => formatter.format(date, 'MMMM yyyy', culture),
  weekdayFormat: (date, culture, formatter) => formatter.format(date, 'EEEEE', culture),
};

const viewLabels = {
  [Views.DAY]: 'Giorno',
  [Views.WEEK]: 'Settimana',
  [Views.MONTH]: 'Mese',
};

function CalendarToolbar({ date, label, onNavigate, onView, view }) {
  return (
    <div className="calendar-toolbar">
      <div className="calendar-toolbar-row">
        <div>
          <span className="calendar-kicker">Programmazione</span>
          <h2>{label}</h2>
        </div>
        <div className="calendar-navigation" aria-label="Navigazione calendario">
          <button type="button" onClick={() => onNavigate('PREV')}>
            Indietro
          </button>
          <button type="button" onClick={() => onNavigate('TODAY')}>
            Oggi
          </button>
          <button type="button" onClick={() => onNavigate('NEXT')}>
            Avanti
          </button>
        </div>
      </div>

      <div className="calendar-toolbar-row calendar-toolbar-bottom">
        <p>{format(date, "EEEE d MMMM yyyy", { locale: it })}</p>
        <div className="calendar-view-switch" role="group" aria-label="Cambia vista calendario">
          {[Views.DAY, Views.WEEK, Views.MONTH].map((calendarView) => (
            <button
              type="button"
              key={calendarView}
              className={view === calendarView ? 'active' : ''}
              aria-pressed={view === calendarView}
              onClick={() => onView(calendarView)}
            >
              {viewLabels[calendarView]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(value) {
  return format(value, 'EEEE d MMMM yyyy, HH:mm', { locale: it });
}

function toCalendarEvent(event) {
  const start = new Date(event.start_at || event.scheduled_date || event.created_at);
  const end = event.end_at ? new Date(event.end_at) : new Date(start.getTime() + 60 * 60 * 1000);

  return {
    id: event.id,
    title: event.title || event.titolo || 'Evento',
    start,
    end,
    resource: {
      type: event.status || event.type || 'Evento',
      location: event.location || event.luogo || 'Non specificato',
      technician: event.technician || event.referente || 'Crotti Safety',
    },
  };
}

export default function EventsCalendar() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notice, setNotice] = useState('Caricamento eventi...');

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      const { data, error } = await getEvents();
      if (!mounted) return;

      if (error) {
        setEvents([]);
        setSelectedEvent(null);
        setNotice(`Eventi non disponibili: ${error.message}`);
        return;
      }

      const calendarEvents = (data || []).map(toCalendarEvent).filter((event) => !Number.isNaN(event.start.getTime()));
      setEvents(calendarEvents);
      setSelectedEvent(calendarEvents[0] || null);
      if (calendarEvents[0]) setDate(calendarEvents[0].start);
      setNotice(calendarEvents.length ? 'Eventi caricati da Supabase.' : 'Nessun evento associato al tuo account.');
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const upcomingEvents = useMemo(
    () => [...events].sort((first, second) => first.start.getTime() - second.start.getTime()),
    [events]
  );

  return (
    <section className="events-layout" aria-label="Calendario eventi Crotti">
      <div className="calendar-panel glass-card">
        <div className="calendar-notice">{notice}</div>
        <BigCalendar
          culture="it"
          date={date}
          defaultView={Views.MONTH}
          endAccessor="end"
          events={events}
          formats={formats}
          localizer={localizer}
          messages={messages}
          onNavigate={setDate}
          onSelectEvent={setSelectedEvent}
          onView={setView}
          popup
          startAccessor="start"
          step={30}
          components={{
            toolbar: CalendarToolbar,
          }}
          view={view}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
        />
      </div>

      <aside className="events-sidebar" aria-label="Dettagli evento">
        <article className="event-detail glass-card">
          {selectedEvent ? (
            <>
              <span className="status-tag">{selectedEvent.resource.type}</span>
              <h2>{selectedEvent.title}</h2>
              <dl>
                <div>
                  <dt>Inizio</dt>
                  <dd>{formatDateTime(selectedEvent.start)}</dd>
                </div>
                <div>
                  <dt>Fine</dt>
                  <dd>{formatDateTime(selectedEvent.end)}</dd>
                </div>
                <div>
                  <dt>Luogo</dt>
                  <dd>{selectedEvent.resource.location}</dd>
                </div>
                <div>
                  <dt>Referente</dt>
                  <dd>{selectedEvent.resource.technician}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="empty-state">
              <strong>Nessun evento</strong>
              <span>Gli eventi assegnati al tuo account appariranno qui.</span>
            </div>
          )}
        </article>

        <div className="event-list glass-card">
          <h2>Prossimi eventi</h2>
          {upcomingEvents.map((event) => (
            <button
              type="button"
              key={`${event.title}-${event.start.toISOString()}`}
              className={selectedEvent?.title === event.title ? 'active' : ''}
              onClick={() => {
                setSelectedEvent(event);
                setDate(event.start);
              }}
            >
              <span>{format(event.start, 'dd MMM', { locale: it })}</span>
              <strong>{event.title}</strong>
              <small>{format(event.start, 'HH:mm', { locale: it })}</small>
            </button>
          ))}
          {!upcomingEvents.length && <span className="empty-inline">Nessun evento pianificato.</span>}
        </div>
      </aside>
    </section>
  );
}
