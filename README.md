# Gridiron GM — College Football Manager Sim

**Status: Beta.** Fully playable start-to-finish — pick a team, play out a
season through the postseason, recruit, and carry a program across as many
four-year cycles as you like. Rough edges are called out in [Known
limitations](#known-limitations) below; nothing there blocks play.

A text/data-driven college football manager. Pick a program, then run it for
as many four-year cycles as you like: simulate games week to week based on
your roster's ratings, recruit high schoolers each offseason, and watch your
players develop (or bust) and graduate over their four years of eligibility.

There are no game graphics — you manage rosters, watch simulated results,
and make recruiting decisions through tables and simple screens.

## Stack

- **Server**: Node + TypeScript + Express. Game state (league, rosters,
  schedule, recruiting board) lives in a single JSON save file at
  `packages/server/data/save.json`.
- **Client**: React + TypeScript + Vite. Talks to the server over a small
  REST API.
- **Shared types**: `packages/shared/types.ts`, imported by both sides.

## Play it

```bash
npm install
npm run build
npm start
```

Open **http://localhost:4000** — one command, one port, no separate dev
servers. There's a single save slot; use the **New Career** button in the
top bar any time to wipe it and start over (no shell access needed).

## Developing it

For live-reload while working on the code, run the client and server as
separate dev processes instead:

```bash
npm install

# terminal 1
npm run dev:server   # http://localhost:4000

# terminal 2
npm run dev:client   # http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173 for this mode — it hot-reloads on every save.

## How the sim works

- **League**: 133 fictional-but-real-ish programs modeled on the actual
  FBS landscape — 4 "Power" conferences (67 teams), 5 "Group of Five"
  conferences (63 teams), and 3 independents — defined in
  `packages/server/src/data/cfbTeams.ts`. Team names/mascots evoke real
  programs (e.g. Tuscaloosa Crimson, Columbus Buckeyes, Boise Broncos)
  without using real school names, and each starts with a prestige rating
  that shapes its 70-man roster's talent level.
- **Ratings**: each team's offense/defense rating is a weighted average of
  its best players at each position group (starters only).
- **Game sim**: each week's scores are generated from the two teams'
  offense/defense ratings plus home-field advantage and randomness — no
  play-by-play, just believable final scores.
- **Schedule**: conference games (8-9, via a partial round robin) plus
  non-conference games (3-12 depending on division) generated and packed
  into weeks with no team double-booked — a ~12-15 week regular season, same
  as real FBS. Standings track wins/losses within conference and division.
- **Postseason**: after the regular season, each conference's top two teams
  (by conference record) play a Conference Championship game, then the
  teams with winning records get paired up by strength into a slate of
  fictionally-named Bowl Games. Both count toward final record and award a
  small prestige bump to the winner.
- **Promotion/relegation**: after the postseason, the two worst-record Power
  teams (nationally, full season including bowls) swap places with the two
  best-record Group of Five teams — same roster, new conference, a small
  prestige shift. A Group of Five team really can climb into a Power
  conference (and a Power team can fall out of one) over a multi-year
  career.
- **Program Facilities**: spend Program Points (earned each season from
  wins, your Stadium level, and NFL Draft picks produced) on four upgrade
  tracks, each 1-5 levels — Stadium (more income), Training Facility
  (faster player development), Academic Center (fewer transfers), and NIL
  Collective (a stronger recruiting pitch). CPU programs start with
  facility levels roughly matching their prestige, so blue bloods already
  have an edge; the user's team is the only one that spends points.
- **Coaching staff**: a Head Coach, Offensive Coordinator, and Defensive
  Coordinator per team. Coordinator rating nudges the team's offense/defense
  rating directly; the head coach adds to the recruiting pitch alongside the
  NIL Collective. Browse a nationally-available hiring pool and spend
  Program Points to hire into any of the three roles. Each offseason a
  coordinator might get poached by a "bigger job" and is auto-backfilled by
  an interim promotion.
- **Offseason**: once the season ends, returning players develop based on
  their development trait and class year, seniors graduate, a few players
  transfer out, and a new recruiting class opens up.
- **NFL Draft**: every graduating senior gets a draft roll weighted by their
  overall rating (most go undrafted, same as real life — only the highest
  overalls have a real shot). A drafted player's program gets a small,
  round-dependent prestige bump (bigger for Round 1 than Round 7) and its
  all-time draft-pick counter ticks up, so a program that keeps churning out
  NFL talent climbs in prestige over a career — visible in the offseason
  recap and on the Dashboard.
- **Recruiting**: browse a class of ~2,400 high school recruits, extend up
  to 25 offers, then advance to Signing Day, where recruits sign based on
  program prestige (plus your offer) versus competing programs. A signed
  recruit becomes the exact player on your roster — same name, background,
  and attributes you scouted — as a freshman, and a new season begins.
- **Player depth**: every generated player (recruits included) has a
  five-attribute scouting profile specific to their position (e.g. a QB's
  Arm Strength/Accuracy/Awareness/Speed/Poise, a CB's
  Coverage/Speed/Agility/Awareness/Press), a hometown, a fictional high
  school, a personality trait (Vocal Leader, Hot-Head, Film Junkie, ...),
  and an auto-generated scouting blurb. Click any row on the Roster or
  Recruiting screens to expand their report. Attributes shift with a
  player's overall as they develop each offseason, so the profile never
  goes stale.

## Project layout

```
packages/
  shared/    # types shared by server and client
  server/
    src/
      data/        # name lists, the 133-team CFB-like dataset, attributes,
                   # backgrounds, bowl names
      generators/  # league, roster, schedule, recruit class, coach generation
      engine/      # ratings, game sim, progression, recruiting,
                   # promotion/relegation, draft, postseason, facilities, coaching
      routes/       # REST endpoints
      store.ts      # JSON save file persistence
      index.ts       # Express app entrypoint
  client/
    src/
      pages/        # Dashboard, Roster, Standings, Schedule, Recruiting,
                     # TeamSelect, Facilities, Coaching
      components/   # PlayerDetailPanel (scouting report expand row)
      api.ts         # fetch wrapper for the server API
      App.tsx         # tab navigation + top-level state
```

## Known limitations

Nothing here blocks playing a full career — these are rough edges to be
aware of:

- **Schedule game counts vary slightly.** The scheduler packs conference and
  non-conference games into weeks without double-booking any team; a small
  number of teams (independents especially) end up with 1-2 fewer games
  than the target in a given season. Not exploitable, just a minor realism
  gap.
- **Single save slot.** Starting a new career overwrites the old one — there's
  no multi-save support yet.
- **No mid-career pause on facility/coaching moves.** Facility upgrades and
  coaching hires are available any time, not gated to the offseason like
  recruiting is.

## Ideas for what's next

This is intentionally a base to build on. Natural next steps: position
depth charts and starter assignments, in-game play-by-play or drive
summaries, injuries, transfer portal as a two-way market, scouting/visits
in recruiting, save slots, historical stats and awards, a head coach
hot-seat/firing mechanic, and multi-team playoff seeding instead of a flat
bowl slate.
