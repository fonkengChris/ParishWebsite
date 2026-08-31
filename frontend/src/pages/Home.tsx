import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import {
  announcementsAPI,
  eventsAPI,
  saintsAPI,
  liturgicalColorAPI,
  type LiturgicalColorResponse,
} from "../services/api";
import { POPE, getBishopsForDiocese } from "../data/churchLeadership";
import { useTheme } from "../contexts/ThemeContext";
import { useParish } from "../contexts/ParishContext";
import { useSiteContent } from "../contexts/SiteContentContext";
import { fillParishTokens } from "../data/defaultSiteContent";
import type { Announcement, Event, SaintDay } from "../types";

// Turn a liturgical colour into the phrase the Church would use for the season.
function seasonPhrase(color?: string): string {
  switch ((color || "").toLowerCase()) {
    case "green":
      return "Ordinary Time";
    case "purple":
    case "violet":
      return "A Season of Preparation";
    case "white":
      return "A Feast of the Church";
    case "gold":
      return "A Solemnity of the Lord";
    case "red":
      return "A Feast of Martyrs & the Spirit";
    case "rose":
      return "Gaudete · Laetare";
    default:
      return "The Church's Year";
  }
}

function saintTypeLabel(type: string): string {
  switch (type) {
    case "feast":
      return "Feast";
    case "memorial":
      return "Memorial";
    case "optional":
      return "Optional Memorial";
    default:
      return "Saint of the Day";
  }
}

