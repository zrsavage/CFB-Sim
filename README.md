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

Open http://localhost:5173. Pick a team from the generated 12-team league to
start a career. There's a single save slot; starting a new career
overwrites it.

## How the sim works

- **League**: 12 teams across two 6-team conferences, each with a 70-man
  roster generated with position-appropriate attributes (overall, potential,
  development trait, class year).
- **Ratings**: each team's offense/defense rating is a weighted average of
  its best players at each position group (starters only).
- **Game sim**: each week's scores are generated from the two teams'
  offense/defense ratings plus home-field advantage and randomness — no
  play-by-play, just believable final scores.
- **Season**: an 11-week round robin (every team plays every other team
  once). Standings track wins/losses.
- **Offseason**: once the season ends, returning players develop based on
  their development trait and class year, seniors graduate, a few players
  transfer out, and a new recruiting class opens up.
- **Recruiting**: browse a class of ~220 high school recruits, extend up to
  25 offers, then advance to Signing Day, where recruits sign based on
  program prestige (plus your offer) versus competing programs. Signees
  join your roster as freshmen, and a new season begins.

## Project layout

```
packages/
  shared/    # types shared by server and client
  server/
    src/
      data/        # name lists used for generation
      generators/  # league, roster, schedule, recruit class generation
      engine/      # ratings, game sim, progression, recruiting resolution
      routes/       # REST endpoints
      store.ts      # JSON save file persistence
      index.ts       # Express app entrypoint
  client/
    src/
      pages/        # Dashboard, Roster, Standings, Schedule, Recruiting, TeamSelect
      api.ts         # fetch wrapper for the server API
      App.tsx         # tab navigation + top-level state
```

## Ideas for what's next

This is intentionally a base to build on. Natural next steps: position
depth charts and starter assignments, coaching staff/hiring, bowl games or a
conference championship, in-game play-by-play or drive summaries, injuries,
transfer portal as a two-way market, scouting/visits in recruiting, save
slots, historical stats and awards.
