import { useMemo, useState } from "react";

const MONTH_NAMES = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

function parseIso(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(viewYear, viewMonth) {
  const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(viewYear, viewMonth, day));
  }

  return cells;
}

export function dateTimeToIso(date, hours, minutes) {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

export function isoToDateTimeParts(iso) {
  const d = parseIso(iso);
  if (!d) {
    const now = new Date();
    return {
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      hours: 12,
      minutes: 0,
    };
  }
  return {
    date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
    hours: d.getHours(),
    minutes: d.getMinutes(),
  };
}

export default function InlineDateTimePicker({ isoValue, onChange }) {
  const initial = isoToDateTimeParts(isoValue);
  const [viewYear, setViewYear] = useState(initial.date.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.date.getMonth());
  const [selectedDate, setSelectedDate] = useState(initial.date);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [hoursText, setHoursText] = useState(String(initial.hours).padStart(2, "0"));
  const [minutesText, setMinutesText] = useState(String(initial.minutes).padStart(2, "0"));

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const calendarDays = useMemo(
    () => buildCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  function emitChange(date, h, m) {
    onChange(dateTimeToIso(date, h, m));
  }

  function selectDay(day) {
    setSelectedDate(day);
    emitChange(day, hours, minutes);
  }

  function changeHours(text) {
    const digits = text.replace(/\D/g, "").slice(0, 2);
    setHoursText(digits);
    if (digits === "") return;
    const h = Math.min(23, Number(digits));
    setHours(h);
    emitChange(selectedDate, h, minutes);
  }

  function blurHours() {
    const h = Math.max(0, Math.min(23, Number(hoursText) || 0));
    setHours(h);
    setHoursText(String(h).padStart(2, "0"));
    emitChange(selectedDate, h, minutes);
  }

  function changeMinutes(text) {
    const digits = text.replace(/\D/g, "").slice(0, 2);
    setMinutesText(digits);
    if (digits === "") return;
    const m = Math.min(59, Number(digits));
    setMinutes(m);
    emitChange(selectedDate, hours, m);
  }

  function blurMinutes() {
    const m = Math.max(0, Math.min(59, Number(minutesText) || 0));
    setMinutes(m);
    setMinutesText(String(m).padStart(2, "0"));
    emitChange(selectedDate, hours, m);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  return (
    <div className="dtp">
      <div className="dtp-header">
        <button type="button" className="dtp-nav" onClick={prevMonth} aria-label="Предишен месец">
          ‹
        </button>
        <span className="dtp-month">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" className="dtp-nav" onClick={nextMonth} aria-label="Следващ месец">
          ›
        </button>
      </div>

      <div className="dtp-weekdays">
        {WEEKDAYS.map((name) => (
          <span key={name} className="dtp-weekday">
            {name}
          </span>
        ))}
      </div>

      <div className="dtp-grid">
        {calendarDays.map((day, i) =>
          day ? (
            <button
              key={`${viewYear}-${viewMonth}-${day.getDate()}`}
              type="button"
              className={[
                "dtp-day",
                sameDay(day, today) && "dtp-day-today",
                sameDay(day, selectedDate) && "dtp-day-selected",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectDay(day)}
            >
              {day.getDate()}
            </button>
          ) : (
            <span key={`empty-${i}`} className="dtp-day dtp-day-empty" />
          )
        )}
      </div>

      {selectedDate && (
        <div className="dtp-selected-label">
          {selectedDate.toLocaleDateString("bg-BG", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      )}

      <div className="dtp-time">
        <span className="dtp-time-label">Час</span>
        <input
          type="text"
          className="dtp-time-input"
          inputMode="numeric"
          maxLength={2}
          value={hoursText}
          onChange={(e) => changeHours(e.target.value)}
          onBlur={blurHours}
        />
        <span className="dtp-time-sep">:</span>
        <input
          type="text"
          className="dtp-time-input"
          inputMode="numeric"
          maxLength={2}
          value={minutesText}
          onChange={(e) => changeMinutes(e.target.value)}
          onBlur={blurMinutes}
        />
      </div>
    </div>
  );
}