export default function Home() {
  const { liturgicalColor } = useTheme();
  const { parish } = useParish();
  const { content } = useSiteContent();
  const home = content.home;
  const t = (s: string) => fillParishTokens(s, parish);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [saintOfTheDay, setSaintOfTheDay] = useState<SaintDay | null>(null);
  const [upcomingFeasts, setUpcomingFeasts] = useState<SaintDay[]>([]);
  const [feastColors, setFeastColors] = useState<
    Record<string, LiturgicalColorResponse>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsData, eventsData, saintsData] = await Promise.all([
          announcementsAPI.getAll(),
          eventsAPI.getAll(),
          saintsAPI.getAll(9),
        ]);

        setAnnouncements(announcementsData.slice(0, 3));

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        const upcomingEvents = eventsData
          .filter((event) => {
            const eventDate = new Date(event.startDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today && eventDate <= sevenDaysLater;
          })
          .slice(0, 3);

        setEvents(upcomingEvents);
        setSaintOfTheDay(saintsData.today);
        setUpcomingFeasts(saintsData.upcoming);

        const colorPromises = saintsData.upcoming.map(async (feastDay) => {
          try {
            const color = await liturgicalColorAPI.getByDate(feastDay.date);
            return { date: feastDay.date, color };
          } catch (error) {
            console.error(`Error fetching color for ${feastDay.date}:`, error);
            return null;
          }
        });

        const colorResults = await Promise.all(colorPromises);
        const colorsMap: Record<string, LiturgicalColorResponse> = {};
        colorResults.forEach((result) => {
          if (result) colorsMap[result.date] = result.color;
        });
        setFeastColors(colorsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const season = seasonPhrase(liturgicalColor?.color);
  const todaySaint = saintOfTheDay?.saints?.[0];
  const bishops = getBishopsForDiocese(parish.diocese);
  const leaders = [POPE, ...bishops];

  return (
    <Layout>
      {/* ============ HERO — welcome + today in the liturgical year ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 lg:pt-20 lg:pb-12">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <div className="lit-soft-panel inline-flex items-center gap-2.5 rounded-full pl-3 pr-4 py-1.5 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600" aria-hidden="true"></span>
              <span className="text-sm font-semibold text-primary-800">
                {todayLabel} · {season}
              </span>
            </div>
            <h1 className="font-serif font-medium text-ink leading-[1.02] tracking-tight text-[2.75rem] sm:text-6xl lg:text-[4.5rem]">
              {t(home.heroHeadingLead)}{" "}
              <em className="italic text-primary-700">{t(home.heroHeadingEmph)}</em>.
            </h1>
            <p className="mt-6 text-lg text-ink-soft max-w-[48ch]">
              {t(home.heroSubhead)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                to="/mass-schedule"
                className="inline-flex items-center px-6 py-3.5 rounded-full font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                View Mass Times
              </Link>
              <Link
                to="/about-us"
                className="inline-flex items-center px-6 py-3.5 rounded-full font-semibold text-ink bg-white border border-line hover:border-primary-600 transition-all duration-200"
              >
                New here? Start here
              </Link>
            </div>
          </div>

          {/* Right — arched image + floating saint card */}
          <div className="relative">
            <div className="arch-frame aspect-[4/5] max-w-[420px] mx-auto lg:mr-0">
              <img
                src={parish.assets.heroUrl || "/images/church.jpeg"}
                alt={`${parish.name} church`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute left-2 sm:-left-4 bottom-8 bg-white border border-line rounded-2xl p-4 pr-5 shadow-xl max-w-[250px]">
              <p className="text-[0.62rem] tracking-[0.18em] uppercase font-bold text-gold">
                {todaySaint ? saintTypeLabel(todaySaint.type) : "The Church's Calendar"}
              </p>
              <h3 className="font-serif font-semibold text-lg text-ink mt-1 leading-snug">
                {saintOfTheDay?.saints?.length
                  ? saintOfTheDay.saints.map((s) => s.name).join(" & ")
                  : season}
              </h3>
              {todaySaint?.description && todaySaint.type !== "none" && (
                <p className="text-xs text-ink-soft mt-1 line-clamp-3">
                  {todaySaint.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SHEPHERDS — the Holy Father & the local Bishop ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="lit-soft-panel rounded-3xl px-6 py-8 sm:px-10">
          <p className="text-[0.66rem] tracking-[0.2em] uppercase font-bold text-primary-700 text-center mb-6">
            In Communion With Our Shepherds
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {leaders.map((leader) => (
              <div key={leader.name} className="flex items-center gap-4 min-w-0">
                <span className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-gold ring-offset-2 ring-offset-ivory-2 bg-white">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-full h-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif font-semibold text-lg text-ink leading-snug">
                    {leader.name}
                  </h3>
                  <p className="text-sm text-ink-soft mt-0.5">{leader.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ QUICK ROW ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              to: "/mass-schedule",
              k: "Sunday Mass",
              h: "7:00 & 9:30 AM",
              p: "Saturday Vigil at 6:00 PM.",
            },
            {
              to: "/confession",
              k: "Confession",
              h: "Saturdays, 5 PM",
              p: "Or by appointment with the priest.",
            },
            {
              to: "/donations",
              k: "Support the Parish",
              h: "Give Online",
              p: "Sustain the mission and care of the sick.",
            },
          ].map((c) => (
            <Link
              key={c.k}
              to={c.to}
              className="group bg-white border border-line rounded-2xl p-6 hover:border-primary-600 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-200"
            >
              <p className="text-[0.66rem] tracking-[0.16em] uppercase font-bold text-primary-700">
                {c.k}
              </p>
              <h3 className="font-serif font-semibold text-2xl text-ink mt-1">{c.h}</h3>
              <p className="text-sm text-ink-soft mt-1">{c.p}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ SIGNATURE MOMENT — the Sanctuary arch-of-light band ============ */}
      <section className="sanctuary-band">
        <div className="s-bg">
          <img src="/images/inside-view.jpeg" alt="Interior of the parish at prayer" />
        </div>
        <div className="s-arch" aria-hidden="true"></div>
        <div className="s-inner max-w-3xl mx-auto text-center px-4 sm:px-6 py-24 sm:py-28">
          <p className="s-eyebrow text-xs tracking-[0.28em] uppercase font-bold text-primary-100 mb-5">
            {t(home.sanctuaryEyebrow)}
          </p>
          <h2 className="font-display font-semibold text-white leading-[1.08] text-4xl sm:text-5xl">
            {t(home.sanctuaryHeadingLead)}{" "}
            <em className="italic text-primary-200">{t(home.sanctuaryHeadingEmph)}</em>
          </h2>
          <p className="mt-5 text-stone-ivory text-lg max-w-[46ch] mx-auto">
            {t(home.sanctuaryBody)}
          </p>
          <Link
            to="/mass-schedule"
            className="mt-8 inline-block px-8 py-4 rounded-sm bg-primary-400 text-stone font-bold text-xs tracking-[0.16em] uppercase hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200"
          >
            Adoration &amp; Confession Times
          </Link>
          <div className="mt-11 flex flex-wrap justify-center divide-x divide-white/10">
            {[
              { t: "6:30 AM", l: "Daily Mass" },
              { t: "Fri · 5 PM", l: "Adoration" },
              { t: "Sat · 5 PM", l: "Confession" },
            ].map((h) => (
              <div key={h.l} className="px-7">
                <div className="s-hour font-display text-2xl text-white">{h.t}</div>
                <div className="s-hour text-[0.66rem] tracking-[0.18em] uppercase font-bold text-stone-ivory mt-1">
                  {h.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GROW IN FAITH ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700">Formation</p>
          <h2 className="font-serif font-medium text-ink text-4xl md:text-5xl mt-2">
            {t(home.formationHeading)}
          </h2>
          <p className="text-ink-soft mt-3">
            {t(home.formationSubhead)}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative bg-white border border-line rounded-3xl p-9 overflow-hidden">
            <span className="absolute top-0 left-8 h-1.5 rounded-b-md bg-primary-600" style={{ width: "3.25rem" }} aria-hidden="true"></span>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mt-3">
              {home.scriptureCard.eyebrow}
            </p>
            <h3 className="font-serif font-semibold text-2xl text-ink mt-2 mb-3">
              {home.scriptureCard.title}
            </h3>
            <p className="text-ink-soft mb-5 leading-relaxed">
              {home.scriptureCard.body}
            </p>
            <a
              href={home.scriptureCard.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-primary-700 hover:text-primary-900 inline-flex items-center gap-2"
            >
              {home.scriptureCard.linkLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="relative bg-white border border-line rounded-3xl p-9 overflow-hidden">
            <span className="absolute top-0 left-8 h-1.5 rounded-b-md bg-primary-600" style={{ width: "3.25rem" }} aria-hidden="true"></span>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700 mt-3">
              {home.doctrineCard.eyebrow}
            </p>
            <h3 className="font-serif font-semibold text-2xl text-ink mt-2 mb-3">
              {home.doctrineCard.title}
            </h3>
            <p className="text-ink-soft mb-5 leading-relaxed">
              {home.doctrineCard.body}
            </p>
            <a
              href={home.doctrineCard.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-primary-700 hover:text-primary-900 inline-flex items-center gap-2"
            >
              {home.doctrineCard.linkLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ NEWS / EVENTS + UPCOMING FEASTS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: news & events */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700">
              From the Parish
            </p>
            <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mt-2 mb-2">
              Latest News &amp; Events
            </h2>
            <div className="flex gap-2 mb-7">
              <Link
                to="/announcements"
                className="text-sm font-bold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
              >
                All Announcements <span aria-hidden="true">→</span>
              </Link>
              <Link
                to="/events"
                className="text-sm font-bold text-primary-700 hover:text-primary-900 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
              >
                All Events <span aria-hidden="true">→</span>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-11 w-11 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="text-ink-soft text-sm font-medium mt-4">Loading content…</p>
              </div>
            ) : announcements.length === 0 && events.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-3xl border border-line">
                <p className="text-ink-soft font-medium">
                  No announcements or events at this time. Please check back soon.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {announcements.map((announcement) => (
                  <Link
                    key={announcement._id}
                    to={`/announcements/${announcement._id}`}
                    className="group flex gap-0 bg-white rounded-2xl overflow-hidden border border-line hover:border-primary-600 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-200"
                  >
                    <div className="relative w-32 sm:w-40 flex-shrink-0 bg-primary-600 overflow-hidden">
                      {announcement.image ? (
                        <img
                          src={announcement.image}
                          alt={announcement.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-serif text-white/90 text-3xl">✝</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-primary-800 text-[0.6rem] font-bold rounded-full uppercase tracking-wide">
                        News
                      </span>
                    </div>
                    <div className="p-5 min-w-0">
                      <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-primary-800 transition-colors line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-sm text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                        {announcement.content}
                      </p>
                      <p className="text-xs font-bold text-primary-700 mt-3">
                        {new Date(announcement.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                ))}

                {events.map((event) => (
                  <Link
                    key={event._id}
                    to="/events"
                    className="group flex gap-0 bg-white rounded-2xl overflow-hidden border border-line hover:border-primary-600 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-200"
                  >
                    <div className="relative w-32 sm:w-40 flex-shrink-0 bg-gold/90 overflow-hidden flex items-center justify-center">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-center text-white">
                          <div className="font-display text-2xl leading-none">
                            {new Date(event.startDate).toLocaleDateString("en-US", { day: "numeric" })}
                          </div>
                          <div className="text-[0.6rem] font-bold uppercase tracking-widest mt-0.5">
                            {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-gold text-[0.6rem] font-bold rounded-full uppercase tracking-wide">
                        Event
                      </span>
                    </div>
                    <div className="p-5 min-w-0">
                      <h3 className="font-serif font-semibold text-lg text-ink group-hover:text-primary-800 transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-ink-soft mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                      <p className="text-xs font-bold text-primary-700 mt-3">
                        {new Date(event.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: upcoming feasts */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-primary-700">
              The Calendar
            </p>
            <h2 className="font-serif font-medium text-ink text-3xl md:text-4xl mt-2 mb-7">
              Upcoming Feasts
            </h2>
            {upcomingFeasts.length > 0 ? (
              <div className="bg-white rounded-3xl border border-line overflow-hidden">
                <ul className="divide-y divide-line">
                  {upcomingFeasts.slice(0, 9).map((feastDay) => {
                    const colorData = feastColors[feastDay.date];
                    const colorHex = colorData?.hex || "#356c48";
                    const feastSaint = feastDay.saints[0];
                    return (
                      <li key={feastDay.date} className="px-5 py-4 hover:bg-ivory-2/60 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-primary-700">
                              {new Date(feastDay.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <h4 className="font-serif font-semibold text-ink mt-0.5">
                              {feastDay.saints.map((s) => s.name).join(" & ")}
                            </h4>
                            {feastSaint && feastSaint.type !== "none" && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-primary-50 text-primary-800 text-[0.68rem] font-bold rounded-full border border-primary-200">
                                {saintTypeLabel(feastSaint.type)}
                              </span>
                            )}
                          </div>
                          <span
                            className="flex-shrink-0 w-9 h-9 rounded-full border-2 border-white shadow ring-1 ring-line"
                            style={{ backgroundColor: colorHex }}
                            title={colorData?.color ? `Liturgical colour: ${colorData.color}` : "Liturgical colour"}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-line p-8 text-center text-ink-soft">
                The calendar of feasts will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CLOSING VERSE ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="lit-soft-panel rounded-3xl px-6 py-14 sm:py-16 text-center">
          <p className="font-serif italic font-medium text-ink text-2xl sm:text-3xl md:text-4xl leading-snug max-w-[24ch] mx-auto">
            “{t(home.closingQuote)}”
          </p>
          <p className="mt-5 text-xs tracking-[0.2em] uppercase font-bold text-primary-800">
            {t(home.closingAttribution)}
          </p>
        </div>
      </section>
    </Layout>
  );
}
