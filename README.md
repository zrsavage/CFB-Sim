# Gridiron GM — College Football Manager Sim

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

## Running it

```bash
npm install

# terminal 1
npm run dev:server   # http://localhost:4000

# terminal 2
npm run dev:client   # http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173. Pick a team from the generated 133-team league to
start a career. There's a single save slot; starting a new career
overwrites it.

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
  into weeks with no team double-booked — a ~14-16 week season, same as
  real FBS. Standings track wins/losses within conference and division.
- **Promotion/relegation**: at the end of each season, the two worst-record
  Power teams (nationally) swap places with the two best-record Group of
  Five teams — same roster, new conference, a small prestige shift. A
  Group of Five team really can climb into a Power conference (and a Power
  team can fall out of one) over a multi-year career.
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
      data/        # name lists, the 133-team CFB-like dataset, attributes + backgrounds
      generators/  # league, roster, schedule, recruit class generation
      engine/      # ratings, game sim, progression, recruiting, promotion/relegation
      routes/       # REST endpoints
      store.ts      # JSON save file persistence
      index.ts       # Express app entrypoint
  client/
    src/
      pages/        # Dashboard, Roster, Standings, Schedule, Recruiting, TeamSelect
      components/   # PlayerDetailPanel (scouting report expand row)
      api.ts         # fetch wrapper for the server API
      App.tsx         # tab navigation + top-level state
```

## Ideas for what's next

This is intentionally a base to build on. Natural next steps: position
depth charts and starter assignments, coaching staff/hiring, bowl games or a
conference championship, in-game play-by-play or drive summaries, injuries,
transfer portal as a two-way market, scouting/visits in recruiting, save
slots, historical stats and awards.
